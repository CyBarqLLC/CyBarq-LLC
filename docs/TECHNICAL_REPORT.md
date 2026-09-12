# CyBarq Platform. Technical report

Rebuild of cybarq.com into a bilingual public website, internal company platform and client portal. September 2026.

## 1. What was changed

- The static GitHub Pages site (20 hand written HTML files, FFF Acid Grotesk and Zagel fonts, glass and neon visual language) was replaced by a Next.js 15 application in the same repository. The old site is preserved under `legacy/` for reference and can be deleted after go live. `CNAME` moved with it so GitHub Pages no longer serves the repository root.
- Existing content was carried over, not rewritten from scratch: the six original services (now inside the Cybersecurity and Digital Engineering practices, with their original problem / approach / outcome copy improved), the company story, registration statement, statistics, contact channels, social links and SEO patterns. Old URLs redirect permanently to the new localized routes.
- The 2026 brand kit is the visual baseline: Thmanyah Sans (five weights, both languages), the exact palette, square corners, 1px Fog rules, the logo set as inline SVG from the master, the pictogram family as a React component, the blade and corner marks, and the Stream pattern as both a static SVG (server rendered) and a calm animated canvas whose maths mirrors the brand's pattern generator (same blade proportion, 20.2 degree apex, grid of h/14, band and accent rules).

## 2. Architecture implemented

Single Next.js 15 App Router application (React 19, TypeScript strict, Tailwind v4, Radix primitives, next-intl v4, Zod, `@react-pdf/renderer`, Resend) on Vercel, with Supabase (Postgres, Auth, Storage, RLS) as the backend. Server Components for reads, Server Actions for writes, route handlers for PDF streams, private file access, the auth callback and a cron endpoint. Two Supabase clients: the user's cookie session client (RLS applies) for every read and write on behalf of the user, and a `server-only` service role client used after explicit permission checks for provisioning, signed URLs, PDF storage and contact submissions. Localized routes `/en/...` and `/ar/...`, RTL handled at the document level with logical CSS properties throughout.

## 3. Public website pages (both languages)

Home (Stream hero, four practices, how we work, statement panel, selected services, latest content, partners and certifications, registration, CTA), About, Services index, four practice pages, 33 service pages with a consistent narrative (hero, problem, where it appears, approach, engagement, deliverables, business meaning, related, CTA; penetration testing additionally covers findings, remediation guidance and retesting), Projects (list and detail), Case studies (list and detail with verified impact marks), News (list and detail), Articles (list and detail with author and reading time), Careers, Contact (channels and a validated, rate limited form stored in the database and forwarded by email), Certificate verification (`/verify` and `/verify/[code]`), Privacy, Terms, localized not found page. SEO: metadata, canonical and hreflang alternates, Open Graph, JSON-LD (Organization, BreadcrumbList, Article, NewsArticle), `sitemap.xml` including database content, `robots.txt` excluding private areas.

## 4. Internal platform modules

Dashboard (my work, projects requiring attention, pending approvals, recent activity, notifications, four KPI tiles), My tasks, Projects (overview, members, milestones, tasks with comments, updates, documents, activity), Clients (details, contacts, projects, portal users with invitation), Security engagements (lifecycle, team, scope and authorised targets, rules of engagement, findings with severity and evidence, versioned reports with finalisation), Content (news, articles, public projects, case studies, authors, categories, tags; bilingual editor with rich text, cover images, SEO fields, draft > review > scheduled > published > archived workflow), Finance (quotes, invoices, line items, issue, void and replace, payments, PDF, send to client), Certificates (training, internship, experience, appreciation, other; issue, revoke, QR code, PDF, email), Employees (directory, HR records, departments, teams, HR documents), Users and roles (invitation, role assignment, activation, permission matrix), Audit log, Notifications, Settings. Client portal: overview, projects with milestones, updates and documents (with upload), documents, quotes and invoices with PDF download, security engagement headers and final reports, support requests, notifications, profile settings.

## 5. Database schema summary

