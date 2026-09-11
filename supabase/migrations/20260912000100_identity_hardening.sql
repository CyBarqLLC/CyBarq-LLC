-- 0012 Identity hardening.
--
-- 1. Account kind is decided by the server, never by the person signing up:
--    it is read from app_metadata (writable only with the service role). A
--    user created any other way (for example an accidental public sign-up)
--    gets an inactive client profile and no access at all.
-- 2. Role grants cannot escalate privileges: nobody changes their own roles,
--    nobody grants or removes a role that carries permissions they do not
--    hold themselves, only a super admin touches super admin accounts, and
--    employee roles only go to employees (the client role only to clients).
-- 3. Role permissions are edited by super admins only.
-- 4. Every membership helper requires an active account of the right kind,
--    so a deactivated employee (or a client added to an internal roster by
--    mistake) never inherits project, engagement or client data.
-- 5. public.viewer_context() returns the caller's profile, roles,
--    permissions and client memberships in one round trip.

-- ---------------------------------------------------------------------------
-- 1. Profile creation
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _kind text := new.raw_app_meta_data ->> 'kind';
  _locale text := coalesce(new.raw_user_meta_data ->> 'locale', 'en');
begin
  if _kind is null or _kind not in ('employee', 'client') then
    -- Not provisioned by the platform: no access until an administrator decides.
    insert into public.profiles (id, email, full_name, full_name_ar, kind, locale, is_active)
    values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'full_name_ar',
            'client', case when _locale = 'ar' then 'ar' else 'en' end::public.locale, false)
    on conflict (id) do nothing;
    return new;
  end if;
  insert into public.profiles (id, email, full_name, full_name_ar, kind, locale, is_active)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'full_name_ar',
          _kind::public.user_kind, case when _locale = 'ar' then 'ar' else 'en' end::public.locale, true)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Profiles: protected columns, and super admin accounts are managed by
--    super admins only.
-- ---------------------------------------------------------------------------
create or replace function private.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  _actor uuid := (select auth.uid());
begin
  if current_user not in ('authenticated', 'anon') then
    return new; -- service role, definer functions, migrations
  end if;
  if new.id is distinct from old.id then
    raise exception 'profile id cannot change' using errcode = '42501';
  end if;
  if new.kind is distinct from old.kind
     or new.email is distinct from old.email
     or new.is_active is distinct from old.is_active then
    if not (select private.has_permission('users.manage')) then
      raise exception 'not allowed to change protected profile fields' using errcode = '42501';
    end if;
    if old.id = _actor then
      raise exception 'you cannot change the type, email or status of your own account' using errcode = '42501';
    end if;
    if exists (select 1 from public.user_roles ur where ur.user_id = old.id and ur.role_key = 'super_admin')
       and not (select private.is_super_admin()) then
      raise exception 'only a super admin can change a super admin account' using errcode = '42501';
    end if;
  end if;
  -- Other people's names and contact details: user managers only, and never a super admin's unless you are one.
  if old.id <> _actor then
    if exists (select 1 from public.user_roles ur where ur.user_id = old.id and ur.role_key = 'super_admin')
       and not (select private.is_super_admin()) then
      raise exception 'only a super admin can change a super admin account' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Role grants
