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
