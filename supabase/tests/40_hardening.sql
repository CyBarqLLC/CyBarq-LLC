-- Scenarios for the 2026-09-12 hardening migrations (0012-0016).
-- Fixture ids: see 20_fixtures.sql. a001 super admin, a002 admin, a003 finance,
-- a004 hr, a005 pm, a006 security lead, a007 developer (member of e0a1),
-- a008 editor, a009 plain employee, a010 security (not a member), c001/c002 clients.

-- =============================================================================
-- Account provisioning
-- =============================================================================
begin;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000f1', 'selfsignup@test.local', '{"full_name":"Self","kind":"employee"}');
select tests.expect_rows('select 1 from public.profiles where id = ''00000000-0000-0000-0000-0000000000f1'' and kind = ''client'' and not is_active', 1,
  'provisioning: a user without server-set app metadata gets an inactive client profile');
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values
  ('00000000-0000-0000-0000-0000000000f2', 'provisioned@test.local', '{"full_name":"Prov","locale":"ar"}', '{"kind":"employee"}');
select tests.expect_rows('select 1 from public.profiles where id = ''00000000-0000-0000-0000-0000000000f2'' and kind = ''employee'' and is_active and locale = ''ar''', 1,
  'provisioning: app metadata decides the account kind');
rollback;

-- =============================================================================
-- Role escalation
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a002');
select tests.expect_error('delete from public.user_roles where user_id = ''00000000-0000-0000-0000-00000000a001'' and role_key = ''super_admin''', 'admin: cannot remove super admin');
select tests.expect_error('update public.profiles set is_active = false where id = ''00000000-0000-0000-0000-00000000a001''', 'admin: cannot deactivate a super admin');
select tests.expect_error('update public.profiles set full_name = ''x'' where id = ''00000000-0000-0000-0000-00000000a001''', 'admin: cannot edit a super admin profile');
select tests.expect_error('update public.profiles set is_active = false where id = ''00000000-0000-0000-0000-00000000a002''', 'admin: cannot deactivate themselves');
select tests.expect_ok('update public.profiles set full_name = ''Admin Renamed'' where id = ''00000000-0000-0000-0000-00000000a002''', 'admin: can edit own name');
select tests.expect_error('insert into public.role_permissions (role_key, permission_key) values (''admin'', ''finance.issue'')', 'admin: cannot edit the permission matrix');
select tests.expect_error('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000c001'', ''developer'')', 'admin: employee roles cannot go to client accounts');
select tests.expect_error('delete from public.user_roles where user_id = ''00000000-0000-0000-0000-00000000a003'' and role_key = ''finance''', 'admin: cannot remove a role carrying permissions they lack');
select tests.expect_ok('delete from public.user_roles where user_id = ''00000000-0000-0000-0000-00000000a007'' and role_key = ''developer''', 'admin: can remove a role within their permissions');
rollback;

begin;
select tests.login('00000000-0000-0000-0000-00000000a001');
select tests.expect_ok('insert into public.role_permissions (role_key, permission_key) values (''developer'', ''tasks.write'')', 'super admin: can edit the permission matrix');
select tests.expect_no_effect('delete from public.role_permissions where role_key = ''super_admin'' and permission_key = ''audit.read''', 'super admin: the super admin role is never edited');
select tests.expect_ok('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000a009'', ''finance'')', 'super admin: can grant any employee role');
select tests.expect_rows('select 1 from public.user_roles where user_id = ''00000000-0000-0000-0000-00000000a009'' and role_key = ''finance'' and granted_by = ''00000000-0000-0000-0000-00000000a001''', 1, 'super admin: granted_by is the actor');
rollback;

-- =============================================================================
-- Deactivated members lose membership access; rosters hold the right kind
-- =============================================================================
begin;
update public.profiles set is_active = false where id = '00000000-0000-0000-0000-00000000a007';
select tests.login('00000000-0000-0000-0000-00000000a007');
select tests.expect_rows('select 1 from public.projects', 0, 'deactivated member: no projects');
select tests.expect_rows('select 1 from public.tasks', 0, 'deactivated member: no tasks');
select tests.expect_rows('select 1 from public.project_documents', 0, 'deactivated member: no documents');
select tests.expect_rows('select public.viewer_context() -> ''permissions''', 1, 'deactivated member: viewer context still answers');
select tests.expect_rows('select 1 where jsonb_array_length(public.viewer_context() -> ''permissions'') = 0', 1, 'deactivated member: no permissions in context');
rollback;

begin;
update public.profiles set is_active = false where id = '00000000-0000-0000-0000-00000000a006';
select tests.login('00000000-0000-0000-0000-00000000a006');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'deactivated lead: no engagements');
select tests.expect_rows('select 1 from public.findings', 0, 'deactivated lead: no findings');
rollback;

