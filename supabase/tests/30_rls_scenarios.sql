-- RLS scenario suite. Each block runs in its own transaction as one actor and
-- is rolled back, so scenarios never leak state into each other.
-- Actors: anon, super admin, admin, finance, HR, PM, security (member), security2
-- (not a member), developer (project member), plain employee, editor, client A, client B.

\set ON_ERROR_STOP on
\set QUIET on

-- =============================================================================
-- Anonymous
-- =============================================================================
begin;
select tests.anon();
select tests.expect_rows('select 1 from public.profiles', 0, 'anon: no profiles');
select tests.expect_rows('select 1 from public.clients', 0, 'anon: no clients');
select tests.expect_rows('select 1 from public.projects', 0, 'anon: no projects');
select tests.expect_rows('select 1 from public.tasks', 0, 'anon: no tasks');
select tests.expect_rows('select 1 from public.invoices', 0, 'anon: no invoices');
select tests.expect_rows('select 1 from public.employees', 0, 'anon: no employees');
select tests.expect_rows('select 1 from public.findings', 0, 'anon: no findings');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'anon: no engagements');
select tests.expect_rows('select 1 from public.certificates', 0, 'anon: no certificates');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'anon: no audit logs');
select tests.expect_rows('select 1 from public.notifications', 0, 'anon: no notifications');
select tests.expect_rows('select 1 from public.contact_submissions', 0, 'anon: no contact submissions');
select tests.expect_rows('select 1 from public.articles', 1, 'anon: only the published article');
select tests.expect_rows('select 1 from public.news_posts', 1, 'anon: only published news (scheduled hidden)');
select tests.expect_rows('select slug from public.public_projects', 1, 'anon: published public projects');
select tests.expect_error('select internal_project_id from public.public_projects', 'anon: internal_project_id column is not readable');
select tests.expect_error('select * from public.public_projects', 'anon: select * is refused on public_projects');
select tests.expect_error('insert into public.articles (slug, title_en, title_ar) values (''x'', ''x'', ''x'')', 'anon: cannot insert content');
select tests.expect_error('insert into public.contact_submissions (name, email, message) values (''a'', ''a@b.c'', ''m'')', 'anon: cannot insert contact submissions directly');
select tests.expect_error('select private.has_permission(''audit.read'')', 'anon: cannot call private helpers');
select tests.expect_error('select public.my_permissions()', 'anon: cannot call my_permissions');
select tests.expect_error('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', now())', 'anon: cannot call issue_invoice');
select tests.expect_rows('select * from public.verify_certificate(''abc123abc123abc123'')', 1, 'anon: can verify an issued certificate');
select tests.expect_rows('select * from public.verify_certificate(''draft0draft0draft0'')', 0, 'anon: draft certificates do not verify');
select tests.expect_rows('select * from public.verify_certificate(''nope'')', 0, 'anon: unknown code returns nothing');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''public-content''', 1, 'anon: public content bucket readable');
select tests.expect_rows('select 1 from storage.objects where bucket_id <> ''public-content''', 0, 'anon: private buckets invisible');
rollback;

