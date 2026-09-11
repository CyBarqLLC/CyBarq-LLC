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
