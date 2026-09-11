-- 0008 Certificates: training, internship, experience and other certificates
-- with a public verification RPC that reveals only what a verifier needs.

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text unique,
  verification_code text not null unique default encode(extensions.gen_random_bytes(9), 'hex'),
  type public.certificate_type not null default 'training',
  status public.certificate_status not null default 'draft',
  language public.locale not null default 'en',
  recipient_name_en text not null,
  recipient_name_ar text,
  recipient_email extensions.citext,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  title_en text not null,
  title_ar text,
  description_en text,
  description_ar text,
  program_name_en text,
  program_name_ar text,
  role_title_en text,
  role_title_ar text,
  start_date date,
  end_date date,
  hours numeric(6,1),
  issue_date date,
  issued_at timestamptz,
  issued_by uuid references public.profiles(id) on delete set null,
  signatory_name_en text,
  signatory_name_ar text,
  signatory_title_en text,
  signatory_title_ar text,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  revoke_reason text,
  pdf_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index certificates_status_idx on public.certificates (status, issue_date desc);
create index certificates_recipient_idx on public.certificates (recipient_user_id);

create trigger certificates_updated_at before update on public.certificates for each row execute function private.set_updated_at();

-- Issued certificates are immutable except pdf_path and revocation fields.
create or replace function private.guard_issued_certificate()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'service_role' then return new; end if;
  if old.status <> 'draft' then
    if new.certificate_no is distinct from old.certificate_no
       or new.verification_code is distinct from old.verification_code
       or new.type is distinct from old.type
       or new.recipient_name_en is distinct from old.recipient_name_en
       or new.recipient_name_ar is distinct from old.recipient_name_ar
       or new.title_en is distinct from old.title_en
       or new.title_ar is distinct from old.title_ar
       or new.description_en is distinct from old.description_en
       or new.description_ar is distinct from old.description_ar
       or new.start_date is distinct from old.start_date
       or new.end_date is distinct from old.end_date
       or new.issue_date is distinct from old.issue_date
       or new.issued_at is distinct from old.issued_at
       or new.issued_by is distinct from old.issued_by then
      raise exception 'issued certificates are immutable; revoke and issue a new one' using errcode = '42501';
    end if;
    if old.status = 'revoked' and new.status <> 'revoked' then
      raise exception 'a revoked certificate cannot be reinstated' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
create trigger certificates_guard before update on public.certificates
  for each row execute function private.guard_issued_certificate();

create or replace function public.issue_certificate(_certificate_id uuid, _expected_updated_at timestamptz, _issue_date date default current_date)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.certificates;
begin
  if not (select private.has_permission('certificates.issue')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  update public.certificates
  set status = 'issued',
      certificate_no = coalesce(certificate_no, private.next_document_number('certificate')),
      issue_date = _issue_date,
      issued_at = now(),
      issued_by = (select auth.uid())
  where id = _certificate_id and status = 'draft' and updated_at = _expected_updated_at
  returning * into _row;
  if _row.id is null then
    raise exception 'certificate was modified or already issued; reload and retry' using errcode = '40001';
  end if;
  return _row;
end; $$;
revoke all on function public.issue_certificate(uuid, timestamptz, date) from public, anon;
grant execute on function public.issue_certificate(uuid, timestamptz, date) to authenticated, service_role;

create or replace function public.revoke_certificate(_certificate_id uuid, _reason text)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.certificates;
begin
  if not (select private.has_permission('certificates.issue')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if coalesce(trim(_reason), '') = '' then
    raise exception 'a reason is required' using errcode = '22023';
  end if;
  update public.certificates
  set status = 'revoked', revoked_at = now(), revoked_by = (select auth.uid()), revoke_reason = _reason
  where id = _certificate_id and status = 'issued'
  returning * into _row;
  if _row.id is null then
    raise exception 'only issued certificates can be revoked' using errcode = '40001';
  end if;
  return _row;
end; $$;
revoke all on function public.revoke_certificate(uuid, text) from public, anon;
grant execute on function public.revoke_certificate(uuid, text) to authenticated, service_role;

-- Public verification: minimal, read only, callable by anon. Returns no row
-- for unknown codes and for drafts.
create or replace function public.verify_certificate(_code text)
returns table (
  certificate_no text,
  type public.certificate_type,
  status public.certificate_status,
  recipient_name_en text,
  recipient_name_ar text,
  title_en text,
  title_ar text,
  program_name_en text,
  program_name_ar text,
  start_date date,
  end_date date,
  issue_date date,
  revoked_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.certificate_no, c.type, c.status, c.recipient_name_en, c.recipient_name_ar,
         c.title_en, c.title_ar, c.program_name_en, c.program_name_ar,
         c.start_date, c.end_date, c.issue_date, c.revoked_at
  from public.certificates c
  where c.verification_code = lower(trim(_code))
    and c.status in ('issued', 'revoked')
  limit 1;
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;

alter table public.certificates enable row level security;

create policy certificates_select on public.certificates for select to authenticated
  using ((select private.has_permission('certificates.read')) or recipient_user_id = (select auth.uid()));
create policy certificates_insert on public.certificates for insert to authenticated
  with check ((select private.has_permission('certificates.issue')) and status = 'draft' and created_by = (select auth.uid()));
create policy certificates_update on public.certificates for update to authenticated
  using ((select private.has_permission('certificates.issue')))
  with check ((select private.has_permission('certificates.issue')));
create policy certificates_delete on public.certificates for delete to authenticated
  using ((select private.has_permission('certificates.issue')) and status = 'draft');
