# CyBarq platform. Audit, fixes and delivery report

Session of 11–12 September 2026 (Amman). Repository `CyBarqLLC/CyBarq-LLC`, branch `main`. Production: Vercel (functions in `dub1`, Dublin) + Supabase (`eu-west-1`, Ireland).

## A. Verdict

**READY WITH RESIDUAL RISKS.**

What is live right now (deployment `e85cd7c`, verified in Chrome): the hardened database (all seven new migrations applied and verified against the local schema), the rebuilt account/invitation/session flow, finance workflows, business time, the environment fix that had taken down the verification page and the cron, and PDF rendering.

What is committed but **not yet pushed or deployed** (21 commits, `2a543fb` → the tip of `main`, per your instruction to commit only while you were away): the fixes for three workflow bugs found in the live audit (status moves, invitations, black buttons), the public site redesign, the platform humanisation/UI pass and the PDF redesign. These commits could not be type-checked or built here (no package registry access from this environment), so **the first push will be the first full build**: CI runs typecheck, lint, unit tests and the database suite; Vercel promotes only a successful build, so production cannot break from a failed build. The device repository (`~/Documents/GitHub/CyBarq-LLC`) is at the same tip; one "Push origin" in GitHub Desktop publishes everything.

## B. Issues found, root cause, fix, verification

| # | Issue (where seen) | Root cause | Fix | Verified |
|---|---|---|---|---|
| 1 | Anyone could sign up and get an employee profile (Supabase Auth) | Public sign-up enabled; profile trigger trusted `user_metadata.kind` | Sign-up disabled; kind read from server-only `app_metadata`; unknown users get an inactive client profile (0012) | RLS suite; live invite |
| 2 | Privilege escalation through role grants / self edits | No no-escalation guard; profiles protected columns editable | `private.check_role_change`, `protect_profile_columns`, super admin rules (0012) | RLS suite |
| 3 | Deactivated employees kept project/engagement access; no session cut-off | Membership helpers ignored `is_active`; no auth ban | Helpers require active account; `ban_duration` on deactivation | RLS suite |
| 4 | Issued invoices/quotes/certificates could be edited or renumbered | Row policies allowed updates | Immutability guards, numbering by document date, platform-managed status (0014, 0016) | RLS suite; live (edit locked banner) |
| 5 | Engagement creation failed for every user | Trigger rejected the insert order | `create_engagement()` RPC (0015) | Live: SEC-2026-5678 created |
| 6 | Overpayment and concurrent payments | No lock, no balance check | `record_payment()` with `FOR UPDATE`, balance and date checks (0014) | Live: 5,000 on a 3,771.16 invoice rejected; full payment → Paid |
| 7 | Audit rows could be forged from the browser | `audit_logs` insertable by authenticated | Service-role-only `record_audit_event()`; append-only trigger | RLS suite |
| 8 | Open redirect on login `next=` | Unvalidated redirect | `safe-redirect.ts` + unit tests | Unit tests |
| 9 | Invitation links consumed by mail scanners | Token verified on page open | Token verified on submit (`verifyOtp`) on `/welcome` and `/reset-password` | Code + CI |
| 10 | Times shown in UTC, "today" wrong after 21:00 Amman | No business time zone | `src/lib/time.ts`, `private.business_today()`, Amman presentation (0013) | Live: issue date 12 Sep at 02:41 Amman |
| 11 | Functions in Washington, database in Ireland (700–1300 ms TTFB) | Default Vercel region | `vercel.json` regions `dub1`; single `viewer_context()` RPC | Measured (see Performance) |
| 12 | **Production 500s on `/verify/*`, `/api/cron/publish`, audit writes** | One Zod parse of all server env: a blank `CONTACT_INBOX` and a short `RATE_LIMIT_SALT` in Vercel threw for every consumer | Each variable validated on use with safe fallbacks; `audit()` never throws (`ba5b0a7`) | Live: verify page renders |
| 13 | **Every PDF returned 500 on Vercel** | pdfkit's standard-font metrics loaded through computed paths, not traced | `outputFileTracingIncludes` for all PDF routes (`e85cd7c`) | Live: quote, invoice and public certificate PDFs render |
| 14 | **"Move to Authorised", finding status moves and content Publish all failed** ("Please check the highlighted fields") | Several submit buttons carrying `name/value` in one form action: the value never reached the server action's FormData | One small form per choice with a hidden value (`ActionChoices`, `0669eed`) | Reproduced live (payload inspected); fix committed, awaits deploy |
| 15 | **Inviting an employee failed** ("Team roles are only for CyBarq team accounts") | Supabase Auth writes `app_metadata` in a second statement after the insert, so the profile trigger saw no kind and created the inactive client placeholder | Trigger on the metadata update completes the placeholder (0018, applied live) + provisioning verifies the profile (`768c7b4`) | Live: second invite created an Active Employee with roles |
| 16 | "Schedule" button rendered as a black square; secondary/danger buttons unreadable | `tailwind-merge` treated `text-small`/`text-h2`… as colours and dropped `text-white` | `extendTailwindMerge` with the type scale (`fd337b9`) + unit test | Unit test; awaits deploy |
| 17 | Status select showed the old value after saving | Uncontrolled select kept its first render value | Keyed on the saved value (`e85cd7c`) | Awaits deploy |
| 18 | Forms wiped what was typed when validation failed | React resets uncontrolled fields after any form action | `ServerActionForm` restores submitted values on failure (`2a543fb`) | Awaits deploy |
| 19 | History showed "invoice issued" when a payment was removed | Audit trigger mapped every → issued transition | `invoice.issued`/`quote.issued` only for the first issue (0017, applied live) + suite tests | DB suite |
| 20 | Upload button read "Choose a file"; authorisation letters and evidence showed storage names with uuid prefixes | Wrong label key; raw path | "Upload" label (EN/AR); `displayFileName()` | Awaits deploy |
| 21 | Arabic pages showed an English "Loading" | Hard-coded string | Translated (`common.loading`) | Awaits deploy |
| 22 | Invitation emails not delivered | `RESEND_API_KEY` is blank in Vercel (`[mail:skipped]` in logs) | Not a code issue: set the key (see I). The UI already tells the admin and offers "Resend invitation" | Live log |

