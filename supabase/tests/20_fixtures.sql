-- Fixture users and records for the RLS suite. Fixed UUIDs make the
-- scenarios readable. Applied as superuser (bypasses RLS on purpose).

select set_config('request.jwt.claims', '{"role":"service_role"}', false);

-- Users (auth trigger creates profiles)
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values
  ('00000000-0000-0000-0000-00000000a001', 'superadmin@test.local', '{"full_name":"Super Admin","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a002', 'admin@test.local', '{"full_name":"Admin","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a003', 'finance@test.local', '{"full_name":"Finance","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a004', 'hr@test.local', '{"full_name":"HR","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a005', 'pm@test.local', '{"full_name":"Project Manager","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a006', 'sec@test.local', '{"full_name":"Security Tester","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a007', 'dev@test.local', '{"full_name":"Developer","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a008', 'editor@test.local', '{"full_name":"Editor","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a009', 'employee@test.local', '{"full_name":"Plain Employee","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000a010', 'sec2@test.local', '{"full_name":"Security Tester Two","kind":"employee"}', '{"kind":"employee"}'),
  ('00000000-0000-0000-0000-00000000c001', 'clienta@test.local', '{"full_name":"Client A User","kind":"client"}', '{"kind":"client"}'),
  ('00000000-0000-0000-0000-00000000c002', 'clientb@test.local', '{"full_name":"Client B User","kind":"client"}', '{"kind":"client"}');

insert into public.user_roles (user_id, role_key) values
  ('00000000-0000-0000-0000-00000000a001', 'super_admin'),
  ('00000000-0000-0000-0000-00000000a002', 'admin'),
  ('00000000-0000-0000-0000-00000000a003', 'finance'),
  ('00000000-0000-0000-0000-00000000a004', 'hr'),
  ('00000000-0000-0000-0000-00000000a005', 'project_manager'),
  ('00000000-0000-0000-0000-00000000a006', 'security_team'),
  ('00000000-0000-0000-0000-00000000a010', 'security_team'),
  ('00000000-0000-0000-0000-00000000a007', 'developer'),
  ('00000000-0000-0000-0000-00000000a008', 'content_editor'),
  ('00000000-0000-0000-0000-00000000a009', 'employee'),
  ('00000000-0000-0000-0000-00000000c001', 'client'),
  ('00000000-0000-0000-0000-00000000c002', 'client');

-- Employees (HR records)
insert into public.employees (user_id, employee_no, job_title_en, start_date, emergency_contact_name) values
  ('00000000-0000-0000-0000-00000000a007', 'E-007', 'Software Engineer', '2025-01-15', 'Private Contact'),
  ('00000000-0000-0000-0000-00000000a009', 'E-009', 'Operations', '2025-03-01', 'Private Contact 2'),
  ('00000000-0000-0000-0000-00000000a006', 'E-006', 'Security Consultant', '2024-11-01', null);

insert into public.employee_documents (id, employee_user_id, kind, title, storage_path) values
  ('00000000-0000-0000-0000-0000000d0001', '00000000-0000-0000-0000-00000000a007', 'contract', 'Contract 007', '00000000-0000-0000-0000-00000000a007/contract.pdf');

-- Clients
insert into public.clients (id, name_en, name_ar) values
  ('00000000-0000-0000-0000-0000000000aa', 'Client A', 'العميل أ'),
  ('00000000-0000-0000-0000-0000000000bb', 'Client B', 'العميل ب');
insert into public.client_users (user_id, client_id, is_primary) values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-0000000000aa', true),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-0000000000bb', true);
insert into public.client_contacts (client_id, name, email) values
  ('00000000-0000-0000-0000-0000000000aa', 'Contact A', 'a@client.local'),
  ('00000000-0000-0000-0000-0000000000bb', 'Contact B', 'b@client.local');

-- Projects
--   e0a1: client A, active, client visible, dev is a member, PM manages
--   e0b1: client B, active, client visible, no members
--   e0a2: client A, draft, hidden
insert into public.projects (id, code, client_id, name_en, practice, status, manager_user_id, client_visible) values
  ('00000000-0000-0000-0000-00000000e0a1', 'CyB-PRJ-000001', '00000000-0000-0000-0000-0000000000aa', 'Portal A', 'development', 'active', '00000000-0000-0000-0000-00000000a005', true),
  ('00000000-0000-0000-0000-00000000e0b1', 'CyB-PRJ-000002', '00000000-0000-0000-0000-0000000000bb', 'Platform B', 'ai', 'active', null, true),
  ('00000000-0000-0000-0000-00000000e0a2', 'CyB-PRJ-000003', '00000000-0000-0000-0000-0000000000aa', 'Hidden A', 'infrastructure', 'draft', null, false);
insert into public.project_members (project_id, user_id, role) values
  ('00000000-0000-0000-0000-00000000e0a1', '00000000-0000-0000-0000-00000000a007', 'member');