begin;
select tests.login('00000000-0000-0000-0000-00000000a005');
select tests.expect_error('insert into public.project_members (project_id, user_id) values (''00000000-0000-0000-0000-00000000e0a1'', ''00000000-0000-0000-0000-00000000c001'')', 'pm: a client account cannot join an internal project roster');
select tests.expect_error('insert into public.client_users (user_id, client_id) values (''00000000-0000-0000-0000-00000000a005'', ''00000000-0000-0000-0000-0000000000aa'')', 'pm: an employee cannot join a client organisation');
select tests.expect_error('update public.tasks set milestone_id = ''00000000-0000-0000-0000-00000000f0b1'' where id = ''00000000-0000-0000-0000-0000000010a1''', 'pm: a task cannot use another project''s milestone');
select tests.expect_error('update public.tasks set assignee_user_id = ''00000000-0000-0000-0000-00000000c001'' where id = ''00000000-0000-0000-0000-0000000010a1''', 'pm: a client cannot be assigned a task');
select tests.expect_error('insert into public.project_documents (project_id, title, storage_path, uploaded_by) values (''00000000-0000-0000-0000-00000000e0a1'', ''x'', ''00000000-0000-0000-0000-00000000e0b1/steal.pdf'', ''00000000-0000-0000-0000-00000000a005'')', 'pm: document path must be under its project');
rollback;

-- Only managers share with the client; members post internal items.
begin;
select tests.login('00000000-0000-0000-0000-00000000a007');
select tests.expect_ok('insert into public.project_updates (project_id, title, body, author_id) values (''00000000-0000-0000-0000-00000000e0a1'', ''internal'', ''x'', ''00000000-0000-0000-0000-00000000a007'')', 'member: can post an internal update');
select tests.expect_error('insert into public.project_updates (project_id, title, body, client_visible, author_id) values (''00000000-0000-0000-0000-00000000e0a1'', ''shared'', ''x'', true, ''00000000-0000-0000-0000-00000000a007'')', 'member: cannot share an update with the client');
select tests.expect_no_effect('update public.projects set client_id = ''00000000-0000-0000-0000-0000000000bb'' where id = ''00000000-0000-0000-0000-00000000e0a1''', 'member: cannot move a project to another client');
rollback;

begin;
select tests.login('00000000-0000-0000-0000-00000000a005');
select tests.expect_ok('insert into public.project_updates (project_id, title, body, client_visible, author_id) values (''00000000-0000-0000-0000-00000000e0a1'', ''shared'', ''x'', true, ''00000000-0000-0000-0000-00000000a005'')', 'manager: can share an update with the client');
select tests.expect_ok('insert into public.task_comments (task_id, author_id, body) values (''00000000-0000-0000-0000-0000000010b1'', ''00000000-0000-0000-0000-00000000a005'', ''looks good'')', 'pm (read all): can comment on a task of a project they do not belong to');
rollback;

-- =============================================================================
-- Finance lifecycle
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a003');
select tests.expect_error('update public.invoices set status = ''issued'' where id = ''00000000-0000-0000-0000-0000000030a2''', 'finance: status cannot be set directly');
select tests.expect_error('update public.invoices set status = ''draft'' where id = ''00000000-0000-0000-0000-0000000030a1''', 'finance: an issued invoice cannot go back to draft');
select tests.expect_error('update public.invoices set amount_paid = 1000 where id = ''00000000-0000-0000-0000-0000000030a1''', 'finance: paid amount cannot be written');
select tests.expect_ok('update public.invoices set subtotal = 1, total = 1 where id = ''00000000-0000-0000-0000-0000000030a2''', 'finance: a typed total on a draft is ignored');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a2'' and total = 500', 1, 'finance: draft totals always come from the items');
select tests.expect_error('select public.record_payment(''00000000-0000-0000-0000-0000000030a1'', 1500, current_date - 1, ''cash'')', 'finance: overpayment rejected');
select tests.expect_error('select public.record_payment(''00000000-0000-0000-0000-0000000030a1'', 10, current_date + 10, ''cash'')', 'finance: future payment date rejected');
select tests.expect_error('select public.record_payment(''00000000-0000-0000-0000-0000000030a2'', 10, current_date - 1, ''cash'')', 'finance: no payments on drafts');
select tests.expect_ok('select public.record_payment(''00000000-0000-0000-0000-0000000030a1'', 1000, current_date - 1, ''cash'')', 'finance: full payment');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a1'' and status = ''paid'' and amount_paid = 1000', 1, 'finance: fully paid');
select tests.expect_ok('select public.remove_payment((select id from public.payments where invoice_id = ''00000000-0000-0000-0000-0000000030a1'' limit 1), ''recorded twice'')', 'finance: can remove a payment with a reason');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a1'' and amount_paid = 0 and status in (''issued'', ''overdue'')', 1, 'finance: status follows the removal');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'finance: still no audit read');
-- Draft saving in one call.
select tests.expect_rows($q$select public.save_invoice('{"client_id":"00000000-0000-0000-0000-0000000000aa","currency":"JOD","tax_rate":16,"language":"ar"}'::jsonb,
  '[{"description_en":"Assessment","quantity":2,"unit_price":100},{"description_en":"Report","quantity":1,"unit_price":50}]'::jsonb)$q$, 1, 'finance: save_invoice creates a draft with items');
