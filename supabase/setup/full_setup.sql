-- CyBarq platform: full schema setup (all migrations in order) + first super admin bootstrap.
-- Generated from supabase/migrations. Runs in one transaction: all or nothing.
begin;

-- ====================================================================
-- 20260911000100_foundation.sql
-- ====================================================================
-- 0001 Foundation: extensions, private schema, shared helpers, enums.
-- Everything in `private` is unreachable through PostgREST and is used by RLS
-- policies and by other database functions only.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_kind as enum ('employee', 'client');
create type public.practice as enum ('cybersecurity', 'development', 'ai', 'infrastructure', 'mixed');
create type public.project_status as enum ('draft', 'planned', 'active', 'on_hold', 'completed', 'cancelled');
create type public.project_member_role as enum ('manager', 'member', 'viewer');
create type public.milestone_status as enum ('planned', 'in_progress', 'completed');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done', 'cancelled');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.employment_status as enum ('active', 'inactive', 'on_leave', 'ended');
create type public.document_kind as enum ('contract', 'id', 'certificate', 'experience_certificate', 'training_certificate', 'other');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'void');
create type public.invoice_status as enum ('draft', 'issued', 'sent', 'partially_paid', 'paid', 'overdue', 'void');
create type public.engagement_type as enum ('penetration_test', 'compromise_assessment', 'dfir', 'security_assessment', 'red_team', 'consulting', 'training');
create type public.engagement_status as enum ('scoping', 'authorised', 'active', 'reporting', 'remediation', 'retest', 'closed', 'cancelled');
create type public.asset_type as enum ('web_app', 'api', 'host', 'network', 'cloud', 'mobile_app', 'identity', 'other');
create type public.finding_severity as enum ('informational', 'low', 'medium', 'high', 'critical');
create type public.finding_status as enum ('open', 'in_remediation', 'remediated', 'retest_pending', 'verified', 'accepted_risk', 'false_positive');
create type public.report_status as enum ('draft', 'final');
create type public.content_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');
create type public.language_status as enum ('en_only', 'ar_only', 'both');
create type public.certificate_type as enum ('training', 'internship', 'experience', 'appreciation', 'other');
create type public.certificate_status as enum ('draft', 'issued', 'revoked');
create type public.support_status as enum ('open', 'in_progress', 'waiting_client', 'resolved', 'closed');
create type public.locale as enum ('en', 'ar');

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9؀-ۿ]+', '-', 'g'));
$$;

-- ====================================================================
-- 20260911000200_identity.sql
-- ====================================================================
-- 0002 Identity: profiles, roles, permissions, user roles, client membership,
-- and the private helper functions every RLS policy is built on.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext not null unique,
  full_name text not null default '',
  full_name_ar text,
  kind public.user_kind not null default 'employee',
  locale public.locale not null default 'en',
  avatar_path text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'One row per auth user. Never stores credentials.';

create table public.roles (
  key text primary key,
  name_en text not null,
  name_ar text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.permissions (
  key text primary key,
  description text not null
);

create table public.role_permissions (
  role_key text not null references public.roles(key) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_key text not null references public.roles(key) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_key)
);
create index user_roles_role_idx on public.user_roles (role_key);

-- Clients live in 0004 but client membership is identity, so the table is
-- created here with a deferred FK added in 0004.
create table public.client_users (
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, client_id)
);
create index client_users_client_idx on public.client_users (client_id);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, private schema, request constant)
-- All of them derive the subject from auth.uid() and never accept a user id,
-- so they cannot be used to inspect other users.
-- ---------------------------------------------------------------------------
create or replace function private.has_permission(perm text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_key = ur.role_key
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and rp.permission_key = perm
      and p.is_active
  );
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid()) and ur.role_key = 'super_admin' and p.is_active
  );
$$;

create or replace function private.is_employee()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.kind = 'employee' and p.is_active
  );
$$;

create or replace function private.is_client_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.kind = 'client' and p.is_active
  );
$$;

create or replace function private.my_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select cu.client_id
  from public.client_users cu
  join public.profiles p on p.id = cu.user_id
  where cu.user_id = (select auth.uid()) and cu.is_active and p.is_active;
$$;

revoke all on function private.has_permission(text) from public, anon;
revoke all on function private.is_super_admin() from public, anon;
revoke all on function private.is_employee() from public, anon;
revoke all on function private.is_client_user() from public, anon;
revoke all on function private.my_client_ids() from public, anon;
grant execute on function private.has_permission(text) to authenticated, service_role;
grant execute on function private.is_super_admin() to authenticated, service_role;
grant execute on function private.is_employee() to authenticated, service_role;
grant execute on function private.is_client_user() to authenticated, service_role;
grant execute on function private.my_client_ids() to authenticated, service_role;

-- Public wrapper used by the application layer to load the permission set once
-- per request. Returns only the caller's own permissions.
create or replace function public.my_permissions()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select distinct rp.permission_key
  from public.user_roles ur
  join public.role_permissions rp on rp.role_key = ur.role_key
  join public.profiles p on p.id = ur.user_id
  where ur.user_id = (select auth.uid()) and p.is_active;
$$;
revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Auth hook: create a profile when an auth user is created.
-- Accounts are provisioned by admins (no self registration); the metadata
-- carries the kind and names chosen at provisioning time.
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, full_name_ar, kind, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'full_name_ar',
    coalesce((new.raw_user_meta_data ->> 'kind')::public.user_kind, 'employee'),
    coalesce((new.raw_user_meta_data ->> 'locale')::public.locale, 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Column protection: users may edit their own profile but never their kind,
-- email, active flag, or someone else's row.
-- ---------------------------------------------------------------------------
create or replace function private.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;
  if not (select private.has_permission('users.manage')) then
    if new.kind is distinct from old.kind
       or new.email is distinct from old.email
       or new.is_active is distinct from old.is_active then
      raise exception 'not allowed to change protected profile fields' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect before update on public.profiles
  for each row execute function private.protect_profile_columns();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- Only a super admin can grant or revoke the super_admin role.
create or replace function private.protect_super_admin_grant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return coalesce(new, old);
  end if;
  if coalesce(new.role_key, old.role_key) = 'super_admin' and not (select private.is_super_admin()) then
    raise exception 'only a super admin can change super admin membership' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger user_roles_protect_super_admin
  before insert or update or delete on public.user_roles
  for each row execute function private.protect_super_admin_grant();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.client_users enable row level security;

-- profiles: own row, all employee rows for employees, everything for user managers.
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.has_permission('users.manage'))
    or (kind = 'employee' and (select private.is_employee()))
  );
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select private.has_permission('users.manage')))
  with check (id = (select auth.uid()) or (select private.has_permission('users.manage')));
