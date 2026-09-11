-- 0013 Business time.
--
-- Time model:
--   * Instants (created_at, issued_at, published_at, read_at, ...) are
--     timestamptz and always stored in UTC. Display converts them to the
--     viewer's business time zone.
--   * Calendar dates (issue_date, due_date, valid_until, start/end dates,
--     paid_at, discovered_at) are plain `date` values with no time zone.
--   * "Today" for business rules (defaults, overdue, expiry, document year)
--     is the calendar date in Amman, not the server's UTC date. Between
--     00:00 and 03:00 in Amman the UTC date is still yesterday.
-- The database server stays on UTC; nothing depends on its time zone setting.

create or replace function private.business_timezone()
returns text
language sql
immutable
set search_path = ''
as $$ select 'Asia/Amman'::text $$;

create or replace function private.business_today()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone private.business_timezone())::date $$;

revoke all on function private.business_timezone() from public, anon;
revoke all on function private.business_today() from public, anon;
grant execute on function private.business_timezone() to authenticated, service_role;
grant execute on function private.business_today() to authenticated, service_role;

-- Date defaults follow the business calendar.
alter table public.payments alter column paid_at set default private.business_today();
alter table public.findings alter column discovered_at set default private.business_today();

-- Document numbers take their year from the document's own date (issue date),
-- so a document dated 31 December is numbered in that year even if it is
-- issued after midnight UTC, and vice versa.
drop function if exists private.next_document_number(text);
create or replace function private.next_document_number(kind text, _on date default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  _year integer := extract(year from coalesce(_on, private.business_today()))::integer;
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
revoke all on function private.next_document_number(text, date) from public, anon, authenticated;
grant execute on function private.next_document_number(text, date) to service_role;
