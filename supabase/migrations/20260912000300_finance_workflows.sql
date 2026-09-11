-- 0014 Finance workflows.
--
-- Every multi-step finance operation now runs as one transaction inside the
-- database, so a document can never be left half saved, and status changes
-- can only happen through the functions that own them:
--   save_quote / save_invoice          draft header + all items, one call
--   issue_quote / issue_invoice        numbering, dates, permission, concurrency
--   set_quote_status / void_quote      sent -> accepted | declined | expired | void
--   void_invoice / mark_invoice_sent   controlled invoice transitions
--   record_payment / remove_payment    payments with the invoice row locked
--   duplicate_quote, convert_quote_to_invoice, create_replacement_invoice
-- Direct table writes by signed-in users are limited to editing drafts; the
-- guards below reject anything else (issued documents, statuses, numbers,
-- totals and paid amounts).
-- Totals are derived from the items once per statement instead of once per
-- item row, and can never be written directly.

-- ---------------------------------------------------------------------------
-- Item triggers: statement level (one recalculation per statement)
-- ---------------------------------------------------------------------------
drop trigger if exists quote_items_recalc on public.quote_items;
drop trigger if exists invoice_items_recalc on public.invoice_items;
drop trigger if exists quote_items_guard on public.quote_items;
drop trigger if exists invoice_items_guard on public.invoice_items;
drop function if exists private.quote_items_changed();
drop function if exists private.invoice_items_changed();
drop function if exists private.guard_issued_items();

-- Draft totals are always derived from the items: the header trigger below
-- recomputes them on every write to a draft, so a total can never be typed in.
create or replace function private.document_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare _subtotal numeric(14,3);
begin
  if tg_op = 'INSERT' then
    if new.status = 'draft' then
      new.subtotal := 0; new.tax_amount := 0; new.total := 0;
    end if;
    return new;
  end if;
  if old.status = 'draft' then
    if tg_table_name = 'quotes' then
      select coalesce(sum(amount), 0) into _subtotal from public.quote_items where quote_id = new.id;
    else
      select coalesce(sum(amount), 0) into _subtotal from public.invoice_items where invoice_id = new.id;
    end if;
    new.subtotal := _subtotal;
    new.tax_amount := round(_subtotal * new.tax_rate / 100, 3);
    new.total := _subtotal + new.tax_amount;
  end if;
  return new;
end;
$$;

create or replace function private.after_document_items()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare _ids uuid[];
begin
  if tg_table_name = 'quote_items' then
    if tg_op = 'INSERT' then
      select array_agg(distinct quote_id) into _ids from new_rows;
    elsif tg_op = 'DELETE' then
      select array_agg(distinct quote_id) into _ids from old_rows;
    else
      select array_agg(distinct x) into _ids from (select quote_id as x from new_rows union select quote_id from old_rows) s;
    end if;
    if _ids is null then return null; end if;
    if exists (select 1 from public.quotes q where q.id = any(_ids) and q.status <> 'draft') then
      raise exception 'items of an issued quote cannot be changed' using errcode = '42501';
    end if;
    -- Touching the draft re-runs private.document_totals once per document.
    update public.quotes set updated_at = now() where id = any(_ids) and status = 'draft';
  else
    if tg_op = 'INSERT' then
      select array_agg(distinct invoice_id) into _ids from new_rows;
    elsif tg_op = 'DELETE' then
      select array_agg(distinct invoice_id) into _ids from old_rows;
    else
      select array_agg(distinct x) into _ids from (select invoice_id as x from new_rows union select invoice_id from old_rows) s;
    end if;
    if _ids is null then return null; end if;
    if exists (select 1 from public.invoices i where i.id = any(_ids) and i.status <> 'draft') then
      raise exception 'items of an issued invoice cannot be changed' using errcode = '42501';
    end if;
    update public.invoices set updated_at = now() where id = any(_ids) and status = 'draft';
  end if;
  return null;
end;
$$;

create trigger quote_items_after_insert after insert on public.quote_items
  referencing new table as new_rows for each statement execute function private.after_document_items();
create trigger quote_items_after_update after update on public.quote_items
  referencing old table as old_rows new table as new_rows for each statement execute function private.after_document_items();