-- No insert or delete policies: rows are created by the auth trigger and removed with the auth user.

-- roles and permissions are reference data for signed in users.
create policy roles_select on public.roles for select to authenticated using (true);
create policy roles_write on public.roles for all to authenticated
  using ((select private.has_permission('roles.manage')))
  with check ((select private.has_permission('roles.manage')));
create policy permissions_select on public.permissions for select to authenticated using (true);
create policy role_permissions_select on public.role_permissions for select to authenticated using (true);
create policy role_permissions_write on public.role_permissions for all to authenticated
  using ((select private.has_permission('roles.manage')))
  with check ((select private.has_permission('roles.manage')));

create policy user_roles_select on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.has_permission('users.manage')));
create policy user_roles_write on public.user_roles for all to authenticated
  using ((select private.has_permission('users.manage')))
  with check ((select private.has_permission('users.manage')));

create policy client_users_select on public.client_users for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_permission('clients.read'))
    or client_id in (select private.my_client_ids())
  );
create policy client_users_write on public.client_users for all to authenticated
  using ((select private.has_permission('clients.write')))
  with check ((select private.has_permission('clients.write')));

-- ====================================================================
-- 20260911000300_organisation.sql
-- ====================================================================
-- 0003 Organisation and HR: departments, teams, employees, employee documents.
-- HR data is gated by hr.read / hr.write. Every employee sees a limited
-- directory through the employee_directory view and their own full record.

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  name_en text not null,
  name_ar text not null,
  lead_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (team_id, user_id)
);