insert into public.milestones (id, project_id, title_en, client_visible) values
  ('00000000-0000-0000-0000-00000000f0a1', '00000000-0000-0000-0000-00000000e0a1', 'Discovery', true),
  ('00000000-0000-0000-0000-00000000f0a2', '00000000-0000-0000-0000-00000000e0a1', 'Internal only', false),
  ('00000000-0000-0000-0000-00000000f0b1', '00000000-0000-0000-0000-00000000e0b1', 'Kickoff B', true);

insert into public.tasks (id, project_id, title, assignee_user_id) values
  ('00000000-0000-0000-0000-0000000010a1', '00000000-0000-0000-0000-00000000e0a1', 'Task on A', '00000000-0000-0000-0000-00000000a007'),
  ('00000000-0000-0000-0000-0000000010b1', '00000000-0000-0000-0000-00000000e0b1', 'Task on B', null);

insert into public.project_updates (id, project_id, title, body, client_visible, author_id) values
  ('00000000-0000-0000-0000-0000000011a1', '00000000-0000-0000-0000-00000000e0a1', 'Visible update A', 'x', true, '00000000-0000-0000-0000-00000000a005'),
  ('00000000-0000-0000-0000-0000000011a2', '00000000-0000-0000-0000-00000000e0a1', 'Internal update A', 'x', false, '00000000-0000-0000-0000-00000000a005'),
  ('00000000-0000-0000-0000-0000000011b1', '00000000-0000-0000-0000-00000000e0b1', 'Visible update B', 'x', true, '00000000-0000-0000-0000-00000000a005');

insert into public.project_documents (id, project_id, title, storage_path, client_visible, uploaded_by) values
  ('00000000-0000-0000-0000-0000000012a1', '00000000-0000-0000-0000-00000000e0a1', 'Proposal A', '00000000-0000-0000-0000-00000000e0a1/proposal.pdf', true, '00000000-0000-0000-0000-00000000a005'),
  ('00000000-0000-0000-0000-0000000012a2', '00000000-0000-0000-0000-00000000e0a1', 'Internal notes A', '00000000-0000-0000-0000-00000000e0a1/notes.pdf', false, '00000000-0000-0000-0000-00000000a005'),
  ('00000000-0000-0000-0000-0000000012b1', '00000000-0000-0000-0000-00000000e0b1', 'Proposal B', '00000000-0000-0000-0000-00000000e0b1/proposal.pdf', true, '00000000-0000-0000-0000-00000000a005');

-- Security engagement on client A, project e0a1, lead sec (a006). sec2 (a010) is not a member.
insert into public.security_engagements (id, code, client_id, project_id, title, type, status, lead_user_id) values
  ('00000000-0000-0000-0000-0000000020a1', 'CyB-SEC-000001', '00000000-0000-0000-0000-0000000000aa', '00000000-0000-0000-0000-00000000e0a1', 'Web app test A', 'penetration_test', 'active', '00000000-0000-0000-0000-00000000a006');
insert into public.engagement_assets (id, engagement_id, name, type, identifier) values
  ('00000000-0000-0000-0000-0000000021a1', '00000000-0000-0000-0000-0000000020a1', 'Portal', 'web_app', 'https://portal.client-a.local');
insert into public.findings (id, engagement_id, asset_id, ref_code, title, severity, created_by) values
  ('00000000-0000-0000-0000-0000000022a1', '00000000-0000-0000-0000-0000000020a1', '00000000-0000-0000-0000-0000000021a1', 'F-001', 'IDOR on invoices', 'high', '00000000-0000-0000-0000-00000000a006');
insert into public.finding_evidence (id, finding_id, storage_path, uploaded_by) values
  ('00000000-0000-0000-0000-0000000023a1', '00000000-0000-0000-0000-0000000022a1', '00000000-0000-0000-0000-0000000020a1/evidence/00000000-0000-0000-0000-0000000022a1/shot.png', '00000000-0000-0000-0000-00000000a006');
insert into public.engagement_reports (id, engagement_id, version, title, storage_path, status, client_visible, uploaded_by) values
  ('00000000-0000-0000-0000-0000000024a1', '00000000-0000-0000-0000-0000000020a1', 1, 'Draft report', '00000000-0000-0000-0000-0000000020a1/reports/v1.pdf', 'draft', false, '00000000-0000-0000-0000-00000000a006'),
  ('00000000-0000-0000-0000-0000000024a2', '00000000-0000-0000-0000-0000000020a1', 2, 'Final report', '00000000-0000-0000-0000-0000000020a1/reports/v2.pdf', 'final', true, '00000000-0000-0000-0000-00000000a006');

-- Finance: invoices for A (issued, draft) and B (issued); quote for A sent.
-- Items are added while the invoices are drafts; totals are derived from them.
insert into public.invoices (id, client_id, status, created_by) values
  ('00000000-0000-0000-0000-0000000030a1', '00000000-0000-0000-0000-0000000000aa', 'draft', '00000000-0000-0000-0000-00000000a003'),
  ('00000000-0000-0000-0000-0000000030a2', '00000000-0000-0000-0000-0000000000aa', 'draft', '00000000-0000-0000-0000-00000000a003'),
  ('00000000-0000-0000-0000-0000000030b1', '00000000-0000-0000-0000-0000000000bb', 'draft', '00000000-0000-0000-0000-00000000a003');