create trigger quote_items_after_delete after delete on public.quote_items
  referencing old table as old_rows for each statement execute function private.after_document_items();
create trigger invoice_items_after_insert after insert on public.invoice_items
  referencing new table as new_rows for each statement execute function private.after_document_items();
create trigger invoice_items_after_update after update on public.invoice_items
  referencing old table as old_rows new table as new_rows for each statement execute function private.after_document_items();
create trigger invoice_items_after_delete after delete on public.invoice_items
  referencing old table as old_rows for each statement execute function private.after_document_items();

drop function if exists private.recalc_quote_totals(uuid);
drop function if exists private.recalc_invoice_totals(uuid);
create trigger quotes_a_totals before insert or update on public.quotes
  for each row execute function private.document_totals();
create trigger invoices_a_totals before insert or update on public.invoices
  for each row execute function private.document_totals();

-- ---------------------------------------------------------------------------
-- Guards for direct writes by signed-in users (current_user = authenticated).
-- Definer functions run as their owner and are not restricted here.
-- ---------------------------------------------------------------------------
create or replace function private.guard_invoice_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.number is not null or new.issued_at is not null or new.issued_by is not null
       or coalesce(new.amount_paid, 0) <> 0 or new.voided_at is not null then
      raise exception 'new invoices start as drafts' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.status <> 'draft' then
    -- Only the cached PDF path may be refreshed on an issued invoice.
    if (to_jsonb(new) - 'pdf_path' - 'updated_at') is distinct from (to_jsonb(old) - 'pdf_path' - 'updated_at') then
      raise exception 'issued invoices cannot be edited; void and issue a replacement instead' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.status <> 'draft' or new.number is distinct from old.number or new.issued_at is distinct from old.issued_at
     or new.issued_by is distinct from old.issued_by or new.amount_paid is distinct from old.amount_paid
     or new.voided_at is distinct from old.voided_at or new.void_reason is distinct from old.void_reason then
    raise exception 'invoice status and number are managed by the platform' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.guard_quote_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.number is not null or new.issued_at is not null or new.issued_by is not null then
      raise exception 'new quotes start as drafts' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.status <> 'draft' then
    if (to_jsonb(new) - 'pdf_path' - 'updated_at') is distinct from (to_jsonb(old) - 'pdf_path' - 'updated_at') then
      raise exception 'issued quotes cannot be edited; void it and issue a new one' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.status <> 'draft' or new.number is distinct from old.number or new.issued_at is distinct from old.issued_at
     or new.issued_by is distinct from old.issued_by then
    raise exception 'quote status and number are managed by the platform' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_guard on public.invoices;
drop trigger if exists quotes_guard on public.quotes;
drop function if exists private.guard_issued_invoice();
drop function if exists private.guard_issued_quote();
create trigger invoices_guard before insert or update on public.invoices
  for each row execute function private.guard_invoice_write();
create trigger quotes_guard before insert or update on public.quotes
  for each row execute function private.guard_quote_write();

-- Payments are recorded and removed through functions only.
drop policy if exists payments_write on public.payments;
drop trigger if exists payments_apply on public.payments;
drop trigger if exists payments_guard on public.payments;
drop function if exists private.apply_payment();
drop function if exists private.guard_payment();

-- Cross references: a document's project belongs to the same client.
create or replace function private.guard_document_project()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p where p.id = new.project_id and p.client_id = new.client_id
  ) then
    raise exception 'the project belongs to a different client' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists quotes_project_client on public.quotes;
create trigger quotes_project_client before insert or update of project_id, client_id on public.quotes
  for each row execute function private.guard_document_project();
drop trigger if exists invoices_project_client on public.invoices;
create trigger invoices_project_client before insert or update of project_id, client_id on public.invoices
  for each row execute function private.guard_document_project();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function private.require_permission(_perm text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.has_permission(_perm)) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
end;
$$;
revoke all on function private.require_permission(text) from public, anon;
grant execute on function private.require_permission(text) to authenticated, service_role;