create table public.employees (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  employee_no text unique,
  department_id uuid references public.departments(id) on delete set null,
  job_title_en text not null default '',
  job_title_ar text,
  employment_status public.employment_status not null default 'active',
  start_date date,
  end_date date,
  work_phone text,
  work_email extensions.citext,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index employees_department_idx on public.employees (department_id);

create table public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_user_id uuid not null references public.employees(user_id) on delete cascade,
  kind public.document_kind not null default 'other',
  title text not null,
  storage_path text not null unique,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index employee_documents_employee_idx on public.employee_documents (employee_user_id);

create trigger employees_updated_at before update on public.employees
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Directory view: the only employee data ordinary employees can list.
-- Owned by postgres so it bypasses RLS on employees; its own WHERE restricts
-- it to signed in employees.
-- ---------------------------------------------------------------------------
create view public.employee_directory
with (security_barrier = true) as
  select
    e.user_id,
    p.full_name,
    p.full_name_ar,
    p.email,
    p.avatar_path,
    e.job_title_en,
    e.job_title_ar,
    e.department_id,
    d.name_en as department_name_en,
    d.name_ar as department_name_ar,
    e.employment_status,
    e.work_phone
  from public.employees e
  join public.profiles p on p.id = e.user_id
  left join public.departments d on d.id = e.department_id
  where p.is_active
    and e.employment_status in ('active', 'on_leave')
    and (select private.is_employee());

revoke all on public.employee_directory from public, anon;
grant select on public.employee_directory to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.employees enable row level security;
alter table public.employee_documents enable row level security;

create policy departments_select on public.departments for select to authenticated
  using ((select private.is_employee()));
create policy departments_write on public.departments for all to authenticated
  using ((select private.has_permission('hr.write')))
  with check ((select private.has_permission('hr.write')));

create policy teams_select on public.teams for select to authenticated
  using ((select private.is_employee()));
create policy teams_write on public.teams for all to authenticated
  using ((select private.has_permission('hr.write')))
  with check ((select private.has_permission('hr.write')));

create policy team_members_select on public.team_members for select to authenticated
  using ((select private.is_employee()));
create policy team_members_write on public.team_members for all to authenticated
  using ((select private.has_permission('hr.write')))
  with check ((select private.has_permission('hr.write')));

create policy employees_select on public.employees for select to authenticated
  using (user_id = (select auth.uid()) or (select private.has_permission('hr.read')));
create policy employees_insert on public.employees for insert to authenticated
  with check ((select private.has_permission('hr.write')));
create policy employees_update on public.employees for update to authenticated
  using ((select private.has_permission('hr.write')))
  with check ((select private.has_permission('hr.write')));
create policy employees_delete on public.employees for delete to authenticated
  using ((select private.has_permission('hr.write')));

create policy employee_documents_select on public.employee_documents for select to authenticated
  using (employee_user_id = (select auth.uid()) or (select private.has_permission('hr.read')));
create policy employee_documents_write on public.employee_documents for all to authenticated
  using ((select private.has_permission('hr.write')))
  with check ((select private.has_permission('hr.write')));

-- ====================================================================
-- 20260911000400_clients_projects.sql
-- ====================================================================
-- 0004 Clients and project management: clients, contacts, projects, members,
-- milestones, tasks, comments, updates, documents, support requests, activity.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text,
  legal_name text,
  country text,
  city text,
  address text,
  tax_number text,
  website text,
  primary_contact_name text,
  primary_contact_email extensions.citext,
  phone text,
  status text not null default 'active' check (status in ('prospect', 'active', 'inactive')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_users
  add constraint client_users_client_fk foreign key (client_id) references public.clients(id) on delete cascade;

create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  email extensions.citext,
  phone text,
  title text,
  created_at timestamptz not null default now()
);
create index client_contacts_client_idx on public.client_contacts (client_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  name_en text not null,
  name_ar text,
  practice public.practice not null default 'mixed',
  status public.project_status not null default 'draft',
  description text,
  manager_user_id uuid references public.profiles(id) on delete set null,
  start_date date,
  end_date date,
  client_visible boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_client_idx on public.projects (client_id);
create index projects_manager_idx on public.projects (manager_user_id);
create index projects_status_idx on public.projects (status);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.project_member_role not null default 'member',
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index project_members_user_idx on public.project_members (user_id);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title_en text not null,
  title_ar text,
  description text,
  due_date date,
  status public.milestone_status not null default 'planned',
  client_visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index milestones_project_idx on public.milestones (project_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_user_id uuid references public.profiles(id) on delete set null,
  due_date date,
  position integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_project_status_idx on public.tasks (project_id, status);
create index tasks_assignee_idx on public.tasks (assignee_user_id) where status not in ('done', 'cancelled');

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index task_comments_task_idx on public.task_comments (task_id, created_at);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text not null,
  client_visible boolean not null default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_updates_project_idx on public.project_updates (project_id, created_at desc);

create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  category text not null default 'general' check (category in ('general', 'proposal', 'contract', 'report', 'deliverable', 'other')),
  storage_path text not null unique,
  size_bytes bigint,
  mime_type text,
  client_visible boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_documents_project_idx on public.project_documents (project_id);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  subject text not null,
  body text not null,
  status public.support_status not null default 'open',
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_requests_client_idx on public.support_requests (client_id, status);

create table public.activity (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_project_idx on public.activity (project_id, created_at desc);

create trigger clients_updated_at before update on public.clients for each row execute function private.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function private.set_updated_at();
create trigger milestones_updated_at before update on public.milestones for each row execute function private.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function private.set_updated_at();
create trigger task_comments_updated_at before update on public.task_comments for each row execute function private.set_updated_at();
create trigger support_requests_updated_at before update on public.support_requests for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Membership helpers
-- ---------------------------------------------------------------------------
create or replace function private.my_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pm.project_id from public.project_members pm where pm.user_id = (select auth.uid())
  union
  select p.id from public.projects p where p.manager_user_id = (select auth.uid());
$$;

-- Projects a client user may see through the portal.
create or replace function private.my_client_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.projects p
  where p.client_visible
    and p.status <> 'draft'
    and p.client_id in (select private.my_client_ids());
$$;

-- Clients an employee can see because they are on one of that client's projects.
create or replace function private.my_project_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select distinct p.client_id
  from public.projects p
  where p.client_id is not null
    and p.id in (select private.my_project_ids());
$$;

-- Editing membership: manager of the project or projects.write.
create or replace function private.managed_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pm.project_id from public.project_members pm where pm.user_id = (select auth.uid()) and pm.role = 'manager'
  union
  select p.id from public.projects p where p.manager_user_id = (select auth.uid());
$$;

revoke all on function private.my_project_ids() from public, anon;
revoke all on function private.my_client_project_ids() from public, anon;
revoke all on function private.my_project_client_ids() from public, anon;
revoke all on function private.managed_project_ids() from public, anon;
grant execute on function private.my_project_ids() to authenticated, service_role;
grant execute on function private.my_client_project_ids() to authenticated, service_role;
grant execute on function private.my_project_client_ids() to authenticated, service_role;
grant execute on function private.managed_project_ids() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Activity trail (trigger driven, security definer so members need no insert policy)
-- ---------------------------------------------------------------------------
create or replace function private.record_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _project uuid;
  _entity uuid;
  _action text;
  _meta jsonb := '{}'::jsonb;
begin
  _action := lower(tg_op);
  if tg_table_name = 'projects' then
    _project := coalesce(new.id, old.id); _entity := _project;
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      _meta := jsonb_build_object('from', old.status, 'to', new.status);
      _action := 'status_changed';
    end if;
  elsif tg_table_name = 'tasks' then
    _project := coalesce(new.project_id, old.project_id); _entity := coalesce(new.id, old.id);
    _meta := jsonb_build_object('title', coalesce(new.title, old.title));
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      _meta := _meta || jsonb_build_object('from', old.status, 'to', new.status);
      _action := 'status_changed';
    end if;
  elsif tg_table_name = 'milestones' then
    _project := coalesce(new.project_id, old.project_id); _entity := coalesce(new.id, old.id);
    _meta := jsonb_build_object('title', coalesce(new.title_en, old.title_en));
  elsif tg_table_name = 'project_documents' then
    _project := coalesce(new.project_id, old.project_id); _entity := coalesce(new.id, old.id);
    _meta := jsonb_build_object('title', coalesce(new.title, old.title));
  elsif tg_table_name = 'project_updates' then
    _project := coalesce(new.project_id, old.project_id); _entity := coalesce(new.id, old.id);
    _meta := jsonb_build_object('title', coalesce(new.title, old.title));
  end if;
  insert into public.activity (project_id, entity_type, entity_id, actor_id, action, metadata)
  values (_project, tg_table_name, _entity, (select auth.uid()), _action, _meta);
  return coalesce(new, old);
end;
$$;

create trigger projects_activity after insert or update on public.projects for each row execute function private.record_activity();
create trigger tasks_activity after insert or update on public.tasks for each row execute function private.record_activity();
create trigger milestones_activity after insert or update on public.milestones for each row execute function private.record_activity();
create trigger project_documents_activity after insert on public.project_documents for each row execute function private.record_activity();
create trigger project_updates_activity after insert on public.project_updates for each row execute function private.record_activity();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_documents enable row level security;
alter table public.support_requests enable row level security;
alter table public.activity enable row level security;

-- clients
create policy clients_select on public.clients for select to authenticated
  using (
    (select private.has_permission('clients.read'))
    or id in (select private.my_client_ids())
    or id in (select private.my_project_client_ids())
  );
create policy clients_insert on public.clients for insert to authenticated
  with check ((select private.has_permission('clients.write')));
create policy clients_update on public.clients for update to authenticated
  using ((select private.has_permission('clients.write')))
  with check ((select private.has_permission('clients.write')));
create policy clients_delete on public.clients for delete to authenticated
  using ((select private.has_permission('clients.write')));

create policy client_contacts_select on public.client_contacts for select to authenticated
  using (
    (select private.has_permission('clients.read'))
    or client_id in (select private.my_project_client_ids())
  );
create policy client_contacts_write on public.client_contacts for all to authenticated
  using ((select private.has_permission('clients.write')))
  with check ((select private.has_permission('clients.write')));

-- projects
create policy projects_select on public.projects for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or id in (select private.my_project_ids())
    or id in (select private.my_client_project_ids())
  );
create policy projects_insert on public.projects for insert to authenticated
  with check ((select private.has_permission('projects.write')));
create policy projects_update on public.projects for update to authenticated
  using ((select private.has_permission('projects.write')) or id in (select private.managed_project_ids()))
  with check ((select private.has_permission('projects.write')) or id in (select private.managed_project_ids()));
create policy projects_delete on public.projects for delete to authenticated
  using ((select private.has_permission('projects.write')));

-- members
create policy project_members_select on public.project_members for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
  );
create policy project_members_write on public.project_members for all to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()))
  with check ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));

-- milestones: internal visibility follows the project; clients see client_visible rows.
create policy milestones_select on public.milestones for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
    or (client_visible and project_id in (select private.my_client_project_ids()))
  );
create policy milestones_write on public.milestones for all to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()))
  with check ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));

-- tasks: never visible to clients.
create policy tasks_select on public.tasks for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
  );
