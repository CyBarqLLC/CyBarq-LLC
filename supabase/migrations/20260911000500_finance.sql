-- 0005 Finance: document numbering, quotes, invoices, items, payments.
-- Reads need finance.read, writes need finance.write, issuing needs finance.issue.
-- Issued documents are immutable except for controlled status fields.

create table public.document_sequences (
  key text not null,
  year integer not null,
  next_value integer not null default 1,
  primary key (key, year)
);
alter table public.document_sequences enable row level security;
-- No policies on purpose: only private.next_document_number touches this table.

create or replace function private.next_document_number(kind text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  _year integer := extract(year from now())::integer;
  _n integer;
  _prefix text;
begin
  _prefix := case kind
    when 'invoice' then 'INV'
    when 'quote' then 'QT'
    when 'certificate' then 'CERT'
    when 'engagement' then 'SEC'
    when 'project' then 'PRJ'
    else upper(kind) end;
  insert into public.document_sequences (key, year, next_value)
  values (kind, _year, 2)
  on conflict (key, year) do update set next_value = public.document_sequences.next_value + 1
  returning next_value - 1 into _n;
  return format('%s-%s-%s', _prefix, _year, lpad(_n::text, 4, '0'));
end;
$$;
revoke all on function private.next_document_number(text) from public, anon, authenticated;
grant execute on function private.next_document_number(text) to service_role;

-- ---------------------------------------------------------------------------
-- Quotes
-- ---------------------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  language public.locale not null default 'en',
  currency char(3) not null default 'JOD',
  status public.quote_status not null default 'draft',
  issue_date date,
  valid_until date,
  subtotal numeric(14,3) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(14,3) not null default 0,
  total numeric(14,3) not null default 0,
  title_en text,
  title_ar text,
  notes_en text,
  notes_ar text,
  terms_en text,
  terms_ar text,
  pdf_path text,
  created_by uuid references public.profiles(id) on delete set null,
  issued_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotes_client_idx on public.quotes (client_id, status);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null default 0,
  description_en text not null,
  description_ar text,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,3) not null default 0 check (unit_price >= 0),
  amount numeric(14,3) generated always as (round(quantity * unit_price, 3)) stored
);
create index quote_items_quote_idx on public.quote_items (quote_id, position);

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  replaces_invoice_id uuid references public.invoices(id) on delete set null,
  language public.locale not null default 'en',
  currency char(3) not null default 'JOD',
  status public.invoice_status not null default 'draft',
  issue_date date,
  due_date date,
  subtotal numeric(14,3) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(14,3) not null default 0,
  total numeric(14,3) not null default 0,
  amount_paid numeric(14,3) not null default 0,
  title_en text,
  title_ar text,
  notes_en text,
  notes_ar text,
  terms_en text,
  terms_ar text,
  pdf_path text,
  void_reason text,
  voided_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  issued_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_client_idx on public.invoices (client_id, status);
create index invoices_status_due_idx on public.invoices (status, due_date);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 0,
  description_en text not null,
  description_ar text,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,3) not null default 0 check (unit_price >= 0),
  amount numeric(14,3) generated always as (round(quantity * unit_price, 3)) stored
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id, position);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(14,3) not null check (amount > 0),
  paid_at date not null default current_date,
  method text not null default 'bank_transfer' check (method in ('bank_transfer', 'cash', 'card', 'cheque', 'other')),
  reference text,
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index payments_invoice_idx on public.payments (invoice_id);

