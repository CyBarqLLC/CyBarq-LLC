# CyBarq Platform. Implementation plan

Internal working document. Written after auditing the existing `CyBarq-LLC` repository and the `CyBarq_Brand_Refresh_2026` kit.

## 1. Current architecture (audit)

- Static site: 10 English pages at the root and 10 Arabic mirrors under `ar/`, hand written HTML, one 52 KB `style.css`, one 16 KB vanilla `main.js` (marquees, scroll reveal, magnetic buttons, count up stats, media protection, page transitions).
- Hosted on GitHub Pages (`CNAME` = `cybarq.com`), repo `CyBarqLLC/CyBarq-LLC`, branch `main`.
- Typography: FFF Acid Grotesk TRIAL (Latin) and Zagel Arabic ITF. Both replaced by Thmanyah Sans in the 2026 refresh.
- Colour: neutral grey `#747572` ink, neon lime `#E0FF4F` accent, glass panels, ambient blur, grid overlay, orbit decorations and a 3D spinning logo. All of this conflicts with the 2026 identity (flat first, no effects, no glow).
- Old logo files (`logo-new.svg`, 3D PNG/WebP) are superseded by `01_Logo` in the brand kit. Partner (8 SVG) and certification (14 PNG) logos are reusable.
- No backend, no CMS, no forms handler (contact form is front end only), no auth.

## 2. Reusable content (preserved and reorganised)

- Company facts: officially began 2024, registered with the Companies Control Department (Jordan), licensing approvals from the Ministry of Digital Economy and Entrepreneurship and the National Cyber Security Center. Stats: 2+ years registered, 10+ years combined experience, 8+ experts, 300+ cases.
- Contact: `info@`, `sales@`, `support@cybarq.com`. Social: LinkedIn `cybarqllc`, Instagram `cybarqllc`, Facebook `cybarqllc`, X `cybarqllc`. City: Amman.
- Legal names: CyBarq Technology LLC | سايبرق للتكنولوجيا. Jordan legal name برق الفضاء لتكنولوجيا وأمن المعلومات ذ.م.م (legal, tax and government use only).
- Slogan (2026): "Technology, done properly." / "التقنية كما ينبغي." replaces "Defense, Precisely Timed".
- Six existing services with problem / approach / outcome copy in both languages: Penetration Testing, DFIR, Training and Awareness, Compromise Assessment, Professional Security Services, IT Development. All six are carried into the new practice structure (the last one expands into the Digital Engineering practice).
- SEO metadata: titles, descriptions, canonical and hreflang pairs, OG tags. Pattern kept, values rewritten for the new pages.
- Assets kept: partner SVGs, certification PNGs, Jordan ministry logo, favicon set. New from the kit: logos (6 configurations x 4 colours), pattern SVG/PNG, pictograms (24), corner marks, blade, page signature, colour tokens, gradients.

## 3. Current weaknesses

- No content system, no data, every change is a hand edit in 20 files.
- Visual language is the pre 2026 identity (glass, neon, blur, 3D, orbit).
- Contact form does not submit anywhere.
- Media protection JS blocks context menu site wide (hurts accessibility, adds nothing).
- No structured data, no sitemap, no robots.
- Arabic is a full mirror (good) but maintained by hand.

## 4. Target architecture

```
apps (single Next.js 15 app, App Router, TypeScript strict, Tailwind v4)
  /[locale]                 public website (en, ar)   ISR + static, anon Supabase reads
  /[locale]/app             internal platform          authenticated employees, server components + server actions
  /[locale]/portal          client portal              authenticated client users, tenant scoped
  /[locale]/verify/[code]   public certificate check   RPC, rate limited
  /api/documents/...        PDF streams (server only, permission checked)
supabase/
  migrations/               versioned SQL, one concern per file
  seed/                     roles, permissions, sequences, categories (no fake business data)
  tests/                    RLS scenario tests (pg, run against local Postgres with an auth shim)
```

- Supabase: Postgres, Auth, Storage, RLS. `@supabase/ssr` for cookie sessions. Service role only inside `server-only` modules.
- Validation: Zod on every server action and route handler.
- Email: Resend (no-op when key absent). PDFs: `@react-pdf/renderer` with Thmanyah Sans (Arabic shaping and bidi supported by fontkit + textkit).
- Vercel for the app, Supabase for the database. Migrations deployed separately via the Supabase CLI.

## 5. Database entities (summary)

Identity: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `client_users`.
Organisation and HR: `departments`, `teams`, `team_members`, `employees`, `employee_documents`.
Clients and projects: `clients`, `client_contacts`, `projects`, `project_members`, `milestones`, `tasks`, `task_comments`, `project_updates`, `project_documents`, `support_requests`, `activity`.
Finance: `reference_sequences`, `quotes`, `quote_items`, `invoices`, `invoice_items`, `payments`.
Security: `security_engagements`, `engagement_members`, `engagement_assets`, `findings`, `finding_evidence`, `engagement_reports`.
Content (public CMS): `authors`, `categories`, `tags`, `news_posts`, `news_tags`, `articles`, `article_tags`, `public_projects`, `case_studies`.
Certificates: `certificates`.
Platform: `audit_logs`, `notifications`, `contact_submissions`.