create or replace function private.document_items_from_json(_items jsonb)
returns table (pos integer, description_en text, description_ar text, quantity numeric, unit_price numeric)
language plpgsql
immutable
set search_path = ''
as $$
declare _n integer;
begin
  if _items is null or jsonb_typeof(_items) <> 'array' then
    raise exception 'line items must be a list' using errcode = '22023';
  end if;
  _n := jsonb_array_length(_items);
  if _n > 100 then
    raise exception 'a document can have at most 100 line items' using errcode = '22023';
  end if;
  return query
  select (e.ordinality - 1)::integer,
         nullif(trim(e.value ->> 'description_en'), ''),
         nullif(trim(e.value ->> 'description_ar'), ''),
         (e.value ->> 'quantity')::numeric,
         (e.value ->> 'unit_price')::numeric
  from jsonb_array_elements(_items) with ordinality as e(value, ordinality);
end;
$$;
revoke all on function private.document_items_from_json(jsonb) from public, anon;
grant execute on function private.document_items_from_json(jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Draft saving
-- ---------------------------------------------------------------------------
create or replace function public.save_quote(
  _header jsonb,
  _items jsonb,
  _id uuid default null,
  _expected_updated_at timestamptz default null
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.quotes;
  _actor uuid := (select auth.uid());
begin
  perform private.require_permission('finance.write');
  if _id is null then
    insert into public.quotes (client_id, project_id, language, currency, tax_rate, title_en, title_ar,
      notes_en, notes_ar, terms_en, terms_ar, valid_until, created_by)
    values (
      (_header ->> 'client_id')::uuid, nullif(_header ->> 'project_id', '')::uuid,
      coalesce(_header ->> 'language', 'en')::public.locale, coalesce(_header ->> 'currency', 'JOD'),
      coalesce((_header ->> 'tax_rate')::numeric, 0),
      nullif(_header ->> 'title_en', ''), nullif(_header ->> 'title_ar', ''),
      nullif(_header ->> 'notes_en', ''), nullif(_header ->> 'notes_ar', ''),
      nullif(_header ->> 'terms_en', ''), nullif(_header ->> 'terms_ar', ''),
      nullif(_header ->> 'valid_until', '')::date, _actor)
    returning * into _row;
  else
    update public.quotes set
      client_id = (_header ->> 'client_id')::uuid,
      project_id = nullif(_header ->> 'project_id', '')::uuid,
      language = coalesce(_header ->> 'language', 'en')::public.locale,
      currency = coalesce(_header ->> 'currency', 'JOD'),
      tax_rate = coalesce((_header ->> 'tax_rate')::numeric, 0),
      title_en = nullif(_header ->> 'title_en', ''), title_ar = nullif(_header ->> 'title_ar', ''),
      notes_en = nullif(_header ->> 'notes_en', ''), notes_ar = nullif(_header ->> 'notes_ar', ''),
      terms_en = nullif(_header ->> 'terms_en', ''), terms_ar = nullif(_header ->> 'terms_ar', ''),
      valid_until = nullif(_header ->> 'valid_until', '')::date
    where id = _id and status = 'draft'
      and (_expected_updated_at is null or updated_at = _expected_updated_at)
    returning * into _row;
    if _row.id is null then
      if exists (select 1 from public.quotes where id = _id and status <> 'draft') then
        raise exception 'issued quotes cannot be edited' using errcode = '40001';
      end if;
      raise exception 'quote was modified or deleted; reload and retry' using errcode = '40001';
    end if;
    delete from public.quote_items where quote_id = _row.id;
  end if;
  insert into public.quote_items (quote_id, position, description_en, description_ar, quantity, unit_price)
  select _row.id, i.pos, i.description_en, i.description_ar, i.quantity, i.unit_price
  from private.document_items_from_json(_items) i;
  select * into _row from public.quotes where id = _row.id;
  return _row;
end;
$$;

create or replace function public.save_invoice(
  _header jsonb,
  _items jsonb,
  _id uuid default null,
  _expected_updated_at timestamptz default null
)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.invoices;
  _actor uuid := (select auth.uid());
begin
  perform private.require_permission('finance.write');
  if _id is null then
    insert into public.invoices (client_id, project_id, language, currency, tax_rate, title_en, title_ar,
      notes_en, notes_ar, terms_en, terms_ar, due_date, created_by)
    values (
      (_header ->> 'client_id')::uuid, nullif(_header ->> 'project_id', '')::uuid,
      coalesce(_header ->> 'language', 'en')::public.locale, coalesce(_header ->> 'currency', 'JOD'),
      coalesce((_header ->> 'tax_rate')::numeric, 0),
      nullif(_header ->> 'title_en', ''), nullif(_header ->> 'title_ar', ''),
      nullif(_header ->> 'notes_en', ''), nullif(_header ->> 'notes_ar', ''),
      nullif(_header ->> 'terms_en', ''), nullif(_header ->> 'terms_ar', ''),
      nullif(_header ->> 'due_date', '')::date, _actor)
    returning * into _row;
  else
    update public.invoices set
      client_id = (_header ->> 'client_id')::uuid,
      project_id = nullif(_header ->> 'project_id', '')::uuid,
      language = coalesce(_header ->> 'language', 'en')::public.locale,
      currency = coalesce(_header ->> 'currency', 'JOD'),
      tax_rate = coalesce((_header ->> 'tax_rate')::numeric, 0),
      title_en = nullif(_header ->> 'title_en', ''), title_ar = nullif(_header ->> 'title_ar', ''),
      notes_en = nullif(_header ->> 'notes_en', ''), notes_ar = nullif(_header ->> 'notes_ar', ''),
      terms_en = nullif(_header ->> 'terms_en', ''), terms_ar = nullif(_header ->> 'terms_ar', ''),
      due_date = nullif(_header ->> 'due_date', '')::date
    where id = _id and status = 'draft'
      and (_expected_updated_at is null or updated_at = _expected_updated_at)
    returning * into _row;
    if _row.id is null then
      if exists (select 1 from public.invoices where id = _id and status <> 'draft') then
        raise exception 'issued invoices cannot be edited' using errcode = '40001';
      end if;
      raise exception 'invoice was modified or deleted; reload and retry' using errcode = '40001';
    end if;
    delete from public.invoice_items where invoice_id = _row.id;
  end if;
  insert into public.invoice_items (invoice_id, position, description_en, description_ar, quantity, unit_price)
  select _row.id, i.pos, i.description_en, i.description_ar, i.quantity, i.unit_price
  from private.document_items_from_json(_items) i;
  select * into _row from public.invoices where id = _row.id;
  return _row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Issuing
-- ---------------------------------------------------------------------------
drop function if exists public.issue_invoice(uuid, timestamptz, date, date);
drop function if exists public.issue_quote(uuid, timestamptz, date, date);

create or replace function public.issue_invoice(_invoice_id uuid, _expected_updated_at timestamptz, _issue_date date default null, _due_date date default null)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.invoices;
  _date date := coalesce(_issue_date, private.business_today());
begin
  perform private.require_permission('finance.issue');
  if not exists (select 1 from public.invoice_items where invoice_id = _invoice_id) then
    raise exception 'an invoice needs at least one line item' using errcode = '22023';
  end if;
  if _due_date is not null and _due_date < _date then
    raise exception 'the due date cannot be before the issue date' using errcode = '22023';
  end if;
  update public.invoices
  set status = 'issued',
      number = coalesce(number, private.next_document_number('invoice', _date)),
      issue_date = _date,
      due_date = coalesce(_due_date, due_date, _date + 30),
      issued_at = now(),
      issued_by = (select auth.uid())
  where id = _invoice_id
    and status = 'draft'
    and updated_at = _expected_updated_at
  returning * into _row;
  if _row.id is null then
    raise exception 'invoice was modified or already issued; reload and retry' using errcode = '40001';
  end if;
  return _row;
end;
$$;

create or replace function public.issue_quote(_quote_id uuid, _expected_updated_at timestamptz, _issue_date date default null, _valid_until date default null)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.quotes;
  _date date := coalesce(_issue_date, private.business_today());
begin
  perform private.require_permission('finance.issue');
  if not exists (select 1 from public.quote_items where quote_id = _quote_id) then
    raise exception 'a quote needs at least one line item' using errcode = '22023';
  end if;
  if _valid_until is not null and _valid_until < _date then
    raise exception 'the validity date cannot be before the issue date' using errcode = '22023';
  end if;
  update public.quotes
  set status = 'sent',
      number = coalesce(number, private.next_document_number('quote', _date)),
      issue_date = _date,
      valid_until = coalesce(_valid_until, valid_until, _date + 30),
      issued_at = now(),
      issued_by = (select auth.uid())
  where id = _quote_id
    and status = 'draft'
    and updated_at = _expected_updated_at
  returning * into _row;
  if _row.id is null then
    raise exception 'quote was modified or already issued; reload and retry' using errcode = '40001';
  end if;
  return _row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Quote outcomes
-- ---------------------------------------------------------------------------
create or replace function public.set_quote_status(_quote_id uuid, _status public.quote_status)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.quotes;
begin
  if _status = 'void' then
    perform private.require_permission('finance.issue');
    update public.quotes set status = 'void', pdf_path = null
    where id = _quote_id and status in ('sent', 'accepted', 'declined', 'expired')
    returning * into _row;
  elsif _status in ('accepted', 'declined', 'expired') then
    perform private.require_permission('finance.write');
    update public.quotes set status = _status
    where id = _quote_id and status = 'sent'
    returning * into _row;
  else
    raise exception 'this status cannot be set directly' using errcode = '22023';
  end if;
  if _row.id is null then
    raise exception 'the quote cannot move to this status from its current state' using errcode = '40001';
  end if;
  return _row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invoice transitions
-- ---------------------------------------------------------------------------
drop function if exists public.void_invoice(uuid, text);
create or replace function public.void_invoice(_invoice_id uuid, _reason text)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.invoices;
begin
  perform private.require_permission('finance.issue');
  if length(coalesce(trim(_reason), '')) < 3 then
    raise exception 'a reason is required to void an invoice' using errcode = '22023';
  end if;
  update public.invoices
  set status = 'void', void_reason = trim(_reason), voided_at = now(), pdf_path = null
  where id = _invoice_id and status in ('issued', 'sent', 'overdue', 'partially_paid')
  returning * into _row;
  if _row.id is null then
    raise exception 'invoice cannot be voided in its current state' using errcode = '40001';
  end if;
  return _row;
end;
$$;

create or replace function public.mark_invoice_sent(_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.invoices;
begin
  perform private.require_permission('finance.write');
  update public.invoices set status = 'sent'
  where id = _invoice_id and status = 'issued'
  returning * into _row;
  if _row.id is null then
    -- Already sent (or further along): sending again is not an error.
    select * into _row from public.invoices where id = _invoice_id and status in ('sent', 'overdue', 'partially_paid', 'paid');
    if _row.id is null then
      raise exception 'only issued invoices can be sent' using errcode = '40001';
    end if;
  end if;
  return _row;
end;
$$;

-- Status after payments, derived from the paid amount and the due date.
create or replace function private.invoice_status_after_payment(_inv public.invoices, _paid numeric)
returns public.invoice_status
language sql
stable
set search_path = ''
as $$
  select case
    when _inv.status = 'void' then 'void'::public.invoice_status
    when _paid >= _inv.total and _inv.total > 0 then 'paid'::public.invoice_status
    when _paid > 0 then 'partially_paid'::public.invoice_status
    when _inv.due_date is not null and _inv.due_date < private.business_today() then 'overdue'::public.invoice_status
    when _inv.status in ('paid', 'partially_paid', 'overdue') then 'issued'::public.invoice_status
    else _inv.status end;
$$;

create or replace function public.record_payment(
  _invoice_id uuid,
  _amount numeric,
  _paid_at date,
  _method text,
  _reference text default null,
  _notes text default null
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  _inv public.invoices;
  _paid numeric(14,3);
  _row public.payments;
begin
  perform private.require_permission('finance.write');
  if _amount is null or _amount <= 0 then
    raise exception 'the amount must be greater than zero' using errcode = '22023';
  end if;
  if _paid_at is null or _paid_at > private.business_today() then
    raise exception 'the payment date cannot be in the future' using errcode = '22023';
  end if;
  -- Lock the invoice so concurrent payments are applied one after another.
  select * into _inv from public.invoices where id = _invoice_id for update;
  if _inv.id is null then
    raise exception 'invoice not found' using errcode = 'P0002';
  end if;
  if _inv.status in ('draft', 'void') then
    raise exception 'payments can only be recorded against issued invoices' using errcode = '22023';
  end if;
  if round(_inv.amount_paid + _amount, 3) > _inv.total then
    raise exception 'the payment is more than the balance due' using errcode = '22023';
  end if;
  insert into public.payments (invoice_id, amount, paid_at, method, reference, notes, recorded_by)
  values (_invoice_id, round(_amount, 3), _paid_at, _method, nullif(trim(_reference), ''), nullif(trim(_notes), ''), (select auth.uid()))
  returning * into _row;
  select coalesce(sum(amount), 0) into _paid from public.payments where invoice_id = _invoice_id;
  update public.invoices
  set amount_paid = _paid, status = private.invoice_status_after_payment(_inv, _paid), pdf_path = null
  where id = _invoice_id;
  return _row;
end;
$$;

create or replace function public.remove_payment(_payment_id uuid, _reason text)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  _pay public.payments;
  _inv public.invoices;
  _paid numeric(14,3);
begin
  perform private.require_permission('finance.issue');
  if length(coalesce(trim(_reason), '')) < 3 then
    raise exception 'a reason is required to remove a payment' using errcode = '22023';
  end if;
  select * into _pay from public.payments where id = _payment_id;
  if _pay.id is null then
    raise exception 'payment not found' using errcode = 'P0002';
  end if;
  select * into _inv from public.invoices where id = _pay.invoice_id for update;
  if _inv.status = 'void' then
    raise exception 'payments on a void invoice cannot be changed' using errcode = '22023';
  end if;
  delete from public.payments where id = _payment_id;
  select coalesce(sum(amount), 0) into _paid from public.payments where invoice_id = _inv.id;
  update public.invoices
  set amount_paid = _paid, status = private.invoice_status_after_payment(_inv, _paid), pdf_path = null
  where id = _inv.id
  returning * into _inv;
  perform private.log_audit('payment.removed', 'invoice', _inv.id::text,
    jsonb_build_object('payment_id', _pay.id, 'amount', _pay.amount, 'currency', _inv.currency, 'reason', trim(_reason)), _inv.client_id);
  return _inv;
end;
$$;

-- ---------------------------------------------------------------------------
-- Copies
-- ---------------------------------------------------------------------------
create or replace function public.duplicate_quote(_quote_id uuid)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare _src public.quotes; _row public.quotes;
begin
  perform private.require_permission('finance.write');
  select * into _src from public.quotes where id = _quote_id;
  if _src.id is null then raise exception 'quote not found' using errcode = 'P0002'; end if;
  insert into public.quotes (client_id, project_id, language, currency, tax_rate, title_en, title_ar,
    notes_en, notes_ar, terms_en, terms_ar, created_by)
  values (_src.client_id, _src.project_id, _src.language, _src.currency, _src.tax_rate, _src.title_en, _src.title_ar,
    _src.notes_en, _src.notes_ar, _src.terms_en, _src.terms_ar, (select auth.uid()))
  returning * into _row;
  insert into public.quote_items (quote_id, position, description_en, description_ar, quantity, unit_price)
  select _row.id, position, description_en, description_ar, quantity, unit_price
  from public.quote_items where quote_id = _src.id order by position;
  select * into _row from public.quotes where id = _row.id;
  return _row;
end;
$$;

create or replace function public.convert_quote_to_invoice(_quote_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare _src public.quotes; _row public.invoices;
begin
  perform private.require_permission('finance.write');
  select * into _src from public.quotes where id = _quote_id for update;
  if _src.id is null then raise exception 'quote not found' using errcode = 'P0002'; end if;
  if _src.status <> 'accepted' then
    raise exception 'only accepted quotes can be converted to an invoice' using errcode = '22023';
  end if;
  -- Idempotent: an existing (non void) invoice for this quote is returned instead of a duplicate.
  select * into _row from public.invoices where quote_id = _src.id and status <> 'void' order by created_at limit 1;
  if _row.id is not null then
    return _row;
  end if;
  insert into public.invoices (client_id, project_id, quote_id, language, currency, tax_rate, title_en, title_ar,
    notes_en, notes_ar, terms_en, terms_ar, created_by)
  values (_src.client_id, _src.project_id, _src.id, _src.language, _src.currency, _src.tax_rate, _src.title_en, _src.title_ar,
    _src.notes_en, _src.notes_ar, _src.terms_en, _src.terms_ar, (select auth.uid()))
  returning * into _row;
  insert into public.invoice_items (invoice_id, position, description_en, description_ar, quantity, unit_price)
  select _row.id, position, description_en, description_ar, quantity, unit_price
  from public.quote_items where quote_id = _src.id order by position;
  select * into _row from public.invoices where id = _row.id;
  return _row;
end;
$$;

create or replace function public.create_replacement_invoice(_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare _src public.invoices; _row public.invoices;
begin
  perform private.require_permission('finance.write');
  select * into _src from public.invoices where id = _invoice_id for update;
  if _src.id is null then raise exception 'invoice not found' using errcode = 'P0002'; end if;
  if _src.status <> 'void' then
    raise exception 'void the invoice before issuing a replacement' using errcode = '22023';
  end if;
  select * into _row from public.invoices where replaces_invoice_id = _src.id and status <> 'void' order by created_at limit 1;
  if _row.id is not null then
    return _row;
  end if;
  insert into public.invoices (client_id, project_id, quote_id, replaces_invoice_id, language, currency, tax_rate,
    title_en, title_ar, notes_en, notes_ar, terms_en, terms_ar, created_by)
  values (_src.client_id, _src.project_id, _src.quote_id, _src.id, _src.language, _src.currency, _src.tax_rate,
    _src.title_en, _src.title_ar, _src.notes_en, _src.notes_ar, _src.terms_en, _src.terms_ar, (select auth.uid()))
  returning * into _row;
  insert into public.invoice_items (invoice_id, position, description_en, description_ar, quantity, unit_price)
  select _row.id, position, description_en, description_ar, quantity, unit_price
  from public.invoice_items where invoice_id = _src.id order by position;
  select * into _row from public.invoices where id = _row.id;
  return _row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Scheduled status sweep (service role, called by the cron route)
-- ---------------------------------------------------------------------------
create or replace function private.sweep_finance_statuses()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare _overdue integer; _expired integer;
begin
  update public.invoices set status = 'overdue'
  where status in ('issued', 'sent') and due_date is not null and due_date < private.business_today();
  get diagnostics _overdue = row_count;
  update public.quotes set status = 'expired'
  where status = 'sent' and valid_until is not null and valid_until < private.business_today();
  get diagnostics _expired = row_count;
  return jsonb_build_object('invoices_overdue', _overdue, 'quotes_expired', _expired);
end;
$$;
revoke all on function private.sweep_finance_statuses() from public, anon, authenticated;
grant execute on function private.sweep_finance_statuses() to service_role;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'public.save_quote(jsonb, jsonb, uuid, timestamptz)',
    'public.save_invoice(jsonb, jsonb, uuid, timestamptz)',
    'public.issue_invoice(uuid, timestamptz, date, date)',
    'public.issue_quote(uuid, timestamptz, date, date)',
    'public.set_quote_status(uuid, public.quote_status)',
    'public.void_invoice(uuid, text)',
    'public.mark_invoice_sent(uuid)',
    'public.record_payment(uuid, numeric, date, text, text, text)',
    'public.remove_payment(uuid, text)',
    'public.duplicate_quote(uuid)',
    'public.convert_quote_to_invoice(uuid)',
    'public.create_replacement_invoice(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;

-- Indexes for the lookups above.
create index if not exists invoices_quote_idx on public.invoices (quote_id) where quote_id is not null;
create index if not exists invoices_replaces_idx on public.invoices (replaces_invoice_id) where replaces_invoice_id is not null;
create index if not exists invoices_project_idx on public.invoices (project_id) where project_id is not null;
create index if not exists quotes_project_idx on public.quotes (project_id) where project_id is not null;
create index if not exists invoices_open_due_idx on public.invoices (due_date) where status in ('issued', 'sent', 'partially_paid', 'overdue');
