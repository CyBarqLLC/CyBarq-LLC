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
