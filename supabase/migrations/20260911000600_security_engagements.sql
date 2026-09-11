-- 0006 Cybersecurity engagements: engagements, members, assets (authorised
-- targets), findings, evidence, reports.
-- Access: security.read_all, or engagement membership. Project membership does
-- NOT grant access. Clients only ever see final, client visible reports and the
-- engagement header.

create table public.security_engagements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  type public.engagement_type not null default 'penetration_test',
  status public.engagement_status not null default 'scoping',
  scope_summary text,
  rules_of_engagement text,
  authorised_by_name text,
  authorised_at date,
  authorisation_document_path text,
  start_date date,
  end_date date,
  lead_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index security_engagements_client_idx on public.security_engagements (client_id, status);
create index security_engagements_lead_idx on public.security_engagements (lead_user_id);

create table public.engagement_members (
  engagement_id uuid not null references public.security_engagements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'tester' check (role in ('lead', 'tester', 'reviewer', 'observer')),
  created_at timestamptz not null default now(),
  primary key (engagement_id, user_id)
);
create index engagement_members_user_idx on public.engagement_members (user_id);

create table public.engagement_assets (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.security_engagements(id) on delete cascade,
  name text not null,
  type public.asset_type not null default 'web_app',
  identifier text,
  in_scope boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);
create index engagement_assets_engagement_idx on public.engagement_assets (engagement_id);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.security_engagements(id) on delete cascade,
  asset_id uuid references public.engagement_assets(id) on delete set null,
  ref_code text not null,
  title text not null,
  severity public.finding_severity not null default 'medium',
  cvss_score numeric(3,1) check (cvss_score is null or (cvss_score >= 0 and cvss_score <= 10)),
  status public.finding_status not null default 'open',
  description text,
  impact text,
  evidence_summary text,
  recommendation text,
  discovered_at date default current_date,
  remediated_at date,
  retested_at date,
  retest_result text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id, ref_code)
);
create index findings_engagement_severity_idx on public.findings (engagement_id, severity, status);

create table public.finding_evidence (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings(id) on delete cascade,
  storage_path text not null unique,
  caption text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index finding_evidence_finding_idx on public.finding_evidence (finding_id);

create table public.engagement_reports (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.security_engagements(id) on delete cascade,
  version integer not null default 1,
  title text not null,
  storage_path text not null unique,
  status public.report_status not null default 'draft',
  client_visible boolean not null default false,
  issued_at timestamptz,
  issued_by uuid references public.profiles(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (engagement_id, version)
);

create trigger security_engagements_updated_at before update on public.security_engagements for each row execute function private.set_updated_at();
create trigger findings_updated_at before update on public.findings for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function private.my_engagement_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select em.engagement_id from public.engagement_members em where em.user_id = (select auth.uid())
  union
  select e.id from public.security_engagements e where e.lead_user_id = (select auth.uid());
$$;

create or replace function private.my_client_engagement_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select e.id from public.security_engagements e
  where e.client_id in (select private.my_client_ids())
    and e.status <> 'scoping' and e.status <> 'cancelled';
$$;

revoke all on function private.my_engagement_ids() from public, anon;
revoke all on function private.my_client_engagement_ids() from public, anon;
grant execute on function private.my_engagement_ids() to authenticated, service_role;
grant execute on function private.my_client_engagement_ids() to authenticated, service_role;

-- Final reports are frozen.
create or replace function private.guard_final_report()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.role()) = 'service_role' then return new; end if;
  if old.status = 'final' and (
       new.storage_path is distinct from old.storage_path
    or new.version is distinct from old.version
    or new.status is distinct from old.status
    or new.issued_at is distinct from old.issued_at
  ) then
    raise exception 'a final report is immutable; upload a new version instead' using errcode = '42501';
  end if;
  if new.status = 'final' and old.status <> 'final' then
    new.issued_at := now();
    new.issued_by := (select auth.uid());
    if not (select private.has_permission('security.report')) then
      raise exception 'permission denied' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
create trigger engagement_reports_guard before update on public.engagement_reports
  for each row execute function private.guard_final_report();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.security_engagements enable row level security;
alter table public.engagement_members enable row level security;
alter table public.engagement_assets enable row level security;
alter table public.findings enable row level security;
alter table public.finding_evidence enable row level security;
alter table public.engagement_reports enable row level security;

create policy engagements_select on public.security_engagements for select to authenticated
  using (
    (select private.has_permission('security.read_all'))
    or id in (select private.my_engagement_ids())
    or id in (select private.my_client_engagement_ids())
  );
create policy engagements_insert on public.security_engagements for insert to authenticated
  with check ((select private.has_permission('security.write')));
create policy engagements_update on public.security_engagements for update to authenticated
  using ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or id in (select private.my_engagement_ids())))
  with check ((select private.has_permission('security.write')));
create policy engagements_delete on public.security_engagements for delete to authenticated
  using ((select private.has_permission('security.write')) and (select private.has_permission('security.read_all')) and status = 'scoping');

create policy engagement_members_select on public.engagement_members for select to authenticated
  using ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids()));
create policy engagement_members_write on public.engagement_members for all to authenticated
  using ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())))
  with check ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())));

create policy engagement_assets_select on public.engagement_assets for select to authenticated
  using ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids()));
create policy engagement_assets_write on public.engagement_assets for all to authenticated
  using ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())))
  with check ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())));

-- findings: internal only, membership or read_all.
create policy findings_select on public.findings for select to authenticated
  using ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids()));
create policy findings_insert on public.findings for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids()))
  );
create policy findings_update on public.findings for update to authenticated
  using ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())))
  with check ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())));
create policy findings_delete on public.findings for delete to authenticated
  using ((select private.has_permission('security.write')) and (select private.has_permission('security.read_all')));

create policy finding_evidence_select on public.finding_evidence for select to authenticated
  using (
    (select private.has_permission('security.read_all'))
    or finding_id in (select f.id from public.findings f where f.engagement_id in (select private.my_engagement_ids()))
  );
create policy finding_evidence_write on public.finding_evidence for all to authenticated
  using (
    (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all'))
      or finding_id in (select f.id from public.findings f where f.engagement_id in (select private.my_engagement_ids())))
  )
  with check (
    (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all'))
      or finding_id in (select f.id from public.findings f where f.engagement_id in (select private.my_engagement_ids())))
  );

-- reports: team sees all versions; clients see final client visible only.
create policy engagement_reports_select on public.engagement_reports for select to authenticated
  using (
    (select private.has_permission('security.read_all'))
    or engagement_id in (select private.my_engagement_ids())
    or (status = 'final' and client_visible and engagement_id in (select private.my_client_engagement_ids()))
  );
create policy engagement_reports_insert on public.engagement_reports for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids()))
  );
create policy engagement_reports_update on public.engagement_reports for update to authenticated
  using ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())))
  with check ((select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())));
create policy engagement_reports_delete on public.engagement_reports for delete to authenticated
  using (status = 'draft' and (select private.has_permission('security.write')) and ((select private.has_permission('security.read_all')) or engagement_id in (select private.my_engagement_ids())));
