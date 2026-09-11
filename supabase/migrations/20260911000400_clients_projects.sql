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