select tests.expect_rows('select 1 from public.invoices where created_by = ''00000000-0000-0000-0000-00000000a003'' and subtotal = 250 and tax_amount = 40 and total = 290 and language = ''ar''', 1, 'finance: saved totals are correct');
select tests.expect_error($q$select public.save_invoice('{"client_id":"00000000-0000-0000-0000-0000000000aa"}'::jsonb, '[]'::jsonb, '00000000-0000-0000-0000-0000000030a1')$q$, 'finance: save_invoice refuses an issued invoice');
select tests.expect_error($q$select public.save_invoice('{"client_id":"00000000-0000-0000-0000-0000000000aa"}'::jsonb, '[]'::jsonb, '00000000-0000-0000-0000-0000000030a2', now() - interval '1 day')$q$, 'finance: save_invoice refuses a stale version');
select tests.expect_error($q$select public.save_invoice('{"client_id":"00000000-0000-0000-0000-0000000000aa","project_id":"00000000-0000-0000-0000-00000000e0b1"}'::jsonb, '[]'::jsonb)$q$, 'finance: the project must belong to the same client');
-- Quotes.
select tests.expect_ok('select public.set_quote_status(''00000000-0000-0000-0000-0000000031a1'', ''accepted'')', 'finance: record quote acceptance');
select tests.expect_rows('select public.convert_quote_to_invoice(''00000000-0000-0000-0000-0000000031a1'')', 1, 'finance: convert accepted quote');
select tests.expect_rows('select 1 from public.invoices where quote_id = ''00000000-0000-0000-0000-0000000031a1''', 1, 'finance: one invoice per quote');
select tests.expect_rows('select public.convert_quote_to_invoice(''00000000-0000-0000-0000-0000000031a1'')', 1, 'finance: converting twice returns the same invoice');
select tests.expect_rows('select 1 from public.invoices where quote_id = ''00000000-0000-0000-0000-0000000031a1''', 1, 'finance: still one invoice per quote');
select tests.expect_error('update public.quotes set status = ''declined'' where id = ''00000000-0000-0000-0000-0000000031a1''', 'finance: quote status cannot be set directly');
select tests.logout();
select tests.expect_rows($q$select 1 from public.audit_logs where entity_id = '00000000-0000-0000-0000-0000000030a1' and action = 'invoice.status_changed' and metadata ->> 'from' = 'paid'$q$, 1,
  'audit: returning to issued after a payment removal is recorded as a status change');
select tests.expect_rows($q$select 1 from public.audit_logs where entity_id = '00000000-0000-0000-0000-0000000030a1' and action = 'invoice.issued' and metadata ->> 'from' <> 'draft'$q$, 0,
  'audit: "issued" is only recorded for the first issue');
select tests.expect_rows($q$select 1 from public.audit_logs where entity_id = '00000000-0000-0000-0000-0000000031a1' and action = 'quote.status_changed' and metadata ->> 'to' = 'accepted'$q$, 1,
  'audit: quote outcomes are status changes');
rollback;

begin;
select tests.login('00000000-0000-0000-0000-00000000a002');
select tests.expect_error('select public.record_payment(''00000000-0000-0000-0000-0000000030a1'', 10, current_date - 1, ''cash'')', 'admin: no payments without finance.write');
select tests.expect_error($q$select public.save_quote('{"client_id":"00000000-0000-0000-0000-0000000000aa"}'::jsonb, '[]'::jsonb)$q$, 'admin: no drafts without finance.write');
rollback;

-- =============================================================================
-- Certificates and reports
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a004');
select tests.expect_error('update public.certificates set status = ''issued'' where id = ''00000000-0000-0000-0000-0000000040a2''', 'hr: certificate status cannot be set directly');
select tests.expect_error('update public.certificates set status = ''draft'' where id = ''00000000-0000-0000-0000-0000000040a1''', 'hr: an issued certificate cannot return to draft');
select tests.expect_error('update public.certificates set program_name_en = ''changed'' where id = ''00000000-0000-0000-0000-0000000040a1''', 'hr: every field of an issued certificate is frozen');
rollback;

