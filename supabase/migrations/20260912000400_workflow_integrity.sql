-- 0015 Workflow integrity.
--
-- Certificates, security reports, public content, engagements and projects:
-- lifecycle changes go through the functions that own them, issued records
-- stay immutable, cross references stay inside their parent, and stored
-- file paths always live under the owning record's folder.

-- ---------------------------------------------------------------------------
-- Certificates: draft edits only; issue and revoke through functions.
-- ---------------------------------------------------------------------------
create or replace function private.guard_certificate_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.certificate_no is not null or new.issued_at is not null or new.revoked_at is not null then
      raise exception 'new certificates start as drafts' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.status <> 'draft' then
    if (to_jsonb(new) - 'pdf_path' - 'updated_at') is distinct from (to_jsonb(old) - 'pdf_path' - 'updated_at') then
      raise exception 'issued certificates cannot be edited; revoke it and issue a new one' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.status <> 'draft' or new.certificate_no is distinct from old.certificate_no
     or new.verification_code is distinct from old.verification_code
     or new.issued_at is distinct from old.issued_at or new.issued_by is distinct from old.issued_by
     or new.revoked_at is distinct from old.revoked_at or new.revoked_by is distinct from old.revoked_by then
    raise exception 'certificate status and number are managed by the platform' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists certificates_guard on public.certificates;
drop function if exists private.guard_issued_certificate();
create trigger certificates_guard before insert or update on public.certificates
  for each row execute function private.guard_certificate_write();

drop function if exists public.issue_certificate(uuid, timestamptz, date);
create or replace function public.issue_certificate(_certificate_id uuid, _expected_updated_at timestamptz, _issue_date date default null)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.certificates;
  _date date := coalesce(_issue_date, private.business_today());
begin
  perform private.require_permission('certificates.issue');
  update public.certificates
  set status = 'issued',
      certificate_no = coalesce(certificate_no, private.next_document_number('certificate', _date)),
      issue_date = _date,
      issued_at = now(),
      issued_by = (select auth.uid())
  where id = _certificate_id and status = 'draft' and updated_at = _expected_updated_at
  returning * into _row;
  if _row.id is null then
    raise exception 'certificate was modified or already issued; reload and retry' using errcode = '40001';
  end if;
  return _row;
end;
$$;
revoke all on function public.issue_certificate(uuid, timestamptz, date) from public, anon;
grant execute on function public.issue_certificate(uuid, timestamptz, date) to authenticated, service_role;

drop function if exists public.revoke_certificate(uuid, text);
create or replace function public.revoke_certificate(_certificate_id uuid, _reason text)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare _row public.certificates;
begin
  perform private.require_permission('certificates.issue');
  if length(coalesce(trim(_reason), '')) < 3 then
    raise exception 'a reason is required' using errcode = '22023';
  end if;
  update public.certificates
  set status = 'revoked', revoked_at = now(), revoked_by = (select auth.uid()), revoke_reason = trim(_reason), pdf_path = null
  where id = _certificate_id and status = 'issued'
  returning * into _row;
  if _row.id is null then
    raise exception 'only issued certificates can be revoked' using errcode = '40001';
  end if;
  return _row;
end;
$$;
revoke all on function public.revoke_certificate(uuid, text) from public, anon;
grant execute on function public.revoke_certificate(uuid, text) to authenticated, service_role;