-- =============================================================================
-- Plain employee (role employee, no memberships)
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a009');
select tests.expect_rows('select 1 from public.profiles where id = ''00000000-0000-0000-0000-00000000a009''', 1, 'employee: sees own profile');
select tests.expect_rows('select 1 from public.profiles where kind = ''client''', 0, 'employee: cannot see client profiles');
select tests.expect_rows('select 1 from public.employees', 1, 'employee: only own HR record');
select tests.expect_rows('select 1 from public.employees where emergency_contact_name = ''Private Contact''', 0, 'employee: cannot read colleague HR data');
select tests.expect_rows('select 1 from public.employee_directory', 3, 'employee: directory lists active colleagues');
select tests.expect_rows('select 1 from public.employee_documents', 0, 'employee: no HR documents of others');
select tests.expect_rows('select 1 from public.clients', 0, 'employee: no clients');
select tests.expect_rows('select 1 from public.projects', 0, 'employee: no projects without membership');
select tests.expect_rows('select 1 from public.tasks', 0, 'employee: no tasks');
select tests.expect_rows('select 1 from public.invoices', 0, 'employee: finance hidden');
select tests.expect_rows('select 1 from public.quotes', 0, 'employee: quotes hidden');
select tests.expect_rows('select 1 from public.findings', 0, 'employee: findings hidden');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'employee: engagements hidden');
select tests.expect_rows('select 1 from public.certificates', 0, 'employee: certificates hidden');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'employee: audit hidden');
select tests.expect_rows('select 1 from public.articles', 1, 'employee: only published content');
select tests.expect_error('insert into public.clients (name_en) values (''X'')', 'employee: cannot create clients');
select tests.expect_error('insert into public.projects (code, name_en) values (''X'', ''X'')', 'employee: cannot create projects');
select tests.expect_error('insert into public.invoices (client_id, created_by) values (''00000000-0000-0000-0000-0000000000aa'', ''00000000-0000-0000-0000-00000000a009'')', 'employee: cannot create invoices');
select tests.expect_error('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000a009'', ''admin'')', 'employee: cannot grant self a role');
select tests.expect_error('update public.profiles set kind = ''client'' where id = ''00000000-0000-0000-0000-00000000a009''', 'employee: cannot change own kind');
select tests.expect_ok('update public.profiles set locale = ''ar'' where id = ''00000000-0000-0000-0000-00000000a009''', 'employee: can change own locale');
select tests.expect_no_effect('update public.profiles set full_name = ''hacked'' where id = ''00000000-0000-0000-0000-00000000a007''', 'employee: cannot edit another profile');
select tests.expect_error('select private.next_document_number(''invoice'')', 'employee: cannot call numbering function');
select tests.expect_rows('select 1 from storage.objects where bucket_id in (''private-project-documents'', ''private-security-reports'', ''private-hr-documents'', ''private-finance-documents'', ''private-certificates'')', 0, 'employee: no private files');
rollback;