47 tables in `public` plus 48 helper and trigger functions in `private`, 23 enums, one view (`employee_directory`), 9 public RPCs. Groups: identity (`profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `client_users`), organisation (`departments`, `teams`, `team_members`, `employees`, `employee_documents`), clients and projects (`clients`, `client_contacts`, `projects`, `project_members`, `milestones`, `tasks`, `task_comments`, `project_updates`, `project_documents`, `support_requests`, `activity`), finance (`reference_sequences`, `quotes`, `quote_items`, `invoices`, `invoice_items`, `payments`), security (`security_engagements`, `engagement_members`, `engagement_assets`, `findings`, `finding_evidence`, `engagement_reports`), content (`authors`, `categories`, `tags`, `news_posts`, `news_tags`, `articles`, `article_tags`, `public_projects`, `case_studies`), certificates (`certificates`), platform (`audit_logs`, `notifications`, `contact_submissions`). References are atomic and continuous per kind (`CyB-INV-000050`, `CyB-QTE-`, `CyB-CRT-`), assigned by `private.next_reference()` at the moment a document is issued and on insert everywhere else. Totals are recomputed by triggers from line items while a document is a draft. Issued documents, final reports and audit rows are immutable by trigger.

## 6. Role and permission model

Roles: super_admin, admin, finance, hr, project_manager, security_team, developer, content_editor, employee, client. 22 granular permissions (`users.manage`, `roles.manage`, `audit.read`, `settings.manage`, `clients.read/write`, `projects.read_all/write`, `tasks.write`, `hr.read/write`, `finance.read/write/issue`, `security.read_all/write/report`, `content.read/write/publish`, `certificates.read/issue`). Code checks permissions only (`viewer.can("finance.issue")`), never role names. Deny by default: developer, employee and client hold no global permissions; their access comes from project, engagement and client membership rows. Admin holds finance.read but not finance.write or finance.issue, hr.read but not hr.write, and no security access; the security team holds write but not read_all. Only a super admin can grant super_admin.

## 7. RLS strategy

Every table has RLS enabled; no table is readable without a policy. Request constant checks are wrapped in scalar subqueries so they run once per statement (verified as InitPlans in `EXPLAIN`); membership sets come from `SECURITY DEFINER` helper functions in the `private` schema (`my_client_ids`, `my_project_ids`, `my_client_project_ids`, `managed_project_ids`, `my_engagement_ids`, `my_client_engagement_ids`) that take no arguments, use `auth.uid()`, set an empty `search_path`, and are executable by `authenticated` only. Public CMS reads are separate `anon, authenticated` policies filtered on published status; editorial access is a separate policy on `content.read`. Anon holds column level grants on `public_projects` and `case_studies` so editor only columns can never be requested. Clients are scoped to their organisations and to `client_visible` rows; tasks, members, findings, evidence and assets are never client visible. Finance and HR are permission gated, not employment gated. Suite: `supabase/tests/30_rls_scenarios.sql`, 253 assertions.

## 8. Storage strategy

Seven buckets: `public-brand-assets`, `public-content` (covers, avatars, author photos), `private-project-documents`, `private-security-reports` (reports, evidence, authorisation letters), `private-hr-documents`, `private-finance-documents` (generated invoice and quote PDFs), `private-certificates` (generated certificate PDFs). Private reads go through `/api/files/[kind]/[id]` and `/api/documents/...`, which load the owning record with the user's RLS scoped client and then redirect to or stream from a 2 minute signed URL. Uploads use server issued signed upload tickets with server fixed paths. `storage.objects` policies mirror the database rules as a second layer.

## 9. Security controls

See `docs/SECURITY_REVIEW.md` for the full review. Highlights: invitation only accounts, server validated sessions in middleware, two layer authorization (actions and RLS), protected profile columns, super admin grant guard, immutability triggers, append only audit log, optimistic concurrency RPCs, private buckets with record based access, service role confined to `server-only` modules, Zod validation on every action, sanitised rich text, escaped JSON-LD, safe redirects, security headers, rate limiting on sign in, reset, contact and verification, safe error mapping.

## 10. Tests run

- Database and RLS suite: `supabase/tests/run.sh` applies the shim and all 11 migrations to a fresh PostgreSQL 16 database, loads fixtures and runs 253 scenario assertions (select, insert, update, delete, RPC execution, storage objects) for anon, plain employee, developer, security member, security non member, project manager, finance, HR, content editor, admin, super admin, client A, client B, a deactivated user and a planner check. Result: all passed.
- Unit tests (Vitest, `tests/unit`): permission matrix parsed from the seed migration against the security intent, permission helpers, Stream geometry and determinism, form validation helpers, formatting (Western numerals in Arabic, JOD decimals), rich text sanitiser. Status: see section 11.
- Critical flows: covered at the database level by the suite (employee sign in state, admin creates employee and assigns role, PM creates client and project and assigns employee, employee sees permitted project, employee creates task, finance creates and issues invoice, editor creates article and admin publishes, security team creates engagement and finding, unauthorised employee cannot view finding, client sees only their own project, client cannot access another client, certificate issued and publicly verified, audit records created). Browser end to end runs are pending the build (section 11).

## 11. Build, lint and typecheck status

To be completed after `npm install`: the npm registry was blocked in this session's network policy, so packages could not be installed here. The code was written against the exact library APIs and reviewed twice (a global TypeScript pass with unresolved modules found no internal inconsistencies beyond module resolution noise; a second review fixed the sign in redirect placement). Required next: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, then a browser pass at 320, 360, 375, 390, 412, 430, 600, 768, 820, 1024, 1280, 1440 and 1920 px in both languages, and a real Arabic PDF render check.

## 12. Known residual risks

Per instance rate limiting on Vercel; no malware scanning on uploads; upload authorization lives in the ticket actions (signed uploads bypass storage policies by design); Arabic shaping in react-pdf must be visually confirmed; quality gates not yet executed in this environment; employee directory visibility to all employees (policy decision); session lifetime follows Supabase defaults.

## 13. Required environment variables

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public); `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (optional), `EMAIL_FROM`, `CONTACT_INBOX`, `RATE_LIMIT_SALT`, `CRON_SECRET` (optional) (server only). Template in `.env.example`.

## 14. Required Supabase migrations

All 11 files under `supabase/migrations/` must be applied to the production project in order (`supabase db push`). They are new (the previous site had no database), non destructive, and idempotent for reference data. Storage buckets are created by migration 0010. After applying, create the first super admin as described in `docs/DEPLOYMENT.md`. Supabase deployment is required before the first Vercel deployment.

## 15. Required Vercel deployment steps

Import the repository, set the environment variables, add the domain, deploy. Legacy redirects, security headers, font tracing for PDF routes and the publishing cron are configured in `next.config.ts` and `vercel.json`. Both a Supabase migration deployment and a Vercel deployment are required for the initial release; later content and code changes need Vercel only, schema changes need both.

## 16. Deferred to Phase 2

Editing service page copy from the CMS (services are typed content modules in code); quote acceptance from the client portal; multi currency exchange rates and tax presets; recurring invoices; time tracking and utilisation; HR leave and payroll (intentionally out of scope); security report generation from findings (currently reports are uploaded PDFs; the data model supports generating them); global rate limiting store; upload malware scanning; SSO for the internal platform; full text search across modules; in app real time updates.
