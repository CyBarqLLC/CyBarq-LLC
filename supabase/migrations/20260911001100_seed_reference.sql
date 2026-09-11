-- 0011 Reference data: roles, permissions, the role to permission matrix,
-- categories and departments. No business records, no demo users.

insert into public.permissions (key, description) values
  ('users.manage', 'Provision, activate and deactivate accounts; assign roles'),
  ('roles.manage', 'Edit roles and their permissions'),
  ('audit.read', 'Read the audit log'),
  ('settings.manage', 'Change platform settings and brand assets'),
  ('clients.read', 'Read all client records and contact submissions'),
  ('clients.write', 'Create and edit clients, contacts and client users'),
  ('projects.read_all', 'Read every project regardless of membership'),
  ('projects.write', 'Create, edit and delete projects and manage members'),
  ('tasks.write', 'Create and edit tasks on any project'),
  ('hr.read', 'Read employee records and documents'),
  ('hr.write', 'Create and edit employees, departments, teams and HR documents'),
  ('finance.read', 'Read quotes, invoices and payments'),
  ('finance.write', 'Create and edit draft quotes and invoices, record payments'),
  ('finance.issue', 'Issue and void quotes and invoices'),
  ('security.read_all', 'Read every security engagement and finding'),
  ('security.write', 'Create and edit engagements, assets, findings and evidence'),
  ('security.report', 'Finalise security reports'),
  ('content.read', 'Read draft content'),
  ('content.write', 'Create and edit content'),
  ('content.publish', 'Publish, schedule, archive and delete content'),
  ('certificates.read', 'Read all certificates'),
  ('certificates.issue', 'Create, issue and revoke certificates')
on conflict (key) do update set description = excluded.description;

insert into public.roles (key, name_en, name_ar, description, is_system) values
  ('super_admin', 'Super Admin', 'مدير أعلى', 'Full control including super admin membership', true),
  ('admin', 'Admin', 'مدير النظام', 'Administers users, clients, projects, content and settings', true),
  ('finance', 'Finance', 'المالية', 'Quotes, invoices and payments', true),
  ('hr', 'HR', 'الموارد البشرية', 'Employees, departments and HR documents', true),
  ('project_manager', 'Project Manager', 'مدير مشاريع', 'Clients, projects, members and tasks', true),
  ('security_team', 'Security Team', 'فريق الأمن', 'Security engagements and findings', true),
  ('developer', 'Developer', 'مطوّر', 'Works on assigned projects', true),
  ('content_editor', 'Content Editor', 'محرر محتوى', 'Writes and edits public content', true),
  ('employee', 'Employee', 'موظف', 'Base role for every employee', true),
  ('client', 'Client', 'عميل', 'Client portal access to their own organisation', true)
on conflict (key) do update set name_en = excluded.name_en, name_ar = excluded.name_ar, description = excluded.description;

-- Deny by default: only what each role needs.
insert into public.role_permissions (role_key, permission_key)
select r.key, p.key from public.roles r cross join public.permissions p where r.key = 'super_admin'
union all
select 'admin', p.key from public.permissions p
  where p.key in ('users.manage', 'audit.read', 'settings.manage', 'clients.read', 'clients.write',
    'projects.read_all', 'projects.write', 'tasks.write', 'content.read', 'content.write', 'content.publish',
    'certificates.read', 'certificates.issue', 'hr.read', 'finance.read')
union all
select 'finance', p.key from public.permissions p
  where p.key in ('clients.read', 'finance.read', 'finance.write', 'finance.issue')
union all
select 'hr', p.key from public.permissions p
  where p.key in ('hr.read', 'hr.write', 'certificates.read', 'certificates.issue')
union all
select 'project_manager', p.key from public.permissions p
  where p.key in ('clients.read', 'clients.write', 'projects.read_all', 'projects.write', 'tasks.write')
union all
select 'security_team', p.key from public.permissions p
  where p.key in ('security.write', 'security.report')
union all
select 'content_editor', p.key from public.permissions p
  where p.key in ('content.read', 'content.write')
on conflict do nothing;
-- developer, employee and client carry no global permissions; their access
-- comes entirely from membership rows.

insert into public.categories (kind, slug, name_en, name_ar, position) values
  ('news', 'company', 'Company', 'الشركة', 1),
  ('news', 'partnerships', 'Partnerships', 'الشراكات', 2),
  ('news', 'events', 'Events', 'الفعاليات', 3),
  ('article', 'cybersecurity', 'Cybersecurity', 'الأمن السيبراني', 1),
  ('article', 'engineering', 'Engineering', 'الهندسة', 2),
  ('article', 'ai', 'Artificial Intelligence', 'الذكاء الاصطناعي', 3),
  ('article', 'infrastructure', 'Infrastructure', 'البنية التحتية', 4)
on conflict (kind, slug) do nothing;

insert into public.departments (name_en, name_ar, position) values
  ('Management', 'الإدارة', 1),
  ('Cybersecurity', 'الأمن السيبراني', 2),
  ('Engineering', 'الهندسة', 3),
  ('Operations', 'العمليات', 4)
on conflict do nothing;