-- =============================================================================
-- Developer (project member on e0a1)
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a007');
select tests.expect_rows('select 1 from public.projects', 1, 'dev: sees only the project they are on');
select tests.expect_rows('select 1 from public.projects where id = ''00000000-0000-0000-0000-00000000e0b1''', 0, 'dev: cannot see project B');
select tests.expect_rows('select 1 from public.clients', 1, 'dev: sees the client of their project only');
select tests.expect_rows('select 1 from public.client_contacts', 1, 'dev: contacts of their project client only');
select tests.expect_rows('select 1 from public.tasks', 1, 'dev: tasks of their project only');
select tests.expect_rows('select 1 from public.milestones', 2, 'dev: all milestones of their project incl. internal');
select tests.expect_rows('select 1 from public.project_updates', 2, 'dev: all updates of their project');
select tests.expect_rows('select 1 from public.project_documents', 2, 'dev: all documents of their project');
select tests.expect_rows('select 1 from public.activity', 8, 'dev: activity of their project only');
select tests.expect_ok('insert into public.tasks (project_id, title, created_by) values (''00000000-0000-0000-0000-00000000e0a1'', ''New'', ''00000000-0000-0000-0000-00000000a007'')', 'dev: can create a task on their project');
select tests.expect_error('insert into public.tasks (project_id, title) values (''00000000-0000-0000-0000-00000000e0b1'', ''Nope'')', 'dev: cannot create a task on project B');
select tests.expect_ok('update public.tasks set status = ''in_progress'' where id = ''00000000-0000-0000-0000-0000000010a1''', 'dev: can update a task on their project');
select tests.expect_no_effect('update public.tasks set status = ''done'' where id = ''00000000-0000-0000-0000-0000000010b1''', 'dev: cannot update tasks on project B');
select tests.expect_no_effect('delete from public.tasks where id = ''00000000-0000-0000-0000-0000000010a1''', 'dev: members cannot delete tasks');
select tests.expect_ok('insert into public.task_comments (task_id, author_id, body) values (''00000000-0000-0000-0000-0000000010a1'', ''00000000-0000-0000-0000-00000000a007'', ''hi'')', 'dev: can comment');
select tests.expect_error('insert into public.task_comments (task_id, author_id, body) values (''00000000-0000-0000-0000-0000000010a1'', ''00000000-0000-0000-0000-00000000a005'', ''spoof'')', 'dev: cannot comment as someone else');
select tests.expect_error('insert into public.project_members (project_id, user_id) values (''00000000-0000-0000-0000-00000000e0b1'', ''00000000-0000-0000-0000-00000000a007'')', 'dev: cannot add self to project B');
select tests.expect_no_effect('update public.projects set status = ''completed'' where id = ''00000000-0000-0000-0000-00000000e0a1''', 'dev: members cannot edit the project');
-- The security engagement is attached to the same project; membership does not grant findings.
select tests.expect_rows('select 1 from public.security_engagements', 0, 'dev: project membership does not expose engagements');
select tests.expect_rows('select 1 from public.findings', 0, 'dev: project membership does not expose findings');
select tests.expect_rows('select 1 from public.finding_evidence', 0, 'dev: no evidence');
select tests.expect_rows('select 1 from public.engagement_reports', 0, 'dev: no security reports');
select tests.expect_rows('select 1 from public.invoices', 0, 'dev: no finance');
select tests.expect_rows('select 1 from public.employees', 1, 'dev: only own HR record');
select tests.expect_rows('select 1 from public.employee_documents', 1, 'dev: sees own HR documents');
select tests.expect_rows('select 1 from public.certificates', 1, 'dev: sees the certificate issued to them');
select tests.expect_rows('select 1 from public.notifications', 2, 'dev: has task and project notifications');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-project-documents''', 2, 'dev: storage shows files of their project only');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-security-reports''', 0, 'dev: no security files');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-hr-documents''', 1, 'dev: own HR file only');
select tests.expect_ok('insert into storage.objects (bucket_id, name) values (''private-project-documents'', ''00000000-0000-0000-0000-00000000e0a1/new.pdf'')', 'dev: can upload to their project folder');
select tests.expect_error('insert into storage.objects (bucket_id, name) values (''private-project-documents'', ''00000000-0000-0000-0000-00000000e0b1/new.pdf'')', 'dev: cannot upload to project B folder');
select tests.expect_error('insert into storage.objects (bucket_id, name) values (''private-security-reports'', ''00000000-0000-0000-0000-0000000020a1/reports/x.pdf'')', 'dev: cannot upload security files');
rollback;

-- =============================================================================
-- Security team member (lead of engagement 20a1)
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a006');
select tests.expect_rows('select 1 from public.security_engagements', 1, 'sec: sees their engagement');
select tests.expect_rows('select 1 from public.findings', 1, 'sec: sees findings');
select tests.expect_rows('select 1 from public.finding_evidence', 1, 'sec: sees evidence');
select tests.expect_rows('select 1 from public.engagement_reports', 2, 'sec: sees all report versions');
select tests.expect_ok('insert into public.findings (engagement_id, ref_code, title, severity, created_by) values (''00000000-0000-0000-0000-0000000020a1'', ''F-002'', ''XSS'', ''medium'', ''00000000-0000-0000-0000-00000000a006'')', 'sec: can add a finding');
select tests.expect_ok('update public.findings set status = ''in_remediation'' where id = ''00000000-0000-0000-0000-0000000022a1''', 'sec: can update a finding');
select tests.expect_no_effect('delete from public.findings where id = ''00000000-0000-0000-0000-0000000022a1''', 'sec: cannot delete findings without read_all');
select tests.expect_ok('insert into public.security_engagements (code, title, created_by) values (''SEC-2026-0099'', ''New'', ''00000000-0000-0000-0000-00000000a006'')', 'sec: can create an engagement');
select tests.expect_error('update public.engagement_reports set storage_path = ''x'' where id = ''00000000-0000-0000-0000-0000000024a2''', 'sec: final report is immutable');
select tests.expect_ok('update public.engagement_reports set status = ''final'' where id = ''00000000-0000-0000-0000-0000000024a1''', 'sec: can finalise a draft report (security.report)');
select tests.expect_rows('select 1 from public.projects', 0, 'sec: engagement does not expose the project record');
select tests.expect_rows('select 1 from public.invoices', 0, 'sec: no finance');
select tests.expect_rows('select 1 from public.employees', 1, 'sec: own HR record only');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-security-reports''', 3, 'sec: sees engagement files');
select tests.expect_ok('insert into storage.objects (bucket_id, name) values (''private-security-reports'', ''00000000-0000-0000-0000-0000000020a1/evidence/x.png'')', 'sec: can upload evidence to their engagement');
select tests.expect_error('insert into storage.objects (bucket_id, name) values (''private-security-reports'', ''00000000-0000-0000-0000-0000000099a1/evidence/x.png'')', 'sec: cannot upload to another engagement folder');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'sec: no audit log access');
rollback;

-- Security team member who is NOT on the engagement
begin;
select tests.login('00000000-0000-0000-0000-00000000a010');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'sec2: cannot see engagements they are not on');
select tests.expect_rows('select 1 from public.findings', 0, 'sec2: cannot see findings');
select tests.expect_rows('select 1 from public.finding_evidence', 0, 'sec2: cannot see evidence');
select tests.expect_error('insert into public.findings (engagement_id, ref_code, title, created_by) values (''00000000-0000-0000-0000-0000000020a1'', ''F-009'', ''x'', ''00000000-0000-0000-0000-00000000a010'')', 'sec2: cannot add findings to a foreign engagement');
select tests.expect_no_effect('update public.findings set severity = ''low'' where id = ''00000000-0000-0000-0000-0000000022a1''', 'sec2: cannot update foreign findings');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-security-reports''', 0, 'sec2: no engagement files');
rollback;

-- =============================================================================
-- Project manager
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a005');
select tests.expect_rows('select 1 from public.clients', 2, 'pm: sees all clients');
select tests.expect_rows('select 1 from public.projects', 3, 'pm: sees all projects');
select tests.expect_rows('select 1 from public.tasks', 2, 'pm: sees all tasks');
select tests.expect_ok('insert into public.clients (name_en, created_by) values (''Client C'', ''00000000-0000-0000-0000-00000000a005'')', 'pm: can create a client');
select tests.expect_ok('insert into public.projects (code, name_en, client_id, created_by) values (''PRJ-2026-0099'', ''New'', ''00000000-0000-0000-0000-0000000000aa'', ''00000000-0000-0000-0000-00000000a005'')', 'pm: can create a project');
select tests.expect_ok('insert into public.project_members (project_id, user_id, added_by) values (''00000000-0000-0000-0000-00000000e0b1'', ''00000000-0000-0000-0000-00000000a009'', ''00000000-0000-0000-0000-00000000a005'')', 'pm: can assign an employee');
select tests.expect_rows('select 1 from public.notifications where user_id = ''00000000-0000-0000-0000-00000000a009''', 0, 'pm: cannot read other users notifications');
select tests.expect_rows('select 1 from public.invoices', 0, 'pm: finance hidden');
select tests.expect_rows('select 1 from public.quotes', 0, 'pm: quotes hidden');
select tests.expect_rows('select 1 from public.findings', 0, 'pm: findings hidden even on managed project');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'pm: engagements hidden');
select tests.expect_rows('select 1 from public.employees', 0, 'pm: HR hidden (no own record in fixtures)');
select tests.expect_rows('select 1 from public.employee_documents', 0, 'pm: HR documents hidden');
select tests.expect_rows('select 1 from public.certificates', 0, 'pm: certificates hidden');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'pm: audit hidden');
select tests.expect_error('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000a009'', ''finance'')', 'pm: cannot grant roles');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-project-documents''', 3, 'pm: sees all project files');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-finance-documents''', 0, 'pm: no finance files');
rollback;