create policy tasks_insert on public.tasks for insert to authenticated
  with check (
    (select private.has_permission('tasks.write'))
    or project_id in (select private.my_project_ids())
  );
create policy tasks_update on public.tasks for update to authenticated
  using (
    (select private.has_permission('tasks.write'))
    or project_id in (select private.my_project_ids())
  )
  with check (
    (select private.has_permission('tasks.write'))
    or project_id in (select private.my_project_ids())
  );
create policy tasks_delete on public.tasks for delete to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));

create policy task_comments_select on public.task_comments for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or task_id in (select t.id from public.tasks t where t.project_id in (select private.my_project_ids()))
  );
create policy task_comments_insert on public.task_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and task_id in (select t.id from public.tasks t where t.project_id in (select private.my_project_ids()))
  );
create policy task_comments_update on public.task_comments for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy task_comments_delete on public.task_comments for delete to authenticated
  using (author_id = (select auth.uid()) or (select private.has_permission('projects.write')));

-- updates
create policy project_updates_select on public.project_updates for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
    or (client_visible and project_id in (select private.my_client_project_ids()))
  );
create policy project_updates_insert on public.project_updates for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and ((select private.has_permission('projects.write')) or project_id in (select private.my_project_ids()))
  );
create policy project_updates_update on public.project_updates for update to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()))
  with check ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));
create policy project_updates_delete on public.project_updates for delete to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));

-- documents: metadata rows. Files live in private buckets (0010).
create policy project_documents_select on public.project_documents for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
    or (client_visible and project_id in (select private.my_client_project_ids()))
  );
create policy project_documents_insert on public.project_documents for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and (
      (select private.has_permission('projects.write'))
      or project_id in (select private.my_project_ids())
      or project_id in (select private.my_client_project_ids())
    )
  );
create policy project_documents_update on public.project_documents for update to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()))
  with check ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));
create policy project_documents_delete on public.project_documents for delete to authenticated
  using ((select private.has_permission('projects.write')) or project_id in (select private.managed_project_ids()));

-- Client uploads are never client_visible = false (they cannot hide their own files) and
-- may only target their own visible projects; enforced by trigger.
create or replace function private.guard_client_document_upload()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select private.is_client_user()) then
    if new.project_id not in (select private.my_client_project_ids()) then
      raise exception 'not allowed' using errcode = '42501';
    end if;
    new.client_visible := true;
  end if;
  return new;
end;
$$;
create trigger project_documents_client_guard before insert on public.project_documents
  for each row execute function private.guard_client_document_upload();

-- support requests
create policy support_requests_select on public.support_requests for select to authenticated
  using (
    client_id in (select private.my_client_ids())
    or (select private.has_permission('clients.read'))
    or client_id in (select private.my_project_client_ids())
  );
create policy support_requests_insert on public.support_requests for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (client_id in (select private.my_client_ids()) or (select private.has_permission('clients.write')))
  );
create policy support_requests_update on public.support_requests for update to authenticated
  using ((select private.has_permission('clients.write')) or client_id in (select private.my_project_client_ids()))
  with check ((select private.has_permission('clients.write')) or client_id in (select private.my_project_client_ids()));

-- activity: internal only, insert through trigger.
create policy activity_select on public.activity for select to authenticated
  using (
    (select private.has_permission('projects.read_all'))
    or project_id in (select private.my_project_ids())
  );

-- ====================================================================
-- 20260911000500_finance.sql
-- ====================================================================
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

-- ====================================================================
-- 20260911000600_security_engagements.sql
-- ====================================================================
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

-- ====================================================================
-- 20260911000700_cms.sql
-- ====================================================================
-- 0007 Public content system: authors, categories, tags, news, articles,
-- public projects, case studies. News and Articles are distinct tables;
-- Public Projects and Case Studies are distinct tables and are never linked
-- to private project data in any public query.

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  name_en text not null,
  name_ar text not null,
  title_en text,
  title_ar text,
  bio_en text,
  bio_ar text,
  avatar_path text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('news', 'article', 'project', 'case_study')),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  position integer not null default 0,
  unique (kind, slug)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ar text not null
);

-- Shared editorial column set for news and articles.
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  excerpt_en text,
  excerpt_ar text,
  body_en text,
  body_ar text,
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index news_posts_published_idx on public.news_posts (status, published_at desc);

create table public.articles (
  like public.news_posts including all
);
alter table public.articles add constraint articles_author_fk foreign key (author_id) references public.authors(id) on delete set null;
alter table public.articles add constraint articles_category_fk foreign key (category_id) references public.categories(id) on delete set null;
alter table public.articles add column reading_minutes integer;

create table public.news_tags (
  news_id uuid not null references public.news_posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (news_id, tag_id)
);
create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table public.public_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  summary_en text,
  summary_ar text,
  body_en text,
  body_ar text,
  practice public.practice not null default 'development',
  client_display_name_en text,
  client_display_name_ar text,
  year integer,
  services_en text[] not null default '{}',
  services_ar text[] not null default '{}',
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  position integer not null default 0,
  -- Optional reference for editors only. Never selected by public queries.
  internal_project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index public_projects_published_idx on public.public_projects (status, position, published_at desc);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '',
  title_ar text not null default '',
  summary_en text,
  summary_ar text,
  challenge_en text,
  challenge_ar text,
  solution_en text,
  solution_ar text,
  implementation_en text,
  implementation_ar text,
  outcome_en text,
  outcome_ar text,
  -- [{ "label_en": "", "label_ar": "", "value": "", "verified": true }]
  impact jsonb not null default '[]'::jsonb,
  practice public.practice not null default 'mixed',
  client_display_name_en text,
  client_display_name_ar text,
  industry_en text,
  industry_ar text,
  year integer,
  cover_path text,
  cover_alt_en text,
  cover_alt_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  language_status public.language_status not null default 'both',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  position integer not null default 0,
  internal_project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index case_studies_published_idx on public.case_studies (status, position, published_at desc);

create trigger news_posts_updated_at before update on public.news_posts for each row execute function private.set_updated_at();
create trigger articles_updated_at before update on public.articles for each row execute function private.set_updated_at();
create trigger public_projects_updated_at before update on public.public_projects for each row execute function private.set_updated_at();
create trigger case_studies_updated_at before update on public.case_studies for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Publishing guard: moving to published or scheduled needs content.publish;
-- published_at is set on first publish; slugs are normalised.
-- ---------------------------------------------------------------------------
create or replace function private.guard_content_publish()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.slug := private.slugify(new.slug);
  if new.slug = '' then
    raise exception 'slug is required' using errcode = '22023';
  end if;
  if (select auth.role()) <> 'service_role' then
    if new.status in ('published', 'scheduled') and (tg_op = 'INSERT' or old.status is distinct from new.status) then
      if not (select private.has_permission('content.publish')) then
        raise exception 'publishing requires content.publish' using errcode = '42501';
      end if;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if new.status = 'scheduled' and new.scheduled_for is null then
    raise exception 'scheduled content needs a scheduled_for time' using errcode = '22023';
  end if;
  return new;
