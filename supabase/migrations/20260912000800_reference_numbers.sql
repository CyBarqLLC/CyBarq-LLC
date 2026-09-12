-- 0019 One reference scheme for the platform.
--
-- Every record a person may need to quote back to us now carries a reference
-- in the same shape: CyB-<KIND>-<six digits>, for example CyB-INV-000050.
--
-- The series is continuous per kind rather than per year. A reference then
-- identifies one record for good: it never repeats when a new year starts, it
-- carries no information that can go stale, and the six digits leave room for
-- a very long time without ever changing width.
--
-- Sub-records keep their local identifiers, because they are only ever read
-- beside their parent: a finding stays F-3 inside its engagement, an invoice
-- line stays a line number. Everything that stands on its own gets a
-- reference.
--
-- This replaces the per-year document numbers (INV-2026-0001) from here on.
-- Nothing already issued is rewritten: a number a client and an accountant
-- already hold is theirs, not ours to restate. The new series simply continues
-- the count, so the invoice after INV-2026-0003 is CyB-INV-000004.

-- ---------------------------------------------------------------------------
-- The counters
-- ---------------------------------------------------------------------------

create table if not exists public.reference_sequences (
  kind text primary key,
  next_value bigint not null default 1 check (next_value > 0),
  updated_at timestamptz not null default now()
);

comment on table public.reference_sequences is 'One counter per reference kind. Only private.next_reference() reads or writes it.';

-- No policies on purpose: the definer functions below are the only callers, so
-- row level security with no policy keeps the table closed to every API role.
alter table public.reference_sequences enable row level security;

-- ---------------------------------------------------------------------------
-- The scheme
-- ---------------------------------------------------------------------------

/* The three letters of each kind. Kept here, next to the counters, so the
   database and the application can never drift into two different schemes;
   src/lib/references.ts mirrors this list and is covered by a test. */