-- =============================================================================
-- Finance
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a003');
select tests.expect_rows('select 1 from public.invoices', 3, 'finance: sees all invoices');
select tests.expect_rows('select 1 from public.quotes', 1, 'finance: sees quotes');
select tests.expect_rows('select 1 from public.clients', 2, 'finance: sees clients');
select tests.expect_ok('insert into public.invoices (client_id, created_by) values (''00000000-0000-0000-0000-0000000000bb'', ''00000000-0000-0000-0000-00000000a003'')', 'finance: can create a draft invoice');
select tests.expect_error('insert into public.invoices (client_id, status, created_by) values (''00000000-0000-0000-0000-0000000000bb'', ''issued'', ''00000000-0000-0000-0000-00000000a003'')', 'finance: cannot insert an already issued invoice');
select tests.expect_error('update public.invoices set total = 1 where id = ''00000000-0000-0000-0000-0000000030a1''', 'finance: issued invoice totals are immutable');
select tests.expect_error('insert into public.invoice_items (invoice_id, description_en, unit_price) values (''00000000-0000-0000-0000-0000000030a1'', ''extra'', 10)', 'finance: cannot add items to an issued invoice');
select tests.expect_ok('insert into public.invoice_items (invoice_id, description_en, unit_price) values (''00000000-0000-0000-0000-0000000030a2'', ''extra'', 10)', 'finance: can add items to a draft');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a2'' and total = 510', 1, 'finance: totals recalculated from items');
-- Issue with a stale updated_at fails, with the current one succeeds.
select tests.expect_error('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', now() - interval ''1 hour'')', 'finance: issue with stale version is rejected');
select tests.expect_rows('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', (select updated_at from public.invoices where id = ''00000000-0000-0000-0000-0000000030a2''))', 1, 'finance: issue succeeds with the expected version');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a2'' and status = ''issued'' and number like ''INV-%''', 1, 'finance: invoice numbered and issued');
select tests.expect_error('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', (select updated_at from public.invoices where id = ''00000000-0000-0000-0000-0000000030a2''))', 'finance: cannot issue twice');
select tests.expect_ok('insert into public.payments (invoice_id, amount, recorded_by) values (''00000000-0000-0000-0000-0000000030a1'', 400, ''00000000-0000-0000-0000-00000000a003'')', 'finance: can record a payment');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a1'' and status = ''partially_paid'' and amount_paid = 400', 1, 'finance: payment updates status');
select tests.expect_rows('select public.void_invoice(''00000000-0000-0000-0000-0000000030b1'', ''duplicate'')', 1, 'finance: can void an issued invoice with a reason');
select tests.expect_error('update public.invoices set status = ''issued'' where id = ''00000000-0000-0000-0000-0000000030b1''', 'finance: void invoice cannot be reopened');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'finance: no audit read');
select tests.expect_rows('select 1 from public.employees', 0, 'finance: HR hidden');
select tests.expect_rows('select 1 from public.findings', 0, 'finance: findings hidden');
select tests.expect_rows('select 1 from public.projects', 0, 'finance: projects hidden');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-finance-documents''', 1, 'finance: sees finance files');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-hr-documents''', 0, 'finance: no HR files');
rollback;