-- Public verification also reports the role title and hours printed on the certificate.
drop function if exists public.verify_certificate(text);
create or replace function public.verify_certificate(_code text)
returns table (
  certificate_no text,
  type public.certificate_type,
  status public.certificate_status,
  language public.locale,
  recipient_name_en text,
  recipient_name_ar text,
  title_en text,
  title_ar text,
  program_name_en text,
  program_name_ar text,
  role_title_en text,
  role_title_ar text,
  hours numeric,
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
  select c.certificate_no, c.type, c.status, c.language, c.recipient_name_en, c.recipient_name_ar,
         c.title_en, c.title_ar, c.program_name_en, c.program_name_ar, c.role_title_en, c.role_title_ar,
         c.hours, c.start_date, c.end_date, c.issue_date, c.revoked_at
  from public.certificates c
  where c.verification_code = lower(trim(_code))
    and c.status in ('issued', 'revoked')
  limit 1;
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Security reports: new versions are drafts; final and client visible
-- decisions need security.report.
-- ---------------------------------------------------------------------------
create or replace function private.guard_report_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if current_user in ('authenticated', 'anon') and (new.status <> 'draft' or new.client_visible or new.issued_at is not null) then
      raise exception 'new report versions start as internal drafts' using errcode = '42501';
    end if;
    if new.storage_path not like new.engagement_id::text || '/reports/%' then
      raise exception 'report files must live under the engagement folder' using errcode = '22023';
    end if;
    return new;
  end if;
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if old.status = 'final' then
    if (to_jsonb(new) - 'client_visible' - 'title') is distinct from (to_jsonb(old) - 'client_visible' - 'title') then
      raise exception 'a final report is immutable; upload a new version instead' using errcode = '42501';
    end if;
    if new.client_visible is distinct from old.client_visible and not (select private.has_permission('security.report')) then
      raise exception 'only report approvers can share or withdraw a final report' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.storage_path is distinct from old.storage_path or new.version is distinct from old.version
     or new.engagement_id is distinct from old.engagement_id then
    raise exception 'the file of a report version cannot be replaced; upload a new version' using errcode = '42501';
  end if;
  if new.status = 'final' then
    if not (select private.has_permission('security.report')) then
      raise exception 'finalising a report requires approval rights' using errcode = '42501';
    end if;
    new.issued_at := now();
    new.issued_by := (select auth.uid());
  end if;
  return new;
end;
$$;
drop trigger if exists engagement_reports_guard on public.engagement_reports;
drop function if exists private.guard_final_report();
create trigger engagement_reports_guard before insert or update on public.engagement_reports
  for each row execute function private.guard_report_write();

-- ---------------------------------------------------------------------------
-- File paths always live under the owning record.
-- ---------------------------------------------------------------------------
create or replace function private.guard_storage_path()
returns trigger
language plpgsql
set search_path = ''
as $$
declare _prefix text;
begin
  if tg_table_name = 'project_documents' then
    _prefix := new.project_id::text || '/';
    if new.storage_path not like _prefix || '%' then
      raise exception 'project files must live under the project folder' using errcode = '22023';
    end if;
  elsif tg_table_name = 'finding_evidence' then
    select f.engagement_id::text || '/evidence/' || f.id::text || '/' into _prefix from public.findings f where f.id = new.finding_id;
    if _prefix is null or new.storage_path not like _prefix || '%' then
      raise exception 'evidence files must live under the finding folder' using errcode = '22023';
    end if;
  elsif tg_table_name = 'employee_documents' then
    _prefix := new.employee_user_id::text || '/';
    if new.storage_path not like _prefix || '%' then
      raise exception 'HR files must live under the employee folder' using errcode = '22023';
    end if;
  elsif tg_table_name = 'security_engagements' then
    if new.authorisation_document_path is not null
       and new.authorisation_document_path not like new.id::text || '/authorisation/%' then
      raise exception 'authorisation files must live under the engagement folder' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists project_documents_path on public.project_documents;
create trigger project_documents_path before insert or update of storage_path, project_id on public.project_documents
  for each row execute function private.guard_storage_path();
drop trigger if exists finding_evidence_path on public.finding_evidence;
create trigger finding_evidence_path before insert or update of storage_path, finding_id on public.finding_evidence
  for each row execute function private.guard_storage_path();
drop trigger if exists employee_documents_path on public.employee_documents;
create trigger employee_documents_path before insert or update of storage_path, employee_user_id on public.employee_documents
  for each row execute function private.guard_storage_path();
drop trigger if exists security_engagements_path on public.security_engagements;
create trigger security_engagements_path before insert or update of authorisation_document_path on public.security_engagements
  for each row execute function private.guard_storage_path();

-- ---------------------------------------------------------------------------
-- Public content: any move into or out of published, scheduled or archived
-- needs content.publish.
-- ---------------------------------------------------------------------------
create or replace function private.guard_content_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
declare _gated boolean;
begin
  new.slug := private.slugify(new.slug);
  if new.slug = '' then
    raise exception 'slug is required' using errcode = '22023';
  end if;
  if current_user in ('authenticated', 'anon') then
    _gated := case
      when tg_op = 'INSERT' then new.status in ('published', 'scheduled', 'archived')
      else new.status is distinct from old.status
        and (new.status in ('published', 'scheduled', 'archived') or old.status in ('published', 'scheduled', 'archived'))
    end;
    if _gated and not (select private.has_permission('content.publish')) then
      raise exception 'publishing requires content.publish' using errcode = '42501';
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if tg_table_name in ('news_posts', 'articles') then
    if new.status = 'scheduled' and new.scheduled_for is null then
      raise exception 'scheduled content needs a publication time' using errcode = '22023';
    end if;
    if new.status = 'scheduled' and tg_op = 'UPDATE' and old.status is distinct from 'scheduled' and new.scheduled_for <= now() then
      raise exception 'the publication time must be in the future' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists public_projects_guard on public.public_projects;
drop trigger if exists case_studies_guard on public.case_studies;
drop function if exists private.guard_showcase_publish();
create trigger public_projects_guard before insert or update on public.public_projects for each row execute function private.guard_content_publish();
create trigger case_studies_guard before insert or update on public.case_studies for each row execute function private.guard_content_publish();

-- Scheduled content goes live at its scheduled time (and keeps that time as its publication date).
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
  update public.news_posts set status = 'published', published_at = scheduled_for
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  update public.articles set status = 'published', published_at = scheduled_for
    where status = 'scheduled' and scheduled_for <= now();
  get diagnostics _c = row_count; _n := _n + _c;
  return _n;
end;
$$;

-- Anonymous readers only get the public columns of posts and authors.
revoke select on public.news_posts from anon;
grant select (id, slug, title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar, author_id, category_id,
  cover_path, cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar,
  language_status, status, scheduled_for, published_at, created_at, updated_at) on public.news_posts to anon;
revoke select on public.articles from anon;
grant select (id, slug, title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar, author_id, category_id,
  cover_path, cover_alt_en, cover_alt_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar,
  language_status, status, scheduled_for, published_at, created_at, updated_at, reading_minutes) on public.articles to anon;
revoke select on public.authors from anon;
grant select (id, name_en, name_ar, title_en, title_ar, bio_en, bio_ar, avatar_path, created_at) on public.authors to anon;

-- ---------------------------------------------------------------------------
-- Engagements: created through a function so the creator is on the roster
-- (and can see what they created); the client, project and authorisation
-- record are frozen once the engagement is authorised, except for people
-- who oversee every engagement.
-- ---------------------------------------------------------------------------
create or replace function public.create_engagement(
  _code text,
  _title text,
  _type public.engagement_type,
  _client_id uuid default null,
  _project_id uuid default null,
  _lead_user_id uuid default null,
  _start_date date default null,
  _end_date date default null,
  _scope_summary text default null,
  _rules_of_engagement text default null,
  _authorised_by_name text default null,
  _authorised_at date default null
)
returns public.security_engagements
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.security_engagements;
  _actor uuid := (select auth.uid());
begin
  perform private.require_permission('security.write');
  if _start_date is not null and _end_date is not null and _end_date < _start_date then
    raise exception 'the end date cannot be before the start date' using errcode = '22023';
  end if;
  insert into public.security_engagements (code, title, type, client_id, project_id, lead_user_id, start_date, end_date,
    scope_summary, rules_of_engagement, authorised_by_name, authorised_at, created_by)
  values (upper(trim(_code)), trim(_title), _type, _client_id, _project_id, _lead_user_id, _start_date, _end_date,
    nullif(trim(_scope_summary), ''), nullif(trim(_rules_of_engagement), ''), nullif(trim(_authorised_by_name), ''), _authorised_at, _actor)
  returning * into _row;
  if _lead_user_id is not null then
    insert into public.engagement_members (engagement_id, user_id, role) values (_row.id, _lead_user_id, 'lead')
    on conflict (engagement_id, user_id) do update set role = 'lead';
  end if;
  if _actor is distinct from _lead_user_id and not (select private.has_permission('security.read_all')) then
    insert into public.engagement_members (engagement_id, user_id, role) values (_row.id, _actor, 'observer')
    on conflict (engagement_id, user_id) do nothing;
  end if;
  return _row;
end;
$$;
revoke all on function public.create_engagement(text, text, public.engagement_type, uuid, uuid, uuid, date, date, text, text, text, date) from public, anon;
grant execute on function public.create_engagement(text, text, public.engagement_type, uuid, uuid, uuid, date, date, text, text, text, date) to authenticated, service_role;

create or replace function private.guard_engagement_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_id is not null and new.client_id is not null and not exists (
    select 1 from public.projects p where p.id = new.project_id and p.client_id = new.client_id
  ) then
    raise exception 'the project belongs to a different client' using errcode = '22023';
  end if;
  if new.start_date is not null and new.end_date is not null and new.end_date < new.start_date then
    raise exception 'the end date cannot be before the start date' using errcode = '22023';
  end if;
  if tg_op = 'UPDATE' and current_user in ('authenticated', 'anon') then
    if old.status <> 'scoping' and not (select private.has_permission('security.read_all')) and (
         new.client_id is distinct from old.client_id
      or new.project_id is distinct from old.project_id
      or new.code is distinct from old.code
      or new.authorised_by_name is distinct from old.authorised_by_name
      or new.authorised_at is distinct from old.authorised_at
    ) then
      raise exception 'the client and authorisation of an authorised engagement can only be changed by a security manager' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists security_engagements_guard on public.security_engagements;
create trigger security_engagements_guard before insert or update on public.security_engagements
  for each row execute function private.guard_engagement_write();

-- Engagement changes of client, lead or authorisation are audited as well as status changes.
create or replace function private.audit_engagements()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('engagement.created', 'security_engagement', new.id::text, jsonb_build_object('code', new.code, 'type', new.type), new.client_id);
  elsif new.status is distinct from old.status then
    perform private.log_audit('engagement.status_changed', 'security_engagement', new.id::text, jsonb_build_object('code', new.code, 'from', old.status, 'to', new.status), new.client_id);
  elsif new.client_id is distinct from old.client_id or new.lead_user_id is distinct from old.lead_user_id
     or new.authorised_by_name is distinct from old.authorised_by_name or new.authorised_at is distinct from old.authorised_at
     or new.authorisation_document_path is distinct from old.authorisation_document_path then
    perform private.log_audit('engagement.changed', 'security_engagement', new.id::text,
      jsonb_build_object('code', new.code,
        'client_changed', new.client_id is distinct from old.client_id,
        'lead_changed', new.lead_user_id is distinct from old.lead_user_id,
        'authorisation_changed', (new.authorised_by_name is distinct from old.authorised_by_name or new.authorised_at is distinct from old.authorised_at or new.authorisation_document_path is distinct from old.authorisation_document_path)),
      new.client_id);
  end if;
  return new;
end; $$;

-- Findings reference assets of their own engagement.
create or replace function private.guard_finding_asset()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.asset_id is not null and not exists (
    select 1 from public.engagement_assets a where a.id = new.asset_id and a.engagement_id = new.engagement_id
  ) then
    raise exception 'the asset belongs to a different engagement' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists findings_asset on public.findings;
create trigger findings_asset before insert or update of asset_id, engagement_id on public.findings
  for each row execute function private.guard_finding_asset();

-- ---------------------------------------------------------------------------
-- Projects: moving a project to another client needs projects.write; tasks
-- reference milestones of their own project; support requests reference
-- projects of their own client.
-- ---------------------------------------------------------------------------
create or replace function private.guard_project_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.start_date is not null and new.end_date is not null and new.end_date < new.start_date then
    raise exception 'the end date cannot be before the start date' using errcode = '22023';
  end if;
  if tg_op = 'UPDATE' and current_user in ('authenticated', 'anon')
     and (new.client_id is distinct from old.client_id or new.code is distinct from old.code)
     and not (select private.has_permission('projects.write')) then
    raise exception 'only project administrators can change the client or code of a project' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists projects_guard on public.projects;
create trigger projects_guard before insert or update on public.projects
  for each row execute function private.guard_project_write();

create or replace function private.guard_task_milestone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.milestone_id is not null and not exists (
    select 1 from public.milestones m where m.id = new.milestone_id and m.project_id = new.project_id
  ) then
    raise exception 'the milestone belongs to a different project' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_milestone on public.tasks;
create trigger tasks_milestone before insert or update of milestone_id, project_id on public.tasks
  for each row execute function private.guard_task_milestone();

create or replace function private.guard_support_project()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p where p.id = new.project_id and p.client_id = new.client_id
  ) then
    raise exception 'the project belongs to a different client' using errcode = '22023';
  end if;
  return new;