create or replace function private.reference_code(_kind text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case _kind
    when 'invoice' then 'INV'
    when 'quote' then 'QTE'
    when 'payment' then 'PAY'
    when 'certificate' then 'CRT'
    when 'project' then 'PRJ'
    when 'engagement' then 'SEC'
    when 'report' then 'RPT'
    when 'client' then 'CLT'
    when 'employee' then 'EMP'
    when 'task' then 'TSK'
    when 'support' then 'SUP'
    when 'enquiry' then 'MSG'
  end;
$$;

/* The next reference of a kind. One statement takes the counter, so parallel
   callers can never be handed the same number. */
create or replace function private.next_reference(_kind text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  _code text := private.reference_code(_kind);
  _n bigint;
begin
  if _code is null then
    raise exception 'unknown reference kind %', _kind using errcode = '22023';
  end if;
  insert into public.reference_sequences as s (kind, next_value)
  values (_kind, 2)
  on conflict (kind) do update set next_value = s.next_value + 1, updated_at = now()
  returning s.next_value - 1 into _n;
  return format('CyB-%s-%s', _code, lpad(_n::text, 6, '0'));
end;
$$;

revoke all on function private.next_reference(text) from public, anon, authenticated;
grant execute on function private.next_reference(text) to service_role;

/* The next reference of a kind that is not already in use. A project or an
   engagement may be given a code by hand, and that code can happen to look
   like a generated one, so the counter alone is not proof that a value is
   free. Skipping a taken value costs nothing: the series is a supply of
   references, not a count of records. */
create or replace function private.next_free_reference(_kind text, _table regclass, _column text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  _candidate text;
  _taken boolean;
  _tries integer := 0;
begin
  loop
    _candidate := private.next_reference(_kind);
    execute format('select exists (select 1 from %s where %I = $1)', _table::text, _column) into _taken using _candidate;
    exit when not _taken;
    _tries := _tries + 1;
    if _tries > 1000 then
      raise exception 'no free reference for kind % in %', _kind, _table using errcode = '55000';
    end if;
  end loop;
  return _candidate;
end;
$$;

revoke all on function private.next_free_reference(text, regclass, text) from public, anon, authenticated;
grant execute on function private.next_free_reference(text, regclass, text) to service_role;

/* Fills a record's reference on insert when the caller left it empty, which is
   the normal case: `tg_argv[0]` is the kind and `tg_argv[1]` the column. A
   value supplied by hand is kept, so a record migrated from elsewhere can
   carry the reference it already had. */
create or replace function private.assign_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _column text := tg_argv[1];
  _row jsonb := to_jsonb(new);
begin
  if coalesce(btrim(_row ->> _column), '') = '' then
    new := jsonb_populate_record(new, _row || jsonb_build_object(_column, private.next_free_reference(tg_argv[0], tg_relid::regclass, _column)));
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Records that had no reference of their own
-- ---------------------------------------------------------------------------

alter table public.clients add column if not exists reference text;
alter table public.tasks add column if not exists reference text;
alter table public.support_requests add column if not exists reference text;
alter table public.engagement_reports add column if not exists reference text;
alter table public.contact_submissions add column if not exists reference text;
/* payments.reference is the client's own bank or transfer reference, so the
   platform's own one is the receipt number. */
alter table public.payments add column if not exists receipt_no text;

comment on column public.clients.reference is 'CyB-CLT-000000. Assigned on insert.';
comment on column public.tasks.reference is 'CyB-TSK-000000. Assigned on insert.';
comment on column public.support_requests.reference is 'CyB-SUP-000000. Assigned on insert.';
comment on column public.engagement_reports.reference is 'CyB-RPT-000000. Assigned on insert.';
comment on column public.contact_submissions.reference is 'CyB-MSG-000000. Assigned on insert, quoted back to the sender.';
comment on column public.payments.receipt_no is 'CyB-PAY-000000. Assigned on insert; payments.reference stays the payer''s own reference.';

-- ---------------------------------------------------------------------------
-- Starting the series where the books already are
-- ---------------------------------------------------------------------------

/* Nothing that already carries a number is rewritten. An invoice, a quotation
   or a certificate that has been issued is in someone else's records too: its
   number is what the client, the accountant and the tax file already know, and
   a platform that quietly restates it is worse than one with two formats in
   its history. Project and engagement codes are printed on those documents, so
   they stay as well.

   The new series therefore starts where the old count ended: with three
   invoices already issued, the next one is CyB-INV-000004. Records that never
   had a reference of their own — clients, tasks, payments, enquiries — are
   given one now, in the order they were created. */
create or replace function private.seed_reference_sequence(_kind text, _table text, _column text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  _taken bigint;
begin
  execute format('select count(*) from public.%I where coalesce(btrim(%I::text), '''') <> ''''', _table, _column) into _taken;
  insert into public.reference_sequences (kind, next_value)
  values (_kind, _taken + 1)
  on conflict (kind) do update set next_value = greatest(public.reference_sequences.next_value, excluded.next_value), updated_at = now();
end;
$$;

/* Gives every record that has no reference one, continuing past the records
   that already carry something, then moves the counter past them all. */
create or replace function private.backfill_references(_kind text, _table text, _column text, _key text, _order text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  _code text := private.reference_code(_kind);
  _offset bigint;
begin
  execute format('select count(*) from public.%I where coalesce(btrim(%I::text), '''') <> ''''', _table, _column) into _offset;
  execute format(
    'with numbered as (select %I as k, %s + row_number() over (order by %s) as n from public.%I where coalesce(btrim(%I::text), '''') = '''')'
    ' update public.%I t set %I = %L || lpad(numbered.n::text, 6, ''0'') from numbered where numbered.k = t.%I',
    _key, _offset::text, _order, _table, _column,
    _table, _column, 'CyB-' || _code || '-', _key);
  perform private.seed_reference_sequence(_kind, _table, _column);
end;
$$;

select private.backfill_references('client', 'clients', 'reference', 'id', 'created_at, id');
select private.backfill_references('task', 'tasks', 'reference', 'id', 'created_at, id');
select private.backfill_references('support', 'support_requests', 'reference', 'id', 'created_at, id');
select private.backfill_references('report', 'engagement_reports', 'reference', 'id', 'created_at, id');
select private.backfill_references('enquiry', 'contact_submissions', 'reference', 'id', 'created_at, id');
select private.backfill_references('payment', 'payments', 'receipt_no', 'id', 'paid_at, created_at, id');
select private.backfill_references('employee', 'employees', 'employee_no', 'user_id', 'created_at, user_id');
select private.backfill_references('project', 'projects', 'code', 'id', 'created_at, id');
select private.backfill_references('engagement', 'security_engagements', 'code', 'id', 'created_at, id');

/* Documents keep the numbers they were issued under; only the counter moves,
   so the next one issued carries on from where the old series stopped. An
   unissued draft is not counted: it has no number to keep. */
select private.seed_reference_sequence('invoice', 'invoices', 'number');
select private.seed_reference_sequence('quote', 'quotes', 'number');
select private.seed_reference_sequence('certificate', 'certificates', 'certificate_no');

drop function private.backfill_references(text, text, text, text, text);

-- ---------------------------------------------------------------------------
-- Uniqueness, then assignment on insert
-- ---------------------------------------------------------------------------

create unique index if not exists clients_reference_key on public.clients (reference);
create unique index if not exists tasks_reference_key on public.tasks (reference);
create unique index if not exists support_requests_reference_key on public.support_requests (reference);
create unique index if not exists engagement_reports_reference_key on public.engagement_reports (reference);
create unique index if not exists contact_submissions_reference_key on public.contact_submissions (reference);
create unique index if not exists payments_receipt_no_key on public.payments (receipt_no);

create or replace trigger clients_reference before insert on public.clients
  for each row execute function private.assign_reference('client', 'reference');
create or replace trigger tasks_reference before insert on public.tasks
  for each row execute function private.assign_reference('task', 'reference');
create or replace trigger support_requests_reference before insert on public.support_requests
  for each row execute function private.assign_reference('support', 'reference');
create or replace trigger engagement_reports_reference before insert on public.engagement_reports
  for each row execute function private.assign_reference('report', 'reference');
create or replace trigger contact_submissions_reference before insert on public.contact_submissions
  for each row execute function private.assign_reference('enquiry', 'reference');
create or replace trigger payments_receipt_no before insert on public.payments
  for each row execute function private.assign_reference('payment', 'receipt_no');
create or replace trigger employees_employee_no before insert on public.employees
  for each row execute function private.assign_reference('employee', 'employee_no');
/* Projects and engagements keep an editable code — a team that already refers
   to a piece of work by its own name can type it — but one is now assigned
   when the field is left empty, instead of the random suggestion the form
   used to make. */
create or replace trigger projects_code before insert on public.projects
  for each row execute function private.assign_reference('project', 'code');
create or replace trigger security_engagements_code before insert on public.security_engagements
  for each row execute function private.assign_reference('engagement', 'code');

-- ---------------------------------------------------------------------------
-- Documents take their number from the same scheme
-- ---------------------------------------------------------------------------

/* The number of an invoice, a quotation or a certificate is still assigned at
   the moment it is issued, never when the draft is created: an unissued draft
   must not consume a number. What changes is only where the number comes from.
   It no longer depends on the issue date, so back-dating a document within the
   open period can no longer disturb the series. */

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
      number = coalesce(number, private.next_free_reference('invoice', 'public.invoices', 'number')),
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
      number = coalesce(number, private.next_free_reference('quote', 'public.quotes', 'number')),
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

create or replace function public.issue_certificate(_certificate_id uuid, _expected_updated_at timestamptz, _issue_date date default null)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.certificates;
  _date date := coalesce(_issue_date, private.business_today());
begin
  perform private.require_permission('certificates.issue');
  update public.certificates
  set status = 'issued',
      certificate_no = coalesce(certificate_no, private.next_free_reference('certificate', 'public.certificates', 'certificate_no')),
      issue_date = _date,
      issued_at = now(),
      issued_by = (select auth.uid())
  where id = _certificate_id and status = 'draft' and updated_at = _expected_updated_at
  returning * into _row;
  if _row.id is null then
    raise exception 'certificate was modified or already issued; reload and retry' using errcode = '40001';
  end if;
  return _row;
end;
$$;

-- The per-year scheme has no callers left.
drop function if exists private.next_document_number(text, date);
drop function if exists private.next_document_number(text);
drop table if exists public.document_sequences;