insert into public.invoice_items (invoice_id, description_en, quantity, unit_price) values
  ('00000000-0000-0000-0000-0000000030a1', 'Penetration test', 1, 1000),
  ('00000000-0000-0000-0000-0000000030b1', 'Consulting', 1, 500);
insert into public.invoice_items (invoice_id, description_en, quantity, unit_price) values
  ('00000000-0000-0000-0000-0000000030a2', 'Draft line', 2, 250);
update public.invoices set status = 'issued', number = 'CyB-INV-000001', issue_date = '2026-09-01', due_date = '2026-10-01', issued_at = now()
  where id = '00000000-0000-0000-0000-0000000030a1';
update public.invoices set status = 'issued', number = 'CyB-INV-000002', issue_date = '2026-09-01', due_date = '2026-10-01', issued_at = now()
  where id = '00000000-0000-0000-0000-0000000030b1';
insert into public.quotes (id, number, client_id, status, issue_date, subtotal, total, created_by) values
  ('00000000-0000-0000-0000-0000000031a1', 'CyB-QTE-000001', '00000000-0000-0000-0000-0000000000aa', 'sent', '2026-09-01', 900, 900, '00000000-0000-0000-0000-00000000a003');

-- Certificates: one issued (recipient dev), one draft.
insert into public.certificates (id, certificate_no, verification_code, type, status, recipient_name_en, recipient_user_id, title_en, issue_date, created_by) values
  ('00000000-0000-0000-0000-0000000040a1', 'CyB-CRT-000001', 'abc123abc123abc123', 'training', 'issued', 'Developer', '00000000-0000-0000-0000-00000000a007', 'Secure coding', '2026-08-01', '00000000-0000-0000-0000-00000000a004'),
  ('00000000-0000-0000-0000-0000000040a2', null, 'draft0draft0draft0', 'experience', 'draft', 'Someone', null, 'Experience letter', null, '00000000-0000-0000-0000-00000000a004');

-- Content: one published article, one draft; one published news; one public project with internal link.
insert into public.authors (id, name_en, name_ar) values ('00000000-0000-0000-0000-0000000050a1', 'CyBarq Team', 'فريق سايبرق');
insert into public.articles (id, slug, title_en, title_ar, status, published_at, author_id, created_by) values
  ('00000000-0000-0000-0000-0000000051a1', 'published-article', 'Published', 'منشور', 'published', now() - interval '1 day', '00000000-0000-0000-0000-0000000050a1', '00000000-0000-0000-0000-00000000a008'),
  ('00000000-0000-0000-0000-0000000051a2', 'draft-article', 'Draft', 'مسودة', 'draft', null, '00000000-0000-0000-0000-0000000050a1', '00000000-0000-0000-0000-00000000a008');
insert into public.news_posts (id, slug, title_en, title_ar, status, published_at, scheduled_for, created_by) values
  ('00000000-0000-0000-0000-0000000052a1', 'published-news', 'News', 'خبر', 'published', now() - interval '1 day', null, '00000000-0000-0000-0000-00000000a008'),
  ('00000000-0000-0000-0000-0000000052a2', 'future-news', 'Scheduled', 'مجدول', 'scheduled', null, now() + interval '1 day', '00000000-0000-0000-0000-00000000a008');
insert into public.public_projects (id, slug, title_en, title_ar, status, internal_project_id, created_by) values
  ('00000000-0000-0000-0000-0000000053a1', 'showcase', 'Showcase', 'معرض', 'published', '00000000-0000-0000-0000-00000000e0a1', '00000000-0000-0000-0000-00000000a008');

-- Storage objects mirroring the records above (shim table).
insert into storage.objects (bucket_id, name) values
  ('private-project-documents', '00000000-0000-0000-0000-00000000e0a1/proposal.pdf'),
  ('private-project-documents', '00000000-0000-0000-0000-00000000e0a1/notes.pdf'),
  ('private-project-documents', '00000000-0000-0000-0000-00000000e0b1/proposal.pdf'),
  ('private-security-reports', '00000000-0000-0000-0000-0000000020a1/reports/v1.pdf'),
  ('private-security-reports', '00000000-0000-0000-0000-0000000020a1/reports/v2.pdf'),
  ('private-security-reports', '00000000-0000-0000-0000-0000000020a1/evidence/00000000-0000-0000-0000-0000000022a1/shot.png'),
  ('private-hr-documents', '00000000-0000-0000-0000-00000000a007/contract.pdf'),
  ('private-finance-documents', 'invoices/00000000-0000-0000-0000-0000000030a1.pdf'),
  ('private-certificates', '00000000-0000-0000-0000-0000000040a1.pdf'),
  ('public-content', 'covers/hero.jpg');

select set_config('request.jwt.claims', '', false);

-- Sanity: audit rows were produced by the fixture inserts.
do $$ begin
  if (select count(*) from public.audit_logs) = 0 then raise exception 'audit triggers produced no rows'; end if;
end $$;