end;
$$;
drop trigger if exists support_requests_project on public.support_requests;
create trigger support_requests_project before insert or update of project_id, client_id on public.support_requests
  for each row execute function private.guard_support_project();

-- Client visible updates and documents: managers (or projects.write) decide
-- what a client sees; other members post internal items only.
create or replace function private.guard_client_visibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and new.client_visible
     and (tg_op = 'INSERT' or old.client_visible is distinct from new.client_visible)
     and not (select private.is_client_user())
     and not (select private.has_permission('projects.write'))
     and new.project_id not in (select private.managed_project_ids()) then
    raise exception 'only the project manager can share items with the client' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists project_updates_visibility on public.project_updates;
create trigger project_updates_visibility before insert or update on public.project_updates
  for each row execute function private.guard_client_visibility();
drop trigger if exists project_documents_visibility on public.project_documents;
create trigger project_documents_visibility before insert or update on public.project_documents
  for each row execute function private.guard_client_visibility();

-- Task comments: anyone who can see the task (members, project readers).
drop policy if exists task_comments_insert on public.task_comments;
create policy task_comments_insert on public.task_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (select private.has_permission('projects.read_all'))
      or task_id in (select t.id from public.tasks t where t.project_id in (select private.my_project_ids()))
    )
  );

-- The "added to a project" notification carries the Arabic project name when there is one.
create or replace function private.notify_project_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
declare _en text; _ar text;
begin
  if tg_op = 'UPDATE' then
    return new; -- role changes are not a new assignment
  end if;
  select name_en, coalesce(name_ar, name_en) into _en, _ar from public.projects where id = new.project_id;
  if new.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid) then
    perform private.notify(new.user_id, 'project.assigned',
      'You were added to a project', 'تمت إضافتك إلى مشروع',
      _en, _ar, '/app/projects/' || new.project_id::text);
  end if;
  return new;
