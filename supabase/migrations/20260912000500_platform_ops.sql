-- 0016 Platform operations.
--
-- * Application audit events are written by the server only (service role),
--   with the acting user passed explicitly. Signed-in users can no longer
--   write arbitrary rows into the audit log.
-- * A shared rate limiter in the database, so limits hold across every
--   server instance (sign in, password reset, contact form, verification).
-- * One scheduled job entry point for publishing and status sweeps.
-- * Indexes for the access paths the application actually uses.

-- ---------------------------------------------------------------------------
-- Audit events from the application
-- ---------------------------------------------------------------------------
drop function if exists public.record_audit_event(text, text, text, jsonb, uuid, text, text);
create or replace function public.record_audit_event(
  _action text,
  _entity_type text,
  _entity_id text,
  _metadata jsonb default '{}'::jsonb,
  _client_id uuid default null,
  _ip text default null,
  _user_agent text default null,
  _actor_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare _email text;
begin
  if _actor_id is not null then
    select email into _email from public.profiles where id = _actor_id;
  end if;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, client_id, metadata, ip, user_agent)
  values (_actor_id, _email, left(_action, 80), left(_entity_type, 60), left(_entity_id, 80), _client_id,
          coalesce(_metadata, '{}'::jsonb), left(_ip, 64), left(_user_agent, 300));
end;
$$;
revoke all on function public.record_audit_event(text, text, text, jsonb, uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.record_audit_event(text, text, text, jsonb, uuid, text, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window per key). Keys are hashed by the application.
-- ---------------------------------------------------------------------------
create table if not exists private.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null
);
-- Only the definer functions below touch this table. RLS with no policies keeps
-- it closed to every API role even if the schema were ever exposed.
alter table private.rate_limits enable row level security;

create or replace function public.consume_rate_limit(_key text, _limit integer, _window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare _hits integer;
begin
  insert into private.rate_limits as r (key, window_start, hits)
  values (_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => _window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => _window_seconds) then now() else r.window_start end
  returning hits into _hits;
  return _hits <= _limit;
end;
$$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Scheduled jobs (called every few minutes by /api/cron/publish)
-- ---------------------------------------------------------------------------
create or replace function public.run_scheduled_jobs()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare _published integer; _finance jsonb; _purged integer;
begin
  if (select auth.role()) <> 'service_role' then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  _published := public.publish_due_content();
  _finance := private.sweep_finance_statuses();
  delete from private.rate_limits where window_start < now() - interval '1 day';
  get diagnostics _purged = row_count;
  return jsonb_build_object('published', _published, 'rate_limits_purged', _purged) || _finance;
end;
$$;
revoke all on function public.run_scheduled_jobs() from public, anon, authenticated;
grant execute on function public.run_scheduled_jobs() to service_role;

-- ---------------------------------------------------------------------------
-- Indexes for real access paths
-- ---------------------------------------------------------------------------
-- Notification lists and the unread badge.
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
-- "My tasks" (assignee, open, by due date).
drop index if exists public.tasks_assignee_idx;
create index if not exists tasks_assignee_open_idx on public.tasks (assignee_user_id, due_date) where status not in ('done', 'cancelled');
create index if not exists tasks_milestone_idx on public.tasks (milestone_id) where milestone_id is not null;
-- Membership helpers read these by user.
create index if not exists team_members_user_idx on public.team_members (user_id);
create index if not exists teams_department_idx on public.teams (department_id);
create index if not exists support_requests_project_idx on public.support_requests (project_id) where project_id is not null;
create index if not exists security_engagements_project_idx on public.security_engagements (project_id) where project_id is not null;
create index if not exists findings_asset_idx on public.findings (asset_id) where asset_id is not null;
create index if not exists engagement_reports_engagement_idx on public.engagement_reports (engagement_id, status);
create index if not exists news_posts_author_idx on public.news_posts (author_id);
create index if not exists news_posts_category_idx on public.news_posts (category_id);
create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_category_idx on public.articles (category_id);
create index if not exists news_tags_tag_idx on public.news_tags (tag_id);
create index if not exists article_tags_tag_idx on public.article_tags (tag_id);
create index if not exists milestones_project_due_idx on public.milestones (project_id, due_date);
create index if not exists contact_submissions_created_idx on public.contact_submissions (created_at desc);