end; $$;

create trigger news_posts_guard before insert or update on public.news_posts for each row execute function private.guard_content_publish();
create trigger articles_guard before insert or update on public.articles for each row execute function private.guard_content_publish();

create or replace function private.guard_showcase_publish()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.slug := private.slugify(new.slug);
  if new.slug = '' then
    raise exception 'slug is required' using errcode = '22023';
  end if;
  if (select auth.role()) <> 'service_role' then
    if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
      if not (select private.has_permission('content.publish')) then
        raise exception 'publishing requires content.publish' using errcode = '42501';
      end if;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end; $$;
create trigger public_projects_guard before insert or update on public.public_projects for each row execute function private.guard_showcase_publish();
create trigger case_studies_guard before insert or update on public.case_studies for each row execute function private.guard_showcase_publish();

-- Scheduled content becomes published when its time arrives (called by a cron
-- or on demand by the application with the service role).
create or replace function public.publish_due_content()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare _n integer := 0; _c integer;
begin
  if (select auth.role()) <> 'service_role' and not (select private.has_permission('content.publish')) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  update public.news_posts set status = 'published', published_at = coalesce(published_at, scheduled_for)
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  update public.articles set status = 'published', published_at = coalesce(published_at, scheduled_for)
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  return _n;
end; $$;
revoke all on function public.publish_due_content() from public, anon;
grant execute on function public.publish_due_content() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: published rows are public; everything else needs content.read.
-- ---------------------------------------------------------------------------
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.news_posts enable row level security;
alter table public.articles enable row level security;
alter table public.news_tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.public_projects enable row level security;
alter table public.case_studies enable row level security;

create policy authors_public_select on public.authors for select to anon, authenticated using (true);
create policy authors_write on public.authors for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy categories_public_select on public.categories for select to anon, authenticated using (true);
create policy categories_write on public.categories for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy tags_public_select on public.tags for select to anon, authenticated using (true);
create policy tags_write on public.tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy news_public_select on public.news_posts for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy news_editor_select on public.news_posts for select to authenticated
  using ((select private.has_permission('content.read')));
create policy news_insert on public.news_posts for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy news_update on public.news_posts for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy news_delete on public.news_posts for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy articles_public_select on public.articles for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy articles_editor_select on public.articles for select to authenticated
  using ((select private.has_permission('content.read')));
create policy articles_insert on public.articles for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy articles_update on public.articles for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy articles_delete on public.articles for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy news_tags_select on public.news_tags for select to anon, authenticated using (true);
create policy news_tags_write on public.news_tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));
create policy article_tags_select on public.article_tags for select to anon, authenticated using (true);
create policy article_tags_write on public.article_tags for all to authenticated
  using ((select private.has_permission('content.write'))) with check ((select private.has_permission('content.write')));

create policy public_projects_public_select on public.public_projects for select to anon, authenticated
  using (status = 'published');
create policy public_projects_editor_select on public.public_projects for select to authenticated
  using ((select private.has_permission('content.read')));
create policy public_projects_insert on public.public_projects for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy public_projects_update on public.public_projects for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy public_projects_delete on public.public_projects for delete to authenticated
  using ((select private.has_permission('content.publish')));

create policy case_studies_public_select on public.case_studies for select to anon, authenticated
  using (status = 'published');
create policy case_studies_editor_select on public.case_studies for select to authenticated
  using ((select private.has_permission('content.read')));
create policy case_studies_insert on public.case_studies for insert to authenticated
  with check ((select private.has_permission('content.write')) and created_by = (select auth.uid()));
create policy case_studies_update on public.case_studies for update to authenticated
  using ((select private.has_permission('content.write')))
  with check ((select private.has_permission('content.write')));
create policy case_studies_delete on public.case_studies for delete to authenticated
  using ((select private.has_permission('content.publish')));

-- The public API surface never exposes internal_project_id, created_by or
-- updated_by: anon holds column level SELECT only. Public queries must list
-- their columns explicitly (select=* is refused for anon on these tables).
revoke select on public.public_projects from anon;
grant select (id, slug, title_en, title_ar, summary_en, summary_ar, body_en, body_ar, practice,
  client_display_name_en, client_display_name_ar, year, services_en, services_ar, cover_path,
  cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar,
  language_status, status, published_at, position, created_at, updated_at)
  on public.public_projects to anon;

revoke select on public.case_studies from anon;
grant select (id, slug, title_en, title_ar, summary_en, summary_ar, challenge_en, challenge_ar,
  solution_en, solution_ar, implementation_en, implementation_ar, outcome_en, outcome_ar, impact,
  practice, client_display_name_en, client_display_name_ar, industry_en, industry_ar, year,
  cover_path, cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en,
  seo_description_ar, language_status, status, published_at, position, created_at, updated_at)
  on public.case_studies to anon;

-- ====================================================================
-- 20260911000800_certificates.sql
-- ====================================================================
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

-- ====================================================================
-- 20260911000900_platform.sql
-- ====================================================================
-- 0009 Platform: audit logs (append only), notifications, contact submissions,
-- and the audit triggers on sensitive tables.

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  client_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

-- Append only: no update or delete for anyone, including the service role.
create or replace function private.audit_logs_immutable()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'audit logs are append only' using errcode = '42501';
end; $$;
create trigger audit_logs_no_update before update or delete on public.audit_logs
  for each row execute function private.audit_logs_immutable();

-- Writer used by triggers and by the application (through the service role).
create or replace function private.log_audit(
  _action text,
  _entity_type text,
  _entity_id text,
  _metadata jsonb default '{}'::jsonb,
  _client_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare _actor uuid := (select auth.uid()); _email text;
begin
  if _actor is not null then
    select email into _email from public.profiles where id = _actor;
  end if;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, client_id, metadata)
  values (_actor, _email, _action, _entity_type, _entity_id, _client_id, coalesce(_metadata, '{}'::jsonb));
end; $$;
revoke all on function private.log_audit(text, text, text, jsonb, uuid) from public, anon;
grant execute on function private.log_audit(text, text, text, jsonb, uuid) to authenticated, service_role;