end; $$;

-- Activity: no rows for saves that changed nothing.
drop trigger if exists projects_activity on public.projects;
drop trigger if exists tasks_activity on public.tasks;
drop trigger if exists milestones_activity on public.milestones;
create trigger projects_activity after insert on public.projects for each row execute function private.record_activity();
create trigger projects_activity_update after update on public.projects for each row
  when (old.* is distinct from new.* and (old.status, old.name_en, old.name_ar, old.client_id, old.manager_user_id, old.start_date, old.end_date, old.client_visible, old.description, old.practice)
        is distinct from (new.status, new.name_en, new.name_ar, new.client_id, new.manager_user_id, new.start_date, new.end_date, new.client_visible, new.description, new.practice))
  execute function private.record_activity();
create trigger tasks_activity after insert on public.tasks for each row execute function private.record_activity();
create trigger tasks_activity_update after update on public.tasks for each row
  when ((old.status, old.title, old.description, old.priority, old.assignee_user_id, old.due_date, old.milestone_id)
        is distinct from (new.status, new.title, new.description, new.priority, new.assignee_user_id, new.due_date, new.milestone_id))
  execute function private.record_activity();
create trigger milestones_activity after insert on public.milestones for each row execute function private.record_activity();
create trigger milestones_activity_update after update on public.milestones for each row
  when ((old.status, old.title_en, old.title_ar, old.due_date, old.client_visible, old.description)
        is distinct from (new.status, new.title_en, new.title_ar, new.due_date, new.client_visible, new.description))
  execute function private.record_activity();