-- =============================================================================
-- HR
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a004');
select tests.expect_rows('select 1 from public.employees', 3, 'hr: sees all employees');
select tests.expect_rows('select 1 from public.employee_documents', 1, 'hr: sees HR documents');
select tests.expect_ok('insert into public.employees (user_id, employee_no, job_title_en) values (''00000000-0000-0000-0000-00000000a005'', ''E-005'', ''PM'')', 'hr: can create an employee record');
select tests.expect_rows('select 1 from public.certificates', 2, 'hr: sees certificates');
select tests.expect_ok('insert into public.certificates (type, recipient_name_en, title_en, created_by) values (''training'', ''Student'', ''Course'', ''00000000-0000-0000-0000-00000000a004'')', 'hr: can draft a certificate');
select tests.expect_error('select public.issue_certificate(''00000000-0000-0000-0000-0000000040a2'', now() - interval ''1 day'')', 'hr: stale issue rejected');
select tests.expect_rows('select public.issue_certificate(''00000000-0000-0000-0000-0000000040a2'', (select updated_at from public.certificates where id = ''00000000-0000-0000-0000-0000000040a2''))', 1, 'hr: can issue a certificate');
select tests.expect_rows('select 1 from public.certificates where id = ''00000000-0000-0000-0000-0000000040a2'' and status = ''issued'' and certificate_no like ''CERT-%''', 1, 'hr: certificate numbered');
select tests.expect_error('update public.certificates set recipient_name_en = ''Other'' where id = ''00000000-0000-0000-0000-0000000040a1''', 'hr: issued certificate is immutable');
select tests.expect_rows('select public.revoke_certificate(''00000000-0000-0000-0000-0000000040a1'', ''issued in error'')', 1, 'hr: can revoke');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'hr: no audit read');
select tests.expect_rows('select 1 from public.invoices', 0, 'hr: finance hidden');
select tests.expect_rows('select 1 from public.projects', 0, 'hr: projects hidden');
select tests.expect_rows('select 1 from public.findings', 0, 'hr: findings hidden');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-hr-documents''', 1, 'hr: sees HR files');
select tests.expect_ok('insert into storage.objects (bucket_id, name) values (''private-hr-documents'', ''00000000-0000-0000-0000-00000000a009/id.pdf'')', 'hr: can upload HR files');
rollback;

-- =============================================================================
-- Content editor
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a008');
select tests.expect_rows('select 1 from public.articles', 2, 'editor: sees drafts and published');
select tests.expect_ok('insert into public.articles (slug, title_en, title_ar, created_by) values (''New Article!'', ''n'', ''ن'', ''00000000-0000-0000-0000-00000000a008'')', 'editor: can create a draft');
select tests.expect_rows('select 1 from public.articles where slug = ''new-article''', 1, 'editor: slug normalised');
select tests.expect_error('update public.articles set status = ''published'' where id = ''00000000-0000-0000-0000-0000000051a2''', 'editor: cannot publish without content.publish');
select tests.expect_ok('update public.articles set status = ''review'' where id = ''00000000-0000-0000-0000-0000000051a2''', 'editor: can move to review');
select tests.expect_no_effect('delete from public.articles where id = ''00000000-0000-0000-0000-0000000051a2''', 'editor: cannot delete');
select tests.expect_rows('select internal_project_id from public.public_projects', 1, 'editor: may read internal_project_id');
select tests.expect_rows('select 1 from public.projects', 0, 'editor: internal projects hidden');
select tests.expect_rows('select 1 from public.invoices', 0, 'editor: finance hidden');
select tests.expect_ok('insert into storage.objects (bucket_id, name) values (''public-content'', ''covers/new.jpg'')', 'editor: can upload public content');
rollback;