-- ---------------------------------------------------------------------------
create or replace function private.check_role_change(_user_id uuid, _role_key text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  _actor uuid := (select auth.uid());
  _kind public.user_kind;
begin
  select p.kind into _kind from public.profiles p where p.id = _user_id;
  if _kind is null then
    raise exception 'account not found' using errcode = '23503';
  end if;
  if _role_key = 'client' and _kind <> 'client' then
    raise exception 'the client role is only for client accounts' using errcode = '22023';
  end if;
  if _role_key <> 'client' and _kind <> 'employee' then
    raise exception 'employee roles are only for employee accounts' using errcode = '22023';
  end if;
  if (select private.is_super_admin()) then
    return;
  end if;
  if _role_key = 'super_admin' then
    raise exception 'only a super admin can change super admin membership' using errcode = '42501';
  end if;
  if _user_id = _actor then
    raise exception 'you cannot change your own roles' using errcode = '42501';
  end if;
  if exists (select 1 from public.user_roles ur where ur.user_id = _user_id and ur.role_key = 'super_admin') then
    raise exception 'only a super admin can change a super admin account' using errcode = '42501';
  end if;
  -- No escalation: every permission the role carries must already be held by the actor.
  if exists (
    select 1 from public.role_permissions rp
    where rp.role_key = _role_key
      and not exists (
        select 1 from public.user_roles mine
        join public.role_permissions mp on mp.role_key = mine.role_key
        where mine.user_id = _actor and mp.permission_key = rp.permission_key
      )
  ) then
    raise exception 'you cannot grant or remove a role with permissions you do not hold' using errcode = '42501';
  end if;
end;
$$;
revoke all on function private.check_role_change(uuid, text) from public, anon;
grant execute on function private.check_role_change(uuid, text) to authenticated, service_role;

create or replace function private.guard_role_grant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    -- Service role and definer functions still keep account kinds consistent.
    if tg_op <> 'DELETE' then
      if new.role_key = 'client' and not exists (select 1 from public.profiles p where p.id = new.user_id and p.kind = 'client') then
        raise exception 'the client role is only for client accounts' using errcode = '22023';
      end if;
      if new.role_key <> 'client' and not exists (select 1 from public.profiles p where p.id = new.user_id and p.kind = 'employee') then
        raise exception 'employee roles are only for employee accounts' using errcode = '22023';
      end if;
    end if;
    return coalesce(new, old);
  end if;
  if tg_op in ('UPDATE', 'DELETE') then
    perform private.check_role_change(old.user_id, old.role_key);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform private.check_role_change(new.user_id, new.role_key);
    new.granted_by := (select auth.uid());
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists user_roles_protect_super_admin on public.user_roles;
drop function if exists private.protect_super_admin_grant();
create trigger user_roles_guard
  before insert or update or delete on public.user_roles
  for each row execute function private.guard_role_grant();

-- Role definitions and the permission matrix: super admins only. The super
-- admin role itself always holds every permission and is never edited.
drop policy if exists roles_write on public.roles;
drop policy if exists role_permissions_write on public.role_permissions;
create policy roles_write on public.roles for all to authenticated
  using ((select private.is_super_admin()) and key <> 'super_admin')
  with check ((select private.is_super_admin()) and key <> 'super_admin');
create policy role_permissions_write on public.role_permissions for all to authenticated
  using ((select private.is_super_admin()) and role_key <> 'super_admin')
  with check ((select private.is_super_admin()) and role_key <> 'super_admin');

update public.permissions set description = 'Edit roles and their permissions (super admins only)' where key = 'roles.manage';

-- ---------------------------------------------------------------------------
-- 4. Membership helpers: active accounts of the right kind only.
-- ---------------------------------------------------------------------------
create or replace function private.is_active_employee()
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
revoke all on function private.is_active_employee() from public, anon;
grant execute on function private.is_active_employee() to authenticated, service_role;

create or replace function private.my_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pm.project_id from public.project_members pm
  where pm.user_id = (select auth.uid()) and (select private.is_active_employee())
  union
  select p.id from public.projects p
  where p.manager_user_id = (select auth.uid()) and (select private.is_active_employee());
$$;

create or replace function private.managed_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pm.project_id from public.project_members pm
  where pm.user_id = (select auth.uid()) and pm.role = 'manager' and (select private.is_active_employee())
  union
  select p.id from public.projects p
  where p.manager_user_id = (select auth.uid()) and (select private.is_active_employee());
$$;

create or replace function private.my_engagement_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select em.engagement_id from public.engagement_members em
  where em.user_id = (select auth.uid()) and (select private.is_active_employee())
  union
  select e.id from public.security_engagements e
  where e.lead_user_id = (select auth.uid()) and (select private.is_active_employee());
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
  where cu.user_id = (select auth.uid()) and cu.is_active and p.is_active and p.kind = 'client';
$$;

create or replace function private.is_employee()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_active_employee());
$$;

-- ---------------------------------------------------------------------------
-- Roster integrity: internal rosters hold employees, client rosters hold clients.
-- ---------------------------------------------------------------------------
create or replace function private.assert_employee(_user_id uuid, _what text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if _user_id is null then return; end if;
  if not exists (select 1 from public.profiles p where p.id = _user_id and p.kind = 'employee') then
    raise exception '% must be an employee account', _what using errcode = '22023';
  end if;
end;
$$;
revoke all on function private.assert_employee(uuid, text) from public, anon;
grant execute on function private.assert_employee(uuid, text) to authenticated, service_role;

create or replace function private.guard_client_user_kind()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = new.user_id and p.kind = 'client') then
    raise exception 'only client accounts can belong to a client organisation' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists client_users_kind on public.client_users;