## C. Database, RLS and security changes

Migrations `20260912000100` → `20260912000700` (all applied to production; 0012–0016 verified by schema fingerprint against the local build: policies, functions, triggers, columns, constraints, indexes and grants identical; 0017/0018 verified by presence and `schema_migrations`).

- Identity: server-decided account kind (`app_metadata`), placeholder completion when metadata lands, no-escalation role grants, protected profile columns, super admin rules, active-account membership helpers, `viewer_context()` single round trip.
- Business time: `Asia/Amman` calendar, `private.business_today()`, document numbering by document date, date-only values never shifted.
- Finance: `save_quote/save_invoice` (draft + items in one call, optimistic `updated_at`), `issue_*`, `set_quote_status`, `convert_quote_to_invoice` (idempotent), `void_invoice`, `create_replacement_invoice`, `record_payment` (row lock, balance, date), `remove_payment` (reason required), statement-level item guards, immutability of issued documents.
- Workflow integrity: `create_engagement()`, content publish guards, report immutability, storage path guards.
- Platform ops: service-role-only `record_audit_event()`, `private.rate_limits` (RLS enabled, definer functions only), `consume_rate_limit()`, `run_scheduled_jobs()`, `verify_certificate()` with role/hours/language.
- Audit refinements (0017) and provisioning metadata (0018) as above.
- Test suite: `bash supabase/tests/run.sh` (fresh Postgres, shim, every migration, RLS scenarios, hardening scenarios) passes; CI runs it on every push.
- Nothing was loosened: no broad policies, no service-role shortcuts in pages, guards apply to the API roles and, as the cleanup showed, even the `postgres` role cannot change items of an issued invoice.