-- =============================================================================
-- Admin (users.manage, publish, but no finance write, no security, no hr write)
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a002');
select tests.expect_rows('select 1 from public.profiles', 12, 'admin: sees all profiles');
select tests.expect_ok('insert into public.user_roles (user_id, role_key, granted_by) values (''00000000-0000-0000-0000-00000000a009'', ''finance'', ''00000000-0000-0000-0000-00000000a002'')', 'admin: can assign a role');
select tests.expect_rows('select 1 from public.audit_logs where action = ''role.granted'' and entity_id = ''00000000-0000-0000-0000-00000000a009'' and metadata ->> ''role'' = ''finance'' and actor_id = ''00000000-0000-0000-0000-00000000a002''', 1, 'admin: role grant audited with actor');
select tests.expect_error('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000a009'', ''super_admin'')', 'admin: cannot grant super_admin');
select tests.expect_ok('update public.profiles set is_active = false where id = ''00000000-0000-0000-0000-00000000a009''', 'admin: can deactivate a user');
select tests.expect_ok('update public.articles set status = ''published'' where id = ''00000000-0000-0000-0000-0000000051a2''', 'admin: can publish');
select tests.expect_rows('select 1 from public.audit_logs where action = ''content.published'' and entity_id = ''00000000-0000-0000-0000-0000000051a2''', 1, 'admin: publish audited');
select tests.expect_rows('select 1 from public.invoices', 3, 'admin: finance readable (finance.read)');
select tests.expect_error('insert into public.invoices (client_id, created_by) values (''00000000-0000-0000-0000-0000000000aa'', ''00000000-0000-0000-0000-00000000a002'')', 'admin: cannot create invoices without finance.write');
select tests.expect_error('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', now())', 'admin: cannot issue invoices');
select tests.expect_rows('select 1 from public.findings', 0, 'admin: security findings are not admin readable by default');
select tests.expect_rows('select 1 from public.employees', 3, 'admin: hr.read');
select tests.expect_error('insert into public.employees (user_id, job_title_en) values (''00000000-0000-0000-0000-00000000a002'', ''x'')', 'admin: no hr.write');
select tests.expect_rows('select 1 from public.audit_logs', (select count(*) from public.audit_logs), 'admin: audit readable');
select tests.expect_no_effect('update public.audit_logs set action = ''x''', 'admin: audit rows cannot be updated');
select tests.expect_no_effect('delete from public.audit_logs', 'admin: audit rows cannot be deleted');
rollback;

-- Super admin can grant super_admin
begin;
select tests.login('00000000-0000-0000-0000-00000000a001');
select tests.expect_ok('insert into public.user_roles (user_id, role_key) values (''00000000-0000-0000-0000-00000000a002'', ''super_admin'')', 'superadmin: can grant super_admin');
select tests.expect_rows('select 1 from public.findings', 1, 'superadmin: security.read_all');
select tests.expect_ok('delete from public.findings where id = ''00000000-0000-0000-0000-0000000022a1''', 'superadmin: can delete a finding');
select tests.expect_no_effect('delete from public.audit_logs', 'superadmin: audit still append only');
rollback;