-- Application facing writer for server actions (adds request context).
create or replace function public.record_audit_event(
  _action text,
  _entity_type text,
  _entity_id text,
  _metadata jsonb default '{}'::jsonb,
  _client_id uuid default null,
  _ip text default null,
  _user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare _actor uuid := (select auth.uid()); _email text;
begin
  if (select auth.role()) <> 'service_role' and _actor is null then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if _actor is not null then
    select email into _email from public.profiles where id = _actor;
  end if;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, client_id, metadata, ip, user_agent)
  values (_actor, _email, _action, _entity_type, _entity_id, _client_id, coalesce(_metadata, '{}'::jsonb), _ip, left(_user_agent, 300));
end; $$;
revoke all on function public.record_audit_event(text, text, text, jsonb, uuid, text, text) from public, anon;
grant execute on function public.record_audit_event(text, text, text, jsonb, uuid, text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Audit triggers
-- ---------------------------------------------------------------------------
create or replace function private.audit_user_roles()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.log_audit(
    case tg_op when 'INSERT' then 'role.granted' when 'DELETE' then 'role.revoked' else 'role.changed' end,
    'user', coalesce(new.user_id, old.user_id)::text,
    jsonb_build_object('role', coalesce(new.role_key, old.role_key)));
  return coalesce(new, old);
end; $$;
create trigger user_roles_audit after insert or update or delete on public.user_roles
  for each row execute function private.audit_user_roles();

create or replace function private.audit_role_permissions()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.log_audit(
    case tg_op when 'INSERT' then 'permission.granted' else 'permission.revoked' end,
    'role', coalesce(new.role_key, old.role_key),
    jsonb_build_object('permission', coalesce(new.permission_key, old.permission_key)));
  return coalesce(new, old);
end; $$;
create trigger role_permissions_audit after insert or delete on public.role_permissions
  for each row execute function private.audit_role_permissions();

create or replace function private.audit_profiles()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('user.created', 'user', new.id::text, jsonb_build_object('kind', new.kind));
  elsif new.is_active is distinct from old.is_active then
    perform private.log_audit(case when new.is_active then 'user.activated' else 'user.deactivated' end, 'user', new.id::text, '{}'::jsonb);
  elsif new.kind is distinct from old.kind then
    perform private.log_audit('user.kind_changed', 'user', new.id::text, jsonb_build_object('from', old.kind, 'to', new.kind));
  end if;
  return new;
end; $$;
create trigger profiles_audit after insert or update on public.profiles
  for each row execute function private.audit_profiles();

create or replace function private.audit_invoices()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('invoice.created', 'invoice', new.id::text, '{}'::jsonb, new.client_id);
  elsif new.status is distinct from old.status then
    perform private.log_audit(
      case new.status when 'issued' then 'invoice.issued' when 'void' then 'invoice.voided' when 'paid' then 'invoice.paid' else 'invoice.status_changed' end,
      'invoice', new.id::text,
      jsonb_build_object('number', new.number, 'from', old.status, 'to', new.status, 'total', new.total, 'currency', new.currency),
      new.client_id);
  end if;
  return new;
end; $$;
create trigger invoices_audit after insert or update on public.invoices
  for each row execute function private.audit_invoices();

create or replace function private.audit_quotes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.log_audit('quote.status_changed', 'quote', new.id::text,
      jsonb_build_object('number', new.number, 'from', old.status, 'to', new.status, 'total', new.total, 'currency', new.currency),
      new.client_id);
  end if;
  return new;
end; $$;
create trigger quotes_audit after update on public.quotes
  for each row execute function private.audit_quotes();

create or replace function private.audit_certificates()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.log_audit(
      case new.status when 'issued' then 'certificate.issued' when 'revoked' then 'certificate.revoked' else 'certificate.status_changed' end,
      'certificate', new.id::text,
      jsonb_build_object('certificate_no', new.certificate_no, 'type', new.type));
  end if;
  return new;
end; $$;
create trigger certificates_audit after update on public.certificates
  for each row execute function private.audit_certificates();

create or replace function private.audit_findings()
returns trigger language plpgsql security definer set search_path = '' as $$
declare _client uuid;
begin
  select client_id into _client from public.security_engagements where id = coalesce(new.engagement_id, old.engagement_id);
  perform private.log_audit(
    case when tg_op = 'INSERT' then 'finding.created'
      when tg_op = 'DELETE' then 'finding.deleted'
      when new.status is distinct from old.status then 'finding.status_changed'
      when new.severity is distinct from old.severity then 'finding.severity_changed'
      else 'finding.updated' end,
    'finding', coalesce(new.id, old.id)::text,
    jsonb_build_object('engagement_id', coalesce(new.engagement_id, old.engagement_id), 'severity', coalesce(new.severity, old.severity), 'status', coalesce(new.status, old.status)),
    _client);
  return coalesce(new, old);
end; $$;
create trigger findings_audit after insert or update or delete on public.findings
  for each row execute function private.audit_findings();

create or replace function private.audit_engagements()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('engagement.created', 'security_engagement', new.id::text, jsonb_build_object('code', new.code, 'type', new.type), new.client_id);
  elsif new.status is distinct from old.status then
    perform private.log_audit('engagement.status_changed', 'security_engagement', new.id::text, jsonb_build_object('code', new.code, 'from', old.status, 'to', new.status), new.client_id);
  end if;
  return new;
end; $$;
create trigger engagements_audit after insert or update on public.security_engagements
  for each row execute function private.audit_engagements();

create or replace function private.audit_content()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status and new.status in ('published', 'archived', 'scheduled') then
    perform private.log_audit('content.' || new.status::text, tg_table_name, new.id::text, jsonb_build_object('slug', new.slug));
  elsif tg_op = 'INSERT' and new.status = 'published' then
    perform private.log_audit('content.published', tg_table_name, new.id::text, jsonb_build_object('slug', new.slug));
  elsif tg_op = 'DELETE' then
    perform private.log_audit('content.deleted', tg_table_name, old.id::text, jsonb_build_object('slug', old.slug));
  end if;
  return coalesce(new, old);
end; $$;
create trigger news_posts_audit after insert or update or delete on public.news_posts for each row execute function private.audit_content();
create trigger articles_audit after insert or update or delete on public.articles for each row execute function private.audit_content();
create trigger public_projects_audit after insert or update or delete on public.public_projects for each row execute function private.audit_content();
create trigger case_studies_audit after insert or update or delete on public.case_studies for each row execute function private.audit_content();

create or replace function private.audit_projects()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('project.created', 'project', new.id::text, jsonb_build_object('code', new.code), new.client_id);
  elsif tg_op = 'DELETE' then
    perform private.log_audit('project.deleted', 'project', old.id::text, jsonb_build_object('code', old.code), old.client_id);
  elsif new.status is distinct from old.status or new.client_visible is distinct from old.client_visible or new.client_id is distinct from old.client_id then
    perform private.log_audit('project.changed', 'project', new.id::text,
      jsonb_build_object('code', new.code, 'status', new.status, 'client_visible', new.client_visible), new.client_id);
  end if;
  return coalesce(new, old);
end; $$;
create trigger projects_audit after insert or update or delete on public.projects
  for each row execute function private.audit_projects();

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title_en text not null,
  title_ar text not null,
  body_en text,
  body_ar text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create or replace function private.notify(
  _user_id uuid, _type text, _title_en text, _title_ar text, _body_en text default null, _body_ar text default null, _link text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, type, title_en, title_ar, body_en, body_ar, link)
  values (_user_id, _type, _title_en, _title_ar, _body_en, _body_ar, _link);
$$;
revoke all on function private.notify(uuid, text, text, text, text, text, text) from public, anon;
grant execute on function private.notify(uuid, text, text, text, text, text, text) to authenticated, service_role;

-- Task and project assignment notifications.
create or replace function private.notify_task_assignment()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.assignee_user_id is not null
     and (tg_op = 'INSERT' or new.assignee_user_id is distinct from old.assignee_user_id)
     and new.assignee_user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid) then
    perform private.notify(new.assignee_user_id, 'task.assigned',
      'You were assigned a task', 'تم إسناد مهمة إليك',
      new.title, new.title,
      '/app/projects/' || new.project_id::text || '/tasks/' || new.id::text);
  end if;
  return new;
