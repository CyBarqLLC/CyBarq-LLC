# Deployment

The application (Vercel) and the database (Supabase) are deployed separately. A Git push to Vercel never applies database migrations.

## 1. Supabase project

1. Create a Supabase project (region close to Amman, for example Frankfurt).
2. Authentication settings:
   - Disable public sign ups (Authentication > Providers > Email > "Enable email signups" off). Accounts are created only by invitation from the platform.
   - Site URL: `https://cybarq.com`. Redirect URLs: `https://cybarq.com/api/auth/callback`, plus the Vercel preview pattern if previews are used.
   - Email templates: the invite and recovery templates should link to `{{ .ConfirmationURL }}` (default). The platform passes `redirectTo=/api/auth/callback?next=/<locale>/reset-password`.
   - Password minimum length 12.
3. Apply migrations, in order, with the Supabase CLI from the repository root:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   or, without the CLI, run each file under `supabase/migrations/` with `psql` against the project's connection string in filename order. The files are:
   `20260911000100_foundation.sql`, `..000200_identity.sql`, `..000300_organisation.sql`, `..000400_clients_projects.sql`, `..000500_finance.sql`, `..000600_security_engagements.sql`, `..000700_cms.sql`, `..000800_certificates.sql`, `..000900_platform.sql`, `..001000_storage.sql`, `..001100_seed_reference.sql`.
   The seed file contains roles, permissions, categories and departments only. No demo data.
4. Storage: buckets are created by `..001000_storage.sql`. Confirm in the dashboard that the five `private-*` buckets are not public.
5. First super admin: invite yourself from the Supabase dashboard (Authentication > Users > Invite) with user metadata `{"full_name": "Your name", "kind": "employee", "locale": "en"}` (the auth trigger creates the profile), then run once in the SQL editor:
   ```sql
   insert into public.user_roles (user_id, role_key)
   select id, 'super_admin' from public.profiles where email = 'you@cybarq.com';
   ```
   From then on every account is provisioned from `/app/users` (employees) and `/app/clients/<id>` (portal users).
6. Optional scheduled publishing: create a cron (Supabase `pg_cron` or an external scheduler) that calls `select public.publish_due_content();` every 10 minutes with the service role, or call `GET /api/cron/publish` with the `CRON_SECRET` header from Vercel Cron.

## 2. Vercel project

1. Import the repository. Framework preset: Next.js. Node 20 or later. Install command `pnpm install` (a `package-lock.json`/`pnpm-lock.yaml` will be generated on the first install and should be committed).
2. Environment variables (Production and Preview):

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | `https://cybarq.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | never exposed to the browser; used for account provisioning, signed URLs, PDF storage, contact submissions |
| `RESEND_API_KEY` | server only | optional; without it mail is logged, not sent |
| `EMAIL_FROM` | server only | `CyBarq <no-reply@cybarq.com>` (verify the domain in Resend) |
| `CONTACT_INBOX` | server only | `info@cybarq.com` |
| `RATE_LIMIT_SALT` | server only | 32+ random characters |
| `CRON_SECRET` | server only | optional, protects `/api/cron/publish` |
| `SITE_LOCKED` | server only | `true` shows the Under Maintenance screen on every page, `false` opens the site |
| `SITE_LOCK_PASSWORD` | server only | development team password for the maintenance screen; never sent to the browser. Access lasts 4 hours. Changing it signs everyone out |

3. Domains: add `cybarq.com` and `www.cybarq.com` (redirect www to apex). Remove the GitHub Pages `CNAME` (moved to `legacy/`) and update DNS to Vercel.
4. Deploy. Legacy URLs (`/about.html`, `/ar/dfir.html`, ...) are redirected permanently by `next.config.ts`.

## 3. When is which deployment required

| Change | Supabase migration | Vercel deploy |
| --- | --- | --- |
| Any file under `supabase/migrations` | yes (`supabase db push`) | usually yes if the app uses the new columns |
| Application code, content modules, messages | no | yes |
| Brand assets under `public/` | no | yes |
| Roles and permission matrix | yes (a new migration, never edit applied files) | no |

Never edit an applied migration. Add a new timestamped file for every schema change.

## 4. Local development

```bash
cp .env.example .env.local   # fill in values
pnpm install
pnpm dev
```

Database tests (require PostgreSQL 16 locally; they create a throwaway database):

```bash
pnpm test:db
```

Regenerate database types after a migration change (needs the test database applied first):

```bash
pnpm test:db && pnpm db:types
```

Quality gates:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