begin;
select tests.login('00000000-0000-0000-0000-00000000a006');
select tests.expect_error('insert into public.engagement_reports (engagement_id, version, title, storage_path, status, uploaded_by) values (''00000000-0000-0000-0000-0000000020a1'', 3, ''x'', ''00000000-0000-0000-0000-0000000020a1/reports/v3.pdf'', ''final'', ''00000000-0000-0000-0000-00000000a006'')', 'security: a report cannot be inserted as final');
select tests.expect_error('insert into public.engagement_reports (engagement_id, version, title, storage_path, uploaded_by) values (''00000000-0000-0000-0000-0000000020a1'', 3, ''x'', ''00000000-0000-0000-0000-0000000020a1/evidence/00000000-0000-0000-0000-0000000022a1/shot.png'', ''00000000-0000-0000-0000-00000000a006'')', 'security: a report cannot point at an evidence file');
select tests.expect_ok('insert into public.engagement_reports (engagement_id, version, title, storage_path, uploaded_by) values (''00000000-0000-0000-0000-0000000020a1'', 3, ''x'', ''00000000-0000-0000-0000-0000000020a1/reports/v3.pdf'', ''00000000-0000-0000-0000-00000000a006'')', 'security: can upload a draft version');
select tests.expect_ok('update public.engagement_reports set status = ''final'' where id = ''00000000-0000-0000-0000-0000000024a1''', 'security lead (security.report): can finalise');
select tests.expect_rows('select 1 from public.engagement_reports where id = ''00000000-0000-0000-0000-0000000024a1'' and issued_by = ''00000000-0000-0000-0000-00000000a006'' and issued_at is not null', 1, 'security: finalisation stamped');
-- Engagement creation through the function puts the creator on the roster.
select tests.expect_rows($q$select public.create_engagement('SEC-2026-0099', 'New test', 'penetration_test', '00000000-0000-0000-0000-0000000000aa', null, null)$q$, 1, 'security team: can create an engagement');
select tests.expect_rows('select 1 from public.security_engagements where code = ''SEC-2026-0099''', 1, 'security team: sees the engagement they created');
select tests.expect_error('update public.security_engagements set client_id = ''00000000-0000-0000-0000-0000000000bb'' where id = ''00000000-0000-0000-0000-0000000020a1''', 'security member: cannot move an authorised engagement to another client');
rollback;

-- =============================================================================
-- Content workflow
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a008');
select tests.expect_error('update public.articles set status = ''archived'' where id = ''00000000-0000-0000-0000-0000000051a1''', 'editor: cannot archive published content');
select tests.expect_error('update public.articles set status = ''draft'' where id = ''00000000-0000-0000-0000-0000000051a1''', 'editor: cannot unpublish');
rollback;

begin;
select tests.anon();
select tests.expect_error('select created_by from public.articles', 'anon: editor columns of articles are not readable');
select tests.expect_error('select user_id from public.authors', 'anon: author account link is not readable');
select tests.expect_rows('select id, slug from public.articles', 1, 'anon: published article columns readable');
rollback;

-- =============================================================================
-- Audit, rate limits, business time
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a009');
select tests.expect_error($q$select public.record_audit_event('invoice.issued', 'invoice', 'x', _actor_id => '00000000-0000-0000-0000-00000000a009')$q$, 'employee: cannot write audit events');
select tests.expect_error($q$select public.consume_rate_limit('k', 1, 60)$q$, 'employee: cannot touch the rate limiter');
rollback;

begin;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select tests.expect_rows($q$select 1 where public.consume_rate_limit('test:key', 2, 60)$q$, 1, 'rate limit: first hit allowed');
select tests.expect_rows($q$select 1 where public.consume_rate_limit('test:key', 2, 60)$q$, 1, 'rate limit: second hit allowed');
select tests.expect_rows($q$select 1 where not public.consume_rate_limit('test:key', 2, 60)$q$, 1, 'rate limit: third hit refused');
select tests.expect_ok($q$select public.record_audit_event('payment.recorded', 'invoice', 'x', '{}'::jsonb, _actor_id => '00000000-0000-0000-0000-00000000a003')$q$, 'service: writes audit events with an explicit actor');
select tests.expect_rows($q$select 1 from public.audit_logs where action = 'payment.recorded' and actor_email = 'finance@test.local'$q$, 1, 'service: audit actor resolved');
select tests.expect_ok('select public.run_scheduled_jobs()', 'service: scheduled jobs run');
rollback;

do $$ begin
  if private.business_today() <> (now() at time zone 'Asia/Amman')::date then raise exception 'business_today is not the Amman date'; end if;
  raise notice 'ok  business time: today is the Amman calendar date';
end $$;