end; $$;
create trigger tasks_notify_assignment after insert or update of assignee_user_id on public.tasks
  for each row execute function private.notify_task_assignment();

create or replace function private.notify_project_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
declare _name text;
begin
  select name_en into _name from public.projects where id = new.project_id;
  if new.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid) then
    perform private.notify(new.user_id, 'project.assigned',
      'You were added to a project', 'تمت إضافتك إلى مشروع',
      _name, _name, '/app/projects/' || new.project_id::text);
  end if;
  return new;
end; $$;
create trigger project_members_notify after insert on public.project_members
  for each row execute function private.notify_project_membership();

-- ---------------------------------------------------------------------------
-- Contact submissions (written by the server with the service role only)
-- ---------------------------------------------------------------------------
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email extensions.citext not null,
  company text,
  country text,
  service text,
  message text not null,
  locale public.locale not null default 'en',
  ip_hash text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed', 'spam')),
  handled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index contact_submissions_status_idx on public.contact_submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_submissions enable row level security;

create policy audit_logs_select on public.audit_logs for select to authenticated
  using ((select private.has_permission('audit.read')));
-- No insert policy: rows arrive through private.log_audit / record_audit_event only.

create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

create policy contact_submissions_select on public.contact_submissions for select to authenticated
  using ((select private.has_permission('clients.read')));
create policy contact_submissions_update on public.contact_submissions for update to authenticated
  using ((select private.has_permission('clients.write'))) with check ((select private.has_permission('clients.write')));

-- ====================================================================
-- 20260911001000_storage.sql
-- ====================================================================
-- 0010 Storage: one bucket per data category. Private buckets are never
-- public; the application serves them through short lived signed URLs after
-- checking the owning database record. The storage.objects policies below
-- mirror the database rules as defense in depth.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-brand-assets', 'public-brand-assets', true, 20971520, null),
  ('public-content', 'public-content', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/avif']),
  ('private-project-documents', 'private-project-documents', false, 52428800, null),
  ('private-security-reports', 'private-security-reports', false, 104857600, null),
  ('private-hr-documents', 'private-hr-documents', false, 26214400, null),
  ('private-finance-documents', 'private-finance-documents', false, 26214400, array['application/pdf']),
  ('private-certificates', 'private-certificates', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create or replace function private.try_uuid(_v text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return _v::uuid;
exception when others then
  return null;
end; $$;
revoke all on function private.try_uuid(text) from public, anon;
grant execute on function private.try_uuid(text) to authenticated, service_role;

-- Public buckets: anyone reads, editors write.
create policy "public brand assets read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-brand-assets');
create policy "public brand assets write" on storage.objects for all to authenticated
  using (bucket_id = 'public-brand-assets' and (select private.has_permission('settings.manage')))
  with check (bucket_id = 'public-brand-assets' and (select private.has_permission('settings.manage')));

create policy "public content read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-content');
create policy "public content write" on storage.objects for all to authenticated
  using (
    bucket_id = 'public-content'
    and ((select private.has_permission('content.write'))
      or ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text))
  )
  with check (
    bucket_id = 'public-content'
    and ((select private.has_permission('content.write'))
      or ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = (select auth.uid())::text))
  );

-- Project documents: <project_id>/<file>
create policy "project documents read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-project-documents'
    and exists (select 1 from public.project_documents d where d.storage_path = name)
  );
create policy "project documents insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'private-project-documents'
    and (
      (select private.has_permission('projects.write'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_project_ids())
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_client_project_ids())
    )
  );
create policy "project documents delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'private-project-documents'
    and ((select private.has_permission('projects.write'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.managed_project_ids()))
  );

-- Security reports and evidence: <engagement_id>/reports/<file> or <engagement_id>/evidence/<finding_id>/<file>
create policy "security files read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-security-reports'
    and (
      exists (select 1 from public.engagement_reports r where r.storage_path = name)
      or exists (select 1 from public.finding_evidence e where e.storage_path = name)
    )
  );
create policy "security files insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'private-security-reports'
    and (select private.has_permission('security.write'))
    and ((select private.has_permission('security.read_all'))
      or private.try_uuid((storage.foldername(name))[1]) in (select private.my_engagement_ids()))
  );
create policy "security files delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'private-security-reports'
    and (select private.has_permission('security.write'))
    and (select private.has_permission('security.read_all'))
  );

-- HR documents: <employee_user_id>/<file>
create policy "hr documents read" on storage.objects for select to authenticated
  using (
    bucket_id = 'private-hr-documents'
    and exists (select 1 from public.employee_documents d where d.storage_path = name)
  );