## D. Workflows tested live in Chrome (as super admin, production, temporary records removed afterwards)

Login and dashboard · clients (create, edit, contact add/edit) · project (create, milestone, task with comment and status change, update, document upload/download/delete, activity) · quote (create, PDF, issue, accept, convert) · invoice (issue, PDF, overpayment rejected, partial payment, payment removal with reason, full payment, paid PDF, void with reason, replacement draft) · security engagement (create, authorisation letter upload/download, delete) · certificate (create, issue, public verify page EN/AR, public PDF) · article draft · employee invitation (twice: failure reproduced, then fixed live) · users page · audit page · every platform route in EN and AR scanned for raw keys/`undefined`/untranslated strings · Vercel logs · Supabase schema.

Found and fixed from this pass: #12–#22 above. Test records (client, project, task, quote, three invoices, certificate CERT-2026-0002, article, engagement, QA employee, cached PDFs) were removed; document sequences were reset so the first real quote and invoice will be `-0001` and the next certificate `-0002`. Audit rows for the test records remain by design (the log is append-only for everyone).

## E. UI/UX changes (committed, awaiting the push)

Public site: full-bleed live Stream hero (always moving, mouse and touch, denser and higher band on phones, static SVG first paint, entrance animation, scroll cue); glass header integrated with the hero that floats on scroll (real backdrop blur, fallback, accessible mobile menu); no eyebrow phrases; interactive "one system" practice panels; pinned "how we work" narrative; graphite statement band with a live river and the only two decorative marks on the site (4× wider); horizontally scrolling services strip; scroll reveals; partner logo marquee (CSS, pausable, reduced-motion safe); registration block in the footer; closing call to action; ~160 KB less HTML per home page (pattern SVGs served as files).

Platform: quieter sidebar, table rows as real links, numeric columns, status badges with meaning-based tones, empty states, button states, upload button label, real file names, user detail with account state and "Resend invitation", audit page with human sentences and entity links, activity feed sentences, dashboard greeting fallback.

PDFs: shared A4 grid, fixed footer on every page (website, three emails, legal line with Jordan legal name and registration number when set, website QR, page x of y), header with logo and document number, meta lists, items table with repeated header, totals block, draft/void stamps, tidier certificate with signatory block and verification QR.

## F. Language (AR/EN)

Central typed label maps for every enum, audit action (55), entity type, role, permission (with descriptions), currency, notification kind, payment method, document category; `humanizeKey()` fallback so nothing raw can appear. Arabic terminology unified (ملاحظة، إبطال، سحب، المدير الأعلى، الارتباط الأمني، المجال، تطوير التقنية); confirmations phrased as questions; ICU plurals; positioning copy woven into hero, about, careers, contact, footer and metadata in both languages; eyebrow keys removed from both catalogues; en/ar key trees verified identical.

## G. Remaining risks and what needs you

1. **Unbuilt commits.** Push `main`; watch CI and the Vercel build. If typecheck reports errors in the new files, they will be in the three large passes (site, platform, PDF). Then check visually: home page on desktop and phone in EN and AR, the glass header, the PDFs (invoice, quote, certificate; EN and AR), the audit page.
2. **`RESEND_API_KEY`** is blank in Vercel: invitations, password resets, invoice emails and contact form notifications are logged as skipped. Set it (Production), then use "Resend invitation" for anyone invited meanwhile.
3. **`CRON_SECRET`** is not set: `/api/cron/publish` answers 503 "Cron is not configured" (scheduled publishing and finance status sweeps do not run). Set it in Vercel; Vercel sends it automatically to the cron.
4. **`RATE_LIMIT_SALT`** is missing (a salt is now derived from the service key, so limits work); set a 32+ character value to make it explicit. **`CONTACT_INBOX`** was blank: set it or leave it unset (falls back to info@cybarq.com).
5. Registration number: set `company.registrationNumber` in `src/content/site/company.ts` when you have it; the footer and PDFs pick it up.
6. GitHub Pages: the legacy `pages-build-deployment` workflow still runs on every push; disable Pages in the repository settings.
7. `.DS_Store` is modified in the device repo; add it to the ignore and untrack it.
8. The brand guide says the symbol is never scaled unevenly; the two stretched corner marks were made 4× wider on your instruction.