-- Even a superuser / service role hits the append only trigger.
begin;
select tests.expect_error('update public.audit_logs set action = ''x''', 'superuser: audit update blocked by trigger');
select tests.expect_error('delete from public.audit_logs', 'superuser: audit delete blocked by trigger');
rollback;

-- =============================================================================
-- Client A
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000c001');
select tests.expect_rows('select 1 from public.profiles', 1, 'clientA: only own profile');
select tests.expect_rows('select 1 from public.clients', 1, 'clientA: own organisation only');
select tests.expect_rows('select 1 from public.clients where id = ''00000000-0000-0000-0000-0000000000bb''', 0, 'clientA: cannot see client B');
select tests.expect_rows('select 1 from public.client_contacts', 0, 'clientA: internal contact list hidden');
select tests.expect_rows('select 1 from public.projects', 1, 'clientA: visible non draft projects only');
select tests.expect_rows('select 1 from public.projects where id = ''00000000-0000-0000-0000-00000000e0a2''', 0, 'clientA: hidden draft project invisible');
select tests.expect_rows('select 1 from public.projects where client_id = ''00000000-0000-0000-0000-0000000000bb''', 0, 'clientA: no client B projects');
select tests.expect_rows('select 1 from public.milestones', 1, 'clientA: client visible milestones only');
select tests.expect_rows('select 1 from public.project_updates', 1, 'clientA: client visible updates only');
select tests.expect_rows('select 1 from public.project_documents', 1, 'clientA: client visible documents only');
select tests.expect_rows('select 1 from public.tasks', 0, 'clientA: tasks never visible');
select tests.expect_rows('select 1 from public.project_members', 0, 'clientA: members not exposed');
select tests.expect_rows('select 1 from public.activity', 0, 'clientA: internal activity hidden');
select tests.expect_rows('select 1 from public.invoices', 1, 'clientA: own issued invoices only (draft hidden)');
select tests.expect_rows('select 1 from public.invoices where client_id = ''00000000-0000-0000-0000-0000000000bb''', 0, 'clientA: no client B invoices');
select tests.expect_rows('select 1 from public.invoice_items', 1, 'clientA: items of own issued invoice');
select tests.expect_rows('select 1 from public.quotes', 1, 'clientA: own sent quote');
select tests.expect_rows('select 1 from public.security_engagements', 1, 'clientA: engagement header visible');
select tests.expect_rows('select 1 from public.findings', 0, 'clientA: findings never visible');
select tests.expect_rows('select 1 from public.finding_evidence', 0, 'clientA: evidence never visible');
select tests.expect_rows('select 1 from public.engagement_assets', 0, 'clientA: assets hidden');
select tests.expect_rows('select 1 from public.engagement_reports', 1, 'clientA: final client visible report only');
select tests.expect_rows('select 1 from public.employees', 0, 'clientA: no HR');
select tests.expect_rows('select 1 from public.employee_directory', 0, 'clientA: no employee directory');
select tests.expect_rows('select 1 from public.certificates', 0, 'clientA: no certificates');
select tests.expect_rows('select 1 from public.audit_logs', 0, 'clientA: no audit');
select tests.expect_ok('insert into public.support_requests (client_id, subject, body, created_by) values (''00000000-0000-0000-0000-0000000000aa'', ''Help'', ''x'', ''00000000-0000-0000-0000-00000000c001'')', 'clientA: can open a support request');
select tests.expect_error('insert into public.support_requests (client_id, subject, body, created_by) values (''00000000-0000-0000-0000-0000000000bb'', ''Help'', ''x'', ''00000000-0000-0000-0000-00000000c001'')', 'clientA: cannot open a request for client B');
select tests.expect_no_effect('update public.projects set name_en = ''x'' where id = ''00000000-0000-0000-0000-00000000e0a1''', 'clientA: cannot edit projects');
select tests.expect_no_effect('update public.invoices set status = ''paid'' where id = ''00000000-0000-0000-0000-0000000030a1''', 'clientA: cannot edit invoices');
select tests.expect_error('insert into public.tasks (project_id, title) values (''00000000-0000-0000-0000-00000000e0a1'', ''x'')', 'clientA: cannot create tasks');
select tests.expect_error('insert into public.project_documents (project_id, title, storage_path, client_visible, uploaded_by) values (''00000000-0000-0000-0000-00000000e0b1'', ''x'', ''00000000-0000-0000-0000-00000000e0b1/x.pdf'', true, ''00000000-0000-0000-0000-00000000c001'')', 'clientA: cannot upload to client B project');
select tests.expect_ok('insert into public.project_documents (project_id, title, storage_path, client_visible, uploaded_by) values (''00000000-0000-0000-0000-00000000e0a1'', ''From client'', ''00000000-0000-0000-0000-00000000e0a1/from-client.pdf'', false, ''00000000-0000-0000-0000-00000000c001'')', 'clientA: can upload to own project');
select tests.expect_rows('select 1 from public.project_documents where title = ''From client'' and client_visible', 1, 'clientA: uploads are forced client visible');
select tests.expect_error('insert into public.client_users (user_id, client_id) values (''00000000-0000-0000-0000-00000000c001'', ''00000000-0000-0000-0000-0000000000bb'')', 'clientA: cannot join client B');
select tests.expect_error('select public.issue_invoice(''00000000-0000-0000-0000-0000000030a2'', now())', 'clientA: cannot call finance RPCs');
select tests.expect_error('select public.issue_certificate(''00000000-0000-0000-0000-0000000040a2'', now())', 'clientA: cannot issue certificates');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-project-documents''', 1, 'clientA: storage shows only client visible file');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-security-reports''', 1, 'clientA: only the final report file');
select tests.expect_rows('select 1 from storage.objects where bucket_id = ''private-finance-documents''', 0, 'clientA: finance files only through the app');
select tests.expect_error('insert into storage.objects (bucket_id, name) values (''private-project-documents'', ''00000000-0000-0000-0000-00000000e0b1/evil.pdf'')', 'clientA: cannot upload into client B folder');
rollback;

