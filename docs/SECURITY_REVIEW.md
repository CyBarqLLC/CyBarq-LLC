# Security review

Scope: the platform as delivered in this rebuild (public website, internal platform, client portal, database, storage, document generation). Reviewed against broken access control, RLS bypass, IDOR, insecure RPC, storage access, exposed secrets, XSS, CSRF, injection, unsafe redirects, insecure upload, privilege escalation, missing validation, service role exposure, weak auth assumptions, rate limiting, data leakage through errors, public/private separation and document routes.

## Controls in place

**Authentication.** Supabase Auth only. No self registration (accounts are invited by users with `users.manage` or `clients.write`, the kind is fixed at invitation and protected by a trigger afterwards). Middleware calls `auth.getUser()` (server validated) on every request and refreshes cookies; protected prefixes redirect anonymous users. Password reset and invitation links go through `/api/auth/callback`, which only follows relative `next` paths. Minimum password length 12 in the reset form. Sign in is rate limited (10 attempts per 10 minutes per IP) on top of Supabase's own limits.

**Authorization.** Two layers everywhere: server actions and pages call `requirePermission`/`requireEmployee`/`requireClientUser`, and every table has RLS with deny by default. Permissions, not roles, are checked in code. Roles carry the minimum permissions (`developer`, `employee`, `client` carry none; access comes from membership rows). Only a super admin can grant `super_admin` (trigger). Profile `kind`, `email` and `is_active` cannot be changed by their owner (trigger). Deactivated users lose every permission immediately (`has_permission` and `my_client_ids` check `is_active`).

**RLS design.** Request constant checks are scalar subqueries (`(select auth.uid())`, `(select private.has_permission(...))`) and appear as InitPlans in the plans; membership sets are hashed subplans. Helper functions live in the `private` schema (not exposed by PostgREST), are `SECURITY DEFINER` with `search_path = ''`, take no user id argument, and are executable by `authenticated` only (`anon` has no usage on the schema). Public content policies are separate from editorial policies and filter `status = 'published'`. Anon has column level grants on `public_projects` and `case_studies` so `internal_project_id`, `created_by` and `updated_by` can never be read publicly. Tenancy: client users only see rows whose `client_id` is in their membership and, where applicable, flagged `client_visible`; tasks, members, findings, evidence and assets are never visible to clients. Verified by 253 assertions in `supabase/tests/30_rls_scenarios.sql` covering anon, employee, developer, security member and non member, project manager, finance, HR, editor, admin, super admin, client A and client B, for select, insert, update, delete, RPC and storage.

**RPCs.** `issue_invoice`, `issue_quote`, `void_invoice`, `issue_certificate`, `revoke_certificate` check the permission inside the function, use optimistic concurrency (`updated_at` must match) and never lock rows. `verify_certificate` is the only anon callable function; it returns a fixed column list and nothing for drafts or unknown codes. `record_audit_event` requires a session or the service role. `private.next_reference` and `private.next_free_reference` are executable by the service role only and are reached through the SECURITY DEFINER issue functions and one insert trigger.

**Immutability.** Issued invoices, quotes and certificates and final security reports cannot be edited (triggers); corrections are void and reissue with a `replaces_invoice_id` trail. Audit logs are append only for every role including the service role (trigger raises on update or delete).

**Storage.** One bucket per data category. Private buckets are never public. Downloads go through `/api/files/[kind]/[id]` and the document routes, which load the owning record through the caller's RLS scoped client and then issue a 2 minute signed URL. Uploads use signed upload tickets issued by server actions that check the record first; the resulting path is fixed by the server, never by the browser. `storage.objects` policies mirror the database rules (record based `EXISTS` checks, permission checks for writes) as defense in depth.

**Service role.** Used only in `server-only` modules after an explicit permission check: account invitations, linking client users, signed URLs, storing generated PDFs, contact submissions, cron publishing. The key is read from `serverEnv()` and never reaches a client component.

**Input validation and injection.** Every action parses its input with Zod. Database access uses supabase-js (parameterised). SQL functions use parameters only. Slugs are normalised in the database. Rich text is sanitised with an allowlist on save and again on render; links are restricted to `https:`, `mailto:` and `tel:`, images to `https:`. JSON-LD escapes `<`. Contact mail escapes HTML.

**CSRF.** Server actions are protected by Next.js origin checks. State changing route handlers do not exist (document and file routes are GET and return only the caller's own data). Cookies are set by `@supabase/ssr` with `SameSite=Lax`.

**Redirects.** Login `next` and the auth callback `next` accept only relative same site paths (no `//`, no scheme).

**Errors.** `runAction` maps every failure to a safe message; stack traces and Postgres details are logged server side only. Route error boundaries show a generic message with the digest.

**Headers.** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS preload. `poweredByHeader` off.

**Rate limiting.** Sign in, password reset, contact form and certificate verification are rate limited per hashed IP.

**Audit.** Triggers write audit rows for role and permission changes, profile activation, invoice and quote status changes, certificate issue and revoke, findings changes, engagement changes, content publishing, project changes. Application code audits invitations, file access for HR and security files, document downloads and authorisation document access. Secrets are never logged.

## Findings fixed during review

1. `signIn` called `redirect()` inside `runAction`, which would have swallowed the framework's control flow error. Moved the redirect outside the wrapper.
2. `case tg_op ... when <boolean>` in the findings audit trigger mixed simple and searched CASE forms; rewritten (caught by the migration run).
3. Fixture numbering collided with generated invoice numbers, which surfaced that the test fixtures, not the sequence, needed changing.

## Residual risks and recommendations

1. **Rate limiting is per function instance.** On Vercel the in memory buckets are not shared, so a determined attacker spread over instances gets a higher effective limit. Recommendation: Vercel WAF rate rules or an Upstash based limiter in Phase 2. Supabase Auth's own limits still apply to sign in and reset.
2. **Upload content is not scanned.** File type and size are constrained per bucket and by the server, but there is no malware scanning. Recommendation: scan on upload (for example a queue with ClamAV or a SaaS scanner) before files become client visible.
3. **Signed upload tickets bypass storage policies** by design (Supabase signed uploads act with the service role). Authorization for uploads therefore lives in the actions that issue tickets. Every such action checks the record through the user's client and fixes the destination path; keep that rule for new upload flows.
4. **Employee directory** exposes name, title, department, work email and work phone to every employee. HR fields are separate and gated. Confirm this matches the company's internal policy.
5. **Quality gates not yet executed** in this environment: the npm registry was blocked, so `typecheck`, `lint`, `build`, unit tests and a browser based responsive pass still have to be run after `pnpm install`. The database suite ran and passed. See the technical report.
6. **Arabic PDF rendering** relies on `@react-pdf/renderer`'s bidi and shaping with the registered Thmanyah Sans OTF files. It must be visually verified on the first real render; if shaping is unsatisfactory, the fallback is to render documents with a headless browser print pipeline (still a real PDF, not a screenshot).
7. **Certificate verification reveals the recipient's name** together with the certificate title and dates. This is the minimum a verifier needs; nothing else (email, employee number, documents) is exposed.
8. **Session cookies on shared devices**: no idle timeout beyond Supabase's refresh token lifetime. Consider shortening JWT expiry in the Supabase dashboard for the internal platform.