## H. Migrations created and applied

`20260912000100_identity_hardening`, `…000200_business_time`, `…000300_finance_workflows`, `…000400_workflow_integrity`, `…000500_platform_ops`, `…000600_audit_refinements`, `…000700_provisioning_metadata` — all applied to production through the SQL editor and recorded in `supabase_migrations.schema_migrations`; local migrations, remote schema, generated types and app code are in sync.

## I. Environment variables (names only)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`, `RATE_LIMIT_SALT`, `CRON_SECRET`, `SITE_LOCKED`, `SITE_LOCK_PASSWORD`.

## J. Commits

Deployed: `7cfbcf2`, `78632dd`, `f166776`, `a8f4a89`, `ba5b0a7`, `e85cd7c` (production).
Committed, not pushed (in order, authored as Claude so they carry no unverified badge): `2a543fb`, `d5e7fc1`, `144e03c`, `39d8765`, `fd337b9`, `ff82636`, `7ef7813`, `691e2fe`, `816dcba`, `20d1e85`, `fb6ad7e`, `42eeeec`, `ad35160`, `f4113a1`, `e795144`, `702feed`, `702f9c4`, `cd606f3`, `0669eed`, `768c7b4`, then this report as the tip of `main` (also the head of the device repo).

## PERFORMANCE & INFRASTRUCTURE

Regions verified: Supabase `eu-west-1` (Ireland, DB time zone UTC); Vercel functions were `iad1` (Washington) with the edge in `fra1`; now `dub1`, confirmed by `x-vercel-id: fra1::dub1` on every request.

Server timing (Chrome in Amman, signed in, `fetch` with `no-store`, three runs, sorted, ms):

| Route | Before (iad1) | After (dub1 + viewer_context) |
|---|---|---|
| /en/app | 1197 / 1272 / 1305 | 272 / 275 / 323 |
| /en/app/projects | 967 / 990 / 1266 | 204 / 205 / 217 |
| /en/app/finance | 702 / 863 / 946 | 217 / 233 / 247 |
| /en/app/audit | 793 / 989 / 1821 | 191 / 210 / 212 |
| /en/app/certificates | 1010 / 1072 / 1723 | 229 / 250 / 794 |
| /en (public) | 616 / 632 / 673 | 258 / 283 / 468 |

Function execution now ~80 ms for a platform page (one `viewer_context` RPC, 53 ms) instead of three sequential auth/role queries across the Atlantic. Public HTML: 348 KB → ~190 KB expected after the push (pattern SVGs moved to files; measured locally on the generated files: 52 KB + 22 KB removed twice per page). LCP/INP/CLS were not measured (no field data yet; enable Vercel Speed Insights after the push to collect them).

Database: RLS helpers `STABLE SECURITY DEFINER` with InitPlan subqueries; statement-level triggers with transition tables (one recalculation per document instead of per row); `FOR UPDATE` only on the payment path; idempotent RPCs (`convert_quote_to_invoice` returns the existing invoice); DB-backed fixed-window rate limiter with a per-instance fallback; scheduled jobs consolidated in `run_scheduled_jobs()` (10-minute cron) with rate-limit purge. Connections: server components share one request-scoped client; no long-lived pools.

Guardrails in CI: strict TypeScript, ESLint (`next/core-web-vitals`, `jsx-a11y`), unit tests (time, format, labels completeness, env, cn, pdf mapping, validation), full migration + RLS suite on Postgres 16; secret guard.