Services are typed content modules in code (both languages), not CMS rows: they are marketing narrative reviewed like code. Editing service copy from the CMS is deferred to Phase 2.

## 6. Role model

Roles (seeded): `super_admin`, `admin`, `finance`, `hr`, `project_manager`, `security_team`, `developer`, `content_editor`, `employee`, `client`.
Permissions (seeded, granular): `users.manage`, `roles.manage`, `audit.read`, `settings.manage`, `clients.read`, `clients.write`, `projects.read_all`, `projects.write`, `tasks.write`, `hr.read`, `hr.write`, `finance.read`, `finance.write`, `finance.issue`, `security.read_all`, `security.write`, `security.report`, `content.read`, `content.write`, `content.publish`, `certificates.issue`, `certificates.read`.
A user holds roles; roles map to permissions. Nothing in the app tests `role === 'admin'`; everything tests a permission (`can('finance.issue')`) server side, and the same permission is what RLS checks.
Deny by default: a role with no permissions sees only what membership grants (own profile, own tasks, projects they are members of).

## 7. RLS strategy

- Every table has RLS enabled. No policy is written as `USING (true)` except for explicitly public content filtered by `status = 'published'`.
- Request constant values are wrapped in scalar subqueries so the planner evaluates them once (InitPlan): `(select auth.uid())`, `(select private.has_permission('finance.read'))`, `id in (select private.my_project_ids())`.
- Helper functions live in a `private` schema (not exposed by PostgREST), `SECURITY DEFINER`, `STABLE`, `SET search_path = ''`, `REVOKE ALL FROM public, anon`, `GRANT EXECUTE TO authenticated`. They read only the membership tables and never take a user id argument (they always use `auth.uid()`), so they cannot be used to look up other users.
- Tenant safety: client users only see rows whose `client_id` is in `private.my_client_ids()`, and only rows flagged `client_visible` where that flag exists.
- Finance, HR, security findings and audit logs are gated by permission, not employment.
- Public CMS tables allow anon `SELECT` only on published rows; drafts are visible to `content.read`.
- Storage policies follow the same model (bucket per category, record based checks).

## 8. Storage strategy

Buckets: `public-brand-assets` (public), `public-content` (public, CMS covers), `private-project-documents`, `private-security-reports`, `private-hr-documents`, `private-finance-documents`, `private-certificates`.
Uploads and downloads for private buckets go through server actions that check the DB record and then create short lived signed URLs. `storage.objects` policies mirror the DB rules as defense in depth.

## 9. CMS model

News and Articles are separate tables with the same editorial shape (bilingual title, slug, excerpt, body, author, category, cover, SEO fields, language status, workflow status `draft > review > scheduled > published > archived`, timestamps). Public Projects and Case Studies are separate tables; case studies carry challenge, solution, implementation, outcome and an `impact` list where each item carries a `verified` flag. Publishing requires `content.publish` and writes an audit row.

## 10. Project management model

Client > Project (practice, status, manager) > Milestones > Tasks (assignee, status, priority) > Comments. Members via `project_members`. Documents and Updates carry `client_visible`. Activity rows are written by triggers for the internal timeline. The public `public_projects` table is separate from `projects`; a public entry may link to an internal project id for reference only, and the link is never exposed in the public API surface.

## 11. Finance model

Numbered documents via `reference_sequences` and `private.next_reference()` (atomic upsert `RETURNING`), in the platform-wide `CyB-INV-000050` scheme; a number already issued is never restated. Quotes and invoices with line items, currency, tax, status and notes in two languages; the `language` column records the correspondence language, while the PDF itself is always bilingual. Issuing is an RPC that checks `status = 'draft'` and the expected `updated_at` in the `WHERE` clause (optimistic, no explicit lock). Issued invoices are immutable except status, payments and `pdf_path`; a trigger enforces this. Corrections are done by voiding and issuing a replacement (`replaces_invoice_id`). PDFs are rendered on demand from the stored rows, never from the browser, with English leading and Arabic following in the same file.

## 12. Cybersecurity engagement model

Engagement (type, status lifecycle `scoping > authorised > active > reporting > remediation > retest > closed`, rules of engagement, dates, lead, authorisation) > Assets (authorised targets, in scope flag) > Findings (severity Informational..Critical, status, affected asset, recommendation, evidence files, remediation and retest fields) > Reports (versioned, final flag, client visible). Access: `security.read_all` or engagement membership. Project membership does not grant finding access. Clients see only final client visible reports.

## 13. Audit logging

`audit_logs` is insert only (no update or delete policies, plus a trigger that raises). Rows are written by database triggers on role grants, invoice and quote issuance, certificate issuance and revocation, finding changes, content publishing, project changes, and by server actions for admin actions and sensitive document access. Fields: actor, action, entity type and id, client id, metadata, IP and user agent (from the server), timestamp. Secrets are never logged.

## 14. Migration strategy

Numbered SQL files under `supabase/migrations`, one concern each: extensions and helpers, identity and roles, organisation, clients and projects, finance, security, CMS, certificates, platform (audit, notifications, contact), storage, seed. Every file is idempotent where practical and reversible where reasonable (drop statements documented at the bottom). Applied with `supabase db push` (or `psql`) separately from the Vercel deploy. The old static site is replaced by the Next.js app in the same repository; old HTML is moved to `legacy/` for reference during the transition and removed after go live.