create trigger client_users_kind before insert or update of user_id on public.client_users
  for each row execute function private.guard_client_user_kind();

create or replace function private.guard_employee_roster()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'project_members' then
    perform private.assert_employee(new.user_id, 'a project member');
  elsif tg_table_name = 'engagement_members' then
    perform private.assert_employee(new.user_id, 'an engagement member');
  elsif tg_table_name = 'team_members' then
    perform private.assert_employee(new.user_id, 'a team member');
  elsif tg_table_name = 'projects' then
    perform private.assert_employee(new.manager_user_id, 'the project manager');
  elsif tg_table_name = 'security_engagements' then
    perform private.assert_employee(new.lead_user_id, 'the engagement lead');
  elsif tg_table_name = 'teams' then
    perform private.assert_employee(new.lead_user_id, 'the team lead');
  elsif tg_table_name = 'tasks' then
    perform private.assert_employee(new.assignee_user_id, 'the assignee');
  elsif tg_table_name = 'support_requests' then
    perform private.assert_employee(new.assigned_to, 'the assignee');
  elsif tg_table_name = 'employees' then
    perform private.assert_employee(new.user_id, 'an employee record');
  end if;
  return new;
end;
$$;

drop trigger if exists project_members_roster on public.project_members;
create trigger project_members_roster before insert or update of user_id on public.project_members
  for each row execute function private.guard_employee_roster();
drop trigger if exists engagement_members_roster on public.engagement_members;
create trigger engagement_members_roster before insert or update of user_id on public.engagement_members
  for each row execute function private.guard_employee_roster();
drop trigger if exists team_members_roster on public.team_members;
create trigger team_members_roster before insert or update of user_id on public.team_members
  for each row execute function private.guard_employee_roster();
drop trigger if exists projects_roster on public.projects;
create trigger projects_roster before insert or update of manager_user_id on public.projects
  for each row execute function private.guard_employee_roster();
drop trigger if exists security_engagements_roster on public.security_engagements;
create trigger security_engagements_roster before insert or update of lead_user_id on public.security_engagements
  for each row execute function private.guard_employee_roster();
drop trigger if exists teams_roster on public.teams;
create trigger teams_roster before insert or update of lead_user_id on public.teams
  for each row execute function private.guard_employee_roster();
drop trigger if exists tasks_roster on public.tasks;
create trigger tasks_roster before insert or update of assignee_user_id on public.tasks
  for each row execute function private.guard_employee_roster();
drop trigger if exists support_requests_roster on public.support_requests;
create trigger support_requests_roster before insert or update of assigned_to on public.support_requests
  for each row execute function private.guard_employee_roster();
drop trigger if exists employees_roster on public.employees;
create trigger employees_roster before insert or update of user_id on public.employees
  for each row execute function private.guard_employee_roster();

-- ---------------------------------------------------------------------------
-- 5. Viewer context: one round trip per request instead of four.
-- ---------------------------------------------------------------------------
create or replace function public.viewer_context()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when p.id is null then null else jsonb_build_object(
    'profile', to_jsonb(p),
    'roles', coalesce((select jsonb_agg(ur.role_key order by ur.role_key) from public.user_roles ur where ur.user_id = p.id), '[]'::jsonb),
    'permissions', case when p.is_active then coalesce((
        select jsonb_agg(distinct rp.permission_key)
        from public.user_roles ur join public.role_permissions rp on rp.role_key = ur.role_key
        where ur.user_id = p.id), '[]'::jsonb) else '[]'::jsonb end,
    'client_ids', case when p.is_active and p.kind = 'client' then coalesce((
        select jsonb_agg(cu.client_id) from public.client_users cu
        where cu.user_id = p.id and cu.is_active), '[]'::jsonb) else '[]'::jsonb end,
    'unread_notifications', (select count(*) from public.notifications n where n.user_id = p.id and n.read_at is null)
  ) end
  from (select (select auth.uid()) as uid) me
  left join public.profiles p on p.id = me.uid;
$$;
revoke all on function public.viewer_context() from public, anon;
grant execute on function public.viewer_context() to authenticated, service_role;