-- =============================================================================
-- Client B (mirror checks against A)
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000c002');
select tests.expect_rows('select 1 from public.clients where id = ''00000000-0000-0000-0000-0000000000aa''', 0, 'clientB: cannot see client A');
select tests.expect_rows('select 1 from public.projects', 1, 'clientB: only project B');
select tests.expect_rows('select 1 from public.project_documents', 1, 'clientB: only project B documents');
select tests.expect_rows('select 1 from public.invoices', 1, 'clientB: only own invoice');
select tests.expect_rows('select 1 from public.invoices where id = ''00000000-0000-0000-0000-0000000030a1''', 0, 'clientB: cannot see client A invoice');
select tests.expect_rows('select 1 from public.quotes', 0, 'clientB: no client A quotes');
select tests.expect_rows('select 1 from public.security_engagements', 0, 'clientB: no client A engagements');
select tests.expect_rows('select 1 from public.engagement_reports', 0, 'clientB: no client A reports');
select tests.expect_rows('select 1 from public.support_requests', 0, 'clientB: no client A support requests');
select tests.expect_no_effect('update public.projects set name_en = ''x'' where id = ''00000000-0000-0000-0000-00000000e0a1''', 'clientB: cannot modify client A project');
select tests.expect_no_effect('delete from public.project_documents where id = ''00000000-0000-0000-0000-0000000012a1''', 'clientB: cannot delete client A documents');
select tests.expect_rows('select 1 from storage.objects where name like ''00000000-0000-0000-0000-00000000e0a1/%''', 0, 'clientB: no client A files');
rollback;

-- =============================================================================
-- Deactivated user loses everything
-- =============================================================================
begin;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
update public.profiles set is_active = false where id = '00000000-0000-0000-0000-00000000a003';
select tests.login('00000000-0000-0000-0000-00000000a003');
select tests.expect_rows('select 1 from public.invoices', 0, 'deactivated finance user: no invoices');
select tests.expect_rows('select public.my_permissions()', 0, 'deactivated user: no permissions');
rollback;

-- =============================================================================
-- Query plan check: the permission subquery is an InitPlan, evaluated once.
-- =============================================================================
begin;
select tests.login('00000000-0000-0000-0000-00000000a003');
do $$
declare _txt text := ''; _r record;
begin
  for _r in execute 'explain select id from public.invoices' loop
    _txt := _txt || _r."QUERY PLAN" || E'\n';
  end loop;
  if _txt not like '%InitPlan%' then
    raise exception 'FAIL: expected an InitPlan in the invoices policy plan, got: %', _txt;
  end if;
  raise notice 'ok  planner: permission check is an InitPlan';
end $$;
rollback;