create trigger quotes_updated_at before update on public.quotes for each row execute function private.set_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Totals: recomputed from items while the document is a draft.
-- ---------------------------------------------------------------------------
create or replace function private.recalc_quote_totals(_quote_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.quotes q
  set subtotal = s.subtotal,
      tax_amount = round(s.subtotal * q.tax_rate / 100, 3),
      total = s.subtotal + round(s.subtotal * q.tax_rate / 100, 3)
  from (select coalesce(sum(amount), 0) as subtotal from public.quote_items where quote_id = _quote_id) s
  where q.id = _quote_id and q.status = 'draft';
$$;

create or replace function private.recalc_invoice_totals(_invoice_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.invoices i
  set subtotal = s.subtotal,
      tax_amount = round(s.subtotal * i.tax_rate / 100, 3),
      total = s.subtotal + round(s.subtotal * i.tax_rate / 100, 3)
  from (select coalesce(sum(amount), 0) as subtotal from public.invoice_items where invoice_id = _invoice_id) s
  where i.id = _invoice_id and i.status = 'draft';
$$;

create or replace function private.quote_items_changed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.recalc_quote_totals(coalesce(new.quote_id, old.quote_id));
  return coalesce(new, old);
end; $$;

create or replace function private.invoice_items_changed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.recalc_invoice_totals(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end; $$;

create trigger quote_items_recalc after insert or update or delete on public.quote_items
  for each row execute function private.quote_items_changed();
create trigger invoice_items_recalc after insert or update or delete on public.invoice_items
  for each row execute function private.invoice_items_changed();

-- Items of an issued document are frozen.
create or replace function private.guard_issued_items()
returns trigger language plpgsql security definer set search_path = '' as $$
declare _status text;
begin
  if (select auth.role()) = 'service_role' then return coalesce(new, old); end if;
  if tg_table_name = 'quote_items' then
    select status::text into _status from public.quotes where id = coalesce(new.quote_id, old.quote_id);
  else
    select status::text into _status from public.invoices where id = coalesce(new.invoice_id, old.invoice_id);
  end if;
  if _status is distinct from 'draft' then
    raise exception 'items of an issued document cannot be changed' using errcode = '42501';
  end if;
  return coalesce(new, old);
end; $$;
create trigger quote_items_guard before insert or update or delete on public.quote_items
  for each row execute function private.guard_issued_items();
create trigger invoice_items_guard before insert or update or delete on public.invoice_items
  for each row execute function private.guard_issued_items();

-- Issued invoices: only status, amount_paid, pdf_path, void fields and updated_at may change.
create or replace function private.guard_issued_invoice()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'service_role' then return new; end if;
  if old.status <> 'draft' then
    if new.number is distinct from old.number
       or new.client_id is distinct from old.client_id
       or new.currency is distinct from old.currency
       or new.subtotal is distinct from old.subtotal
       or new.tax_rate is distinct from old.tax_rate
       or new.tax_amount is distinct from old.tax_amount
       or new.total is distinct from old.total
       or new.issue_date is distinct from old.issue_date
       or new.language is distinct from old.language
       or new.title_en is distinct from old.title_en
       or new.title_ar is distinct from old.title_ar
       or new.notes_en is distinct from old.notes_en
       or new.notes_ar is distinct from old.notes_ar
       or new.terms_en is distinct from old.terms_en
       or new.terms_ar is distinct from old.terms_ar
       or new.issued_at is distinct from old.issued_at
       or new.issued_by is distinct from old.issued_by then
      raise exception 'issued invoices are immutable; void and reissue instead' using errcode = '42501';
    end if;
    if old.status = 'void' and new.status <> 'void' then
      raise exception 'a void invoice cannot be reopened' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
create trigger invoices_guard before update on public.invoices
  for each row execute function private.guard_issued_invoice();

create or replace function private.guard_issued_quote()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'service_role' then return new; end if;
  if old.status <> 'draft' then
    if new.number is distinct from old.number
       or new.client_id is distinct from old.client_id
       or new.currency is distinct from old.currency
       or new.subtotal is distinct from old.subtotal
       or new.tax_rate is distinct from old.tax_rate
       or new.total is distinct from old.total
       or new.issue_date is distinct from old.issue_date
       or new.issued_at is distinct from old.issued_at then
      raise exception 'issued quotes are immutable; void and reissue instead' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
create trigger quotes_guard before update on public.quotes
  for each row execute function private.guard_issued_quote();

-- ---------------------------------------------------------------------------
-- Issue RPCs: optimistic concurrency, no explicit locks. The UPDATE only
-- succeeds when the row is still a draft with the expected updated_at.
-- ---------------------------------------------------------------------------
create or replace function public.issue_invoice(_invoice_id uuid, _expected_updated_at timestamptz, _issue_date date default current_date, _due_date date default null)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.invoices;
  _items integer;
begin
  if not (select private.has_permission('finance.issue')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  select count(*) into _items from public.invoice_items where invoice_id = _invoice_id;
  if _items = 0 then
    raise exception 'an invoice needs at least one line item' using errcode = '22023';
  end if;
  update public.invoices
  set status = 'issued',
      number = coalesce(number, private.next_document_number('invoice')),
      issue_date = _issue_date,
      due_date = coalesce(_due_date, _issue_date + 30),
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
revoke all on function public.issue_invoice(uuid, timestamptz, date, date) from public, anon;
grant execute on function public.issue_invoice(uuid, timestamptz, date, date) to authenticated, service_role;

create or replace function public.issue_quote(_quote_id uuid, _expected_updated_at timestamptz, _issue_date date default current_date, _valid_until date default null)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.quotes;
  _items integer;
begin
  if not (select private.has_permission('finance.issue')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  select count(*) into _items from public.quote_items where quote_id = _quote_id;
  if _items = 0 then
    raise exception 'a quote needs at least one line item' using errcode = '22023';
  end if;
  update public.quotes
  set status = 'sent',
      number = coalesce(number, private.next_document_number('quote')),
      issue_date = _issue_date,
      valid_until = coalesce(_valid_until, _issue_date + 30),
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
revoke all on function public.issue_quote(uuid, timestamptz, date, date) from public, anon;
grant execute on function public.issue_quote(uuid, timestamptz, date, date) to authenticated, service_role;

create or replace function public.void_invoice(_invoice_id uuid, _reason text)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.invoices;
begin
  if not (select private.has_permission('finance.issue')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if coalesce(trim(_reason), '') = '' then
    raise exception 'a reason is required to void an invoice' using errcode = '22023';
  end if;
  update public.invoices
  set status = 'void', void_reason = _reason, voided_at = now()
  where id = _invoice_id and status in ('issued', 'sent', 'overdue', 'partially_paid')
  returning * into _row;
  if _row.id is null then
    raise exception 'invoice cannot be voided in its current state' using errcode = '40001';
  end if;
  return _row;
end;
$$;
revoke all on function public.void_invoice(uuid, text) from public, anon;
grant execute on function public.void_invoice(uuid, text) to authenticated, service_role;

-- Payments keep amount_paid and status in sync.
create or replace function private.apply_payment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare _paid numeric(14,3); _total numeric(14,3); _inv uuid := coalesce(new.invoice_id, old.invoice_id);
begin
  select coalesce(sum(amount), 0) into _paid from public.payments where invoice_id = _inv;
  select total into _total from public.invoices where id = _inv;
  update public.invoices
  set amount_paid = _paid,
      status = case
        when status = 'void' then status
        when _paid >= _total and _total > 0 then 'paid'::public.invoice_status
        when _paid > 0 then 'partially_paid'::public.invoice_status
        when status in ('paid', 'partially_paid') then 'issued'::public.invoice_status
        else status end
  where id = _inv;
  return coalesce(new, old);
end; $$;
create trigger payments_apply after insert or update or delete on public.payments
  for each row execute function private.apply_payment();

create or replace function private.guard_payment()
returns trigger language plpgsql set search_path = '' as $$
declare _status public.invoice_status;
begin
  select status into _status from public.invoices where id = new.invoice_id;
  if _status in ('draft', 'void') then
    raise exception 'payments can only be recorded against issued invoices' using errcode = '42501';
  end if;
  return new;
end; $$;
create trigger payments_guard before insert on public.payments
  for each row execute function private.guard_payment();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

-- Clients see their own sent quotes and issued invoices, never drafts.
create policy quotes_select on public.quotes for select to authenticated
  using (
    (select private.has_permission('finance.read'))
    or (status <> 'draft' and status <> 'void' and client_id in (select private.my_client_ids()))
  );
create policy quotes_insert on public.quotes for insert to authenticated
  with check ((select private.has_permission('finance.write')) and status = 'draft' and created_by = (select auth.uid()));
create policy quotes_update on public.quotes for update to authenticated
  using ((select private.has_permission('finance.write')))
  with check ((select private.has_permission('finance.write')));
create policy quotes_delete on public.quotes for delete to authenticated
  using ((select private.has_permission('finance.write')) and status = 'draft');

create policy quote_items_select on public.quote_items for select to authenticated
  using (
    (select private.has_permission('finance.read'))
    or quote_id in (select q.id from public.quotes q where q.status not in ('draft', 'void') and q.client_id in (select private.my_client_ids()))
  );
create policy quote_items_write on public.quote_items for all to authenticated
  using ((select private.has_permission('finance.write')))
  with check ((select private.has_permission('finance.write')));

create policy invoices_select on public.invoices for select to authenticated
  using (
    (select private.has_permission('finance.read'))
    or (status <> 'draft' and status <> 'void' and client_id in (select private.my_client_ids()))
  );
create policy invoices_insert on public.invoices for insert to authenticated
  with check ((select private.has_permission('finance.write')) and status = 'draft' and created_by = (select auth.uid()));
create policy invoices_update on public.invoices for update to authenticated
  using ((select private.has_permission('finance.write')))
  with check ((select private.has_permission('finance.write')));
create policy invoices_delete on public.invoices for delete to authenticated
  using ((select private.has_permission('finance.write')) and status = 'draft');

create policy invoice_items_select on public.invoice_items for select to authenticated
  using (
    (select private.has_permission('finance.read'))
    or invoice_id in (select i.id from public.invoices i where i.status not in ('draft', 'void') and i.client_id in (select private.my_client_ids()))
  );
create policy invoice_items_write on public.invoice_items for all to authenticated
  using ((select private.has_permission('finance.write')))
  with check ((select private.has_permission('finance.write')));

create policy payments_select on public.payments for select to authenticated
  using (
    (select private.has_permission('finance.read'))
    or invoice_id in (select i.id from public.invoices i where i.status not in ('draft', 'void') and i.client_id in (select private.my_client_ids()))
  );
create policy payments_write on public.payments for all to authenticated
  using ((select private.has_permission('finance.write')))
  with check ((select private.has_permission('finance.write')));
