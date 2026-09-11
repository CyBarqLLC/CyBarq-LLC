# CyBarq Platform. Engineering conventions

Read this before adding a module. Everything below is already implemented in the foundation; follow the same shapes.

## Stack and layout

- Next.js 15 App Router, React 19, TypeScript strict (`noUncheckedIndexedAccess`), Tailwind v4 (`src/styles/globals.css` holds the brand tokens), Radix primitives wrapped in `src/components/ui/*`, next-intl v4, Supabase (`@supabase/ssr`), Zod, `@react-pdf/renderer`, Resend.
- Routes: `src/app/[locale]/(site)/...` public, `src/app/[locale]/(platform)/app/...` internal, `src/app/[locale]/(portal)/portal/...` client portal, `src/app/[locale]/(auth)/...` login flows, `src/app/api/...` route handlers (PDF streams, cron).
- Path alias `@/` = `src/`.
- No `any`. No em dashes in any copy (use commas, full stops, colons). Western numerals in both languages.

## Data access

- Server Components and Server Actions only. Never query Supabase from the browser (the browser client exists for auth only).
- `createClient()` from `@/lib/supabase/server` = the user's RLS scoped client. Use it for every read and write on behalf of the user.
- `createAdminClient()` from `@/lib/supabase/admin` = service role. Only in `server-only` code, only after an explicit permission check, only for what the user's session cannot do (provision accounts, sign private URLs, store generated PDFs, write contact submissions).
- Never rely on hidden UI for authorization. Every action calls `requirePermission(...)`/`requireEmployee()`/`requireClientUser()` from `@/lib/auth/session` AND the database enforces RLS.
- Select explicit columns for public content queries (anon has column level grants on `public_projects` and `case_studies`, `select *` is refused).
- Paginate lists with `pagination()` from `@/lib/data/paginate` and `.range(from, to)` plus `{ count: "exact" }`.
- No autosave. Writes happen on explicit submit. `revalidatePath()` after a successful write; never trigger writes from render or effects.

## Server action shape

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { requiredString, optionalString } from "@/lib/validation/common";

const schema = z.object({ name_en: requiredString(), name_ar: optionalString() });

export async function createThing(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("clients.write", "action");
    const input = schema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").insert({ ...input, created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    revalidatePath("/[locale]/app/clients", "page");
    return ok({ id: data.id });
  });
}
```

- Zod schemas live in `src/lib/validation/<module>.ts` and are reused by the form (for field names) and the action.
- Actions return `ActionResult` (never throw to the client). `runAction` maps Postgres codes (42501 forbidden, 40001 conflict, 23505 duplicate) and Zod errors to safe messages.
- Optimistic concurrency: send `expected_updated_at` (hidden input) for issue/finalise flows and call the RPC (`issue_invoice`, `issue_quote`, `issue_certificate`).

## Forms

- Client form component: `useActionState(action, null)`, `<Field label htmlFor error={fieldError(result, "name")}>`, `<SubmitButton>`, `<FormMessage result={result} />`. Correct input types (`type="email"`, `inputMode="numeric"`, `type="date"`), `autoComplete` where relevant.
- Long forms are split into sections with headings. Native `<NativeSelect>` for simple choices.
- Uploads go through `FileUpload` with a server action that returns a signed upload ticket (`signedUploadUrl`) after checking the record, then a second action that inserts the metadata row.

## Pages

- Server component page: `const viewer = await requireEmployee();` (or `requirePermission("x")` for gated modules), `const locale = (await getLocale()) as Locale;`, `const t = await getTranslations("<namespace>")`.
- Use `PageHeader`, `DataTable` (responsive: cards under `md`), `Status` for badges, `EmptyState`, `Pagination`.
- Bilingual columns: `pick(row, "title", locale)` from `@/i18n/bilingual`. Enum labels: `label(PRACTICE_LABELS, value, locale)` from `@/lib/labels`.
- Dates and money: `formatDate`, `formatMoney` from `@/lib/utils/format` (Western numerals in Arabic).
- `loading.tsx` with `LoadingState`, `not-found.tsx` with `NotFoundState` where a route has dynamic segments.

## i18n

- Messages are per namespace: `messages/en/<ns>.json` and `messages/ar/<ns>.json` (namespaces listed in `src/i18n/messages.ts`). A module owns its namespace. Keep Arabic natural and professional, not literal.
- Links: `Link`, `redirect`, `usePathname`, `useRouter` from `@/i18n/navigation` (locale aware). Never hardcode `/en/` in `href`s.
- Public pages: `generateMetadata` with title, description, `alternates.canonical` and `alternates.languages` (`en`, `ar`, `x-default`), Open Graph.

## Design

- Brand palette only (`blue`, `sky`, `ice`, `lime`, `lime-tint`, `graphite`, `slate`, `grey`, `fog`, `white`, `azure` for links). Square corners. 1px Fog rules. No dashed or dotted lines, no gradients in UI, no shadows beyond the two soft panel shadows already used by menus.
- Public site: white ground, generous whitespace, light weight display type, one field of colour per section at most, Lime rarely (a quiet background tint). Graphite sections only when they carry one clear statement.
- Icons: `Pictogram` (brand set) on the public site for services and values; `lucide-react` (thin) inside the platform for UI actions.
- Touch targets 44px (`touch` utility). Mobile first; test 320 to 1920. Safe areas via `safe-px` / `safe-pb`.

## Security checklist for every module

- Permission checked in the action AND covered by RLS.
- No `select *` on tables with sensitive columns when returning to the client; return only what the page needs.
- Private files: never a public URL. Use `signedDownloadUrl` after checking the owning record through the user's client.
- Audit sensitive application actions with `audit()` from `@/lib/audit` (DB triggers cover data changes already).
- Rate limit anonymous endpoints with `rateLimit()`.
- Sanitize rich text with `sanitizeRichText()` on save and on render.
