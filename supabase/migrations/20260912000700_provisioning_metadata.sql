-- 0018 Account kind set after creation.
--
-- Supabase Auth's admin "create user" inserts the row first and writes the
-- app metadata in a second statement, so the insert trigger sees no `kind`
-- and creates the safe placeholder (an inactive client profile). When the
-- kind then arrives on that placeholder, the profile is completed: kind and
-- active, exactly as if it had been known at insert time. Nothing else is
-- touched: a profile that has roles or a client membership, or that is not
-- the untouched placeholder, keeps its state.

create or replace function private.handle_user_kind()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _kind text := new.raw_app_meta_data ->> 'kind';
begin
  if _kind is null or _kind not in ('employee', 'client') then
    return new;
  end if;
  if (old.raw_app_meta_data ->> 'kind') is not distinct from _kind then
    return new;
  end if;
  update public.profiles p
     set kind = _kind::public.user_kind,
         is_active = true
   where p.id = new.id
     and p.kind = 'client'
     and not p.is_active
     and not exists (select 1 from public.user_roles r where r.user_id = p.id)
     and not exists (select 1 from public.client_users cu where cu.user_id = p.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_kind on auth.users;
create trigger on_auth_user_kind
  after update of raw_app_meta_data on auth.users
  for each row execute function private.handle_user_kind();