create policy "hr documents write" on storage.objects for all to authenticated
  using (bucket_id = 'private-hr-documents' and (select private.has_permission('hr.write')))
  with check (bucket_id = 'private-hr-documents' and (select private.has_permission('hr.write')));

-- Finance documents and certificates: generated by the server (service role).
-- Finance staff can read directly; clients and recipients go through the app.
create policy "finance documents read" on storage.objects for select to authenticated
  using (bucket_id = 'private-finance-documents' and (select private.has_permission('finance.read')));
create policy "certificate files read" on storage.objects for select to authenticated
  using (bucket_id = 'private-certificates' and (select private.has_permission('certificates.read')));

-- ====================================================================
-- 20260911001100_seed_reference.sql
-- ====================================================================
-- 0011 Reference data: roles, permissions, the role to permission matrix,
-- categories and departments. No business records, no demo users.

insert into public.permissions (key, description) values
  ('users.manage', 'Provision, activate and deactivate accounts; assign roles'),
  ('roles.manage', 'Edit roles and their permissions'),
  ('audit.read', 'Read the audit log'),
  ('settings.manage', 'Change platform settings and brand assets'),
  ('clients.read', 'Read all client records and contact submissions'),
  ('clients.write', 'Create and edit clients, contacts and client users'),
  ('projects.read_all', 'Read every project regardless of membership'),
  ('projects.write', 'Create, edit and delete projects and manage members'),
  ('tasks.write', 'Create and edit tasks on any project'),
  ('hr.read', 'Read employee records and documents'),
  ('hr.write', 'Create and edit employees, departments, teams and HR documents'),
  ('finance.read', 'Read quotes, invoices and payments'),
  ('finance.write', 'Create and edit draft quotes and invoices, record payments'),
  ('finance.issue', 'Issue and void quotes and invoices'),
  ('security.read_all', 'Read every security engagement and finding'),
  ('security.write', 'Create and edit engagements, assets, findings and evidence'),
  ('security.report', 'Finalise security reports'),
  ('content.read', 'Read draft content'),
  ('content.write', 'Create and edit content'),
  ('content.publish', 'Publish, schedule, archive and delete content'),
  ('certificates.read', 'Read all certificates'),
  ('certificates.issue', 'Create, issue and revoke certificates')
on conflict (key) do update set description = excluded.description;

insert into public.roles (key, name_en, name_ar, description, is_system) values
  ('super_admin', 'Super Admin', 'مدير أعلى', 'Full control including super admin membership', true),
  ('admin', 'Admin', 'مدير النظام', 'Administers users, clients, projects, content and settings', true),
  ('finance', 'Finance', 'المالية', 'Quotes, invoices and payments', true),
  ('hr', 'HR', 'الموارد البشرية', 'Employees, departments and HR documents', true),
  ('project_manager', 'Project Manager', 'مدير مشاريع', 'Clients, projects, members and tasks', true),
  ('security_team', 'Security Team', 'فريق الأمن', 'Security engagements and findings', true),
  ('developer', 'Developer', 'مطوّر', 'Works on assigned projects', true),
  ('content_editor', 'Content Editor', 'محرر محتوى', 'Writes and edits public content', true),
  ('employee', 'Employee', 'موظف', 'Base role for every employee', true),
  ('client', 'Client', 'عميل', 'Client portal access to their own organisation', true)
on conflict (key) do update set name_en = excluded.name_en, name_ar = excluded.name_ar, description = excluded.description;

-- Deny by default: only what each role needs.
insert into public.role_permissions (role_key, permission_key)
select r.key, p.key from public.roles r cross join public.permissions p where r.key = 'super_admin'
union all
select 'admin', p.key from public.permissions p
  where p.key in ('users.manage', 'audit.read', 'settings.manage', 'clients.read', 'clients.write',
    'projects.read_all', 'projects.write', 'tasks.write', 'content.read', 'content.write', 'content.publish',
    'certificates.read', 'certificates.issue', 'hr.read', 'finance.read')
union all
select 'finance', p.key from public.permissions p
  where p.key in ('clients.read', 'finance.read', 'finance.write', 'finance.issue')
union all
select 'hr', p.key from public.permissions p
  where p.key in ('hr.read', 'hr.write', 'certificates.read', 'certificates.issue')
union all
select 'project_manager', p.key from public.permissions p
  where p.key in ('clients.read', 'clients.write', 'projects.read_all', 'projects.write', 'tasks.write')
union all
select 'security_team', p.key from public.permissions p
  where p.key in ('security.write', 'security.report')
union all
select 'content_editor', p.key from public.permissions p
  where p.key in ('content.read', 'content.write')
on conflict do nothing;
-- developer, employee and client carry no global permissions; their access
-- comes entirely from membership rows.

insert into public.categories (kind, slug, name_en, name_ar, position) values
  ('news', 'company', 'Company', 'الشركة', 1),
  ('news', 'partnerships', 'Partnerships', 'الشراكات', 2),
  ('news', 'events', 'Events', 'الفعاليات', 3),
  ('article', 'cybersecurity', 'Cybersecurity', 'الأمن السيبراني', 1),
  ('article', 'engineering', 'Engineering', 'الهندسة', 2),
  ('article', 'ai', 'Artificial Intelligence', 'الذكاء الاصطناعي', 3),
  ('article', 'infrastructure', 'Infrastructure', 'البنية التحتية', 4)
on conflict (kind, slug) do nothing;

insert into public.departments (name_en, name_ar, position) values
  ('Management', 'الإدارة', 1),
  ('Cybersecurity', 'الأمن السيبراني', 2),
  ('Engineering', 'الهندسة', 3),
  ('Operations', 'العمليات', 4)
on conflict do nothing;

-- ====================================================================
-- Bootstrap: profiles for auth users created before the schema existed,
-- and the first super admin. Runs with service role claims so the super
-- admin guard trigger allows the initial grant.
-- ====================================================================
select set_config('request.jwt.claims', '{"role":"service_role"}', true);

insert into public.profiles (id, email, full_name, kind, locale)
select u.id, u.email, coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)), 'employee', 'en'
from auth.users u
where u.email is not null
on conflict (id) do nothing;

insert into public.user_roles (user_id, role_key)
select p.id, r.role_key
from public.profiles p
cross join (values ('super_admin'), ('employee')) as r(role_key)
where p.email = 'info@cybarq.com'
on conflict do nothing;

insert into public.employees (user_id, job_title_en, job_title_ar)
select p.id, 'Administrator', 'مدير النظام' from public.profiles p where p.email = 'info@cybarq.com'
on conflict (user_id) do nothing;

select set_config('request.jwt.claims', '', true);

commit;
