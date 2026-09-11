# CyBarq Platform

Public website, internal company platform and client portal for CyBarq Technology LLC (سايبرق للتكنولوجيا). Bilingual (Arabic and English), built on Next.js, TypeScript, Tailwind, Supabase and Vercel.

- `docs/IMPLEMENTATION_PLAN.md`: architecture, entities, role model, RLS and storage strategy.
- `docs/CONVENTIONS.md`: how to add a module (actions, forms, pages, i18n, security checklist).
- `docs/DEPLOYMENT.md`: Supabase and Vercel setup, environment variables, migrations.
- `docs/SECURITY_REVIEW.md`: threat review, controls, residual risks.
- `docs/TECHNICAL_REPORT.md`: delivery report for this rebuild.

## Structure

```
src/app/[locale]/(site)        public website (en, ar)
src/app/[locale]/(platform)/app internal platform
src/app/[locale]/(portal)/portal client portal
src/app/[locale]/(auth)        sign in, password reset
src/app/api                    PDF documents, private file access, auth callback, cron
src/components/{ui,brand,site,platform,...}
src/content                    company facts and service narratives (both languages)
src/lib                        supabase clients, auth/session, actions, validation, pdf, email, storage
supabase/migrations            versioned schema, RLS, triggers, RPCs, seed
supabase/tests                 RLS scenario suite (plain PostgreSQL 16)
messages/{en,ar}               UI strings per namespace
legacy/                        the previous static site, kept for reference
CyBarq_Brand_Refresh_2026/     brand source files (logos, pattern, colour, pictograms, guidelines)
```

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm test:db      # RLS suite against a local PostgreSQL 16 (creates database cybarq_test)
pnpm db:types     # regenerate src/lib/supabase/database.types.ts from the test database
```

## Brand

The 2026 identity is the visual baseline: Thmanyah Sans for both languages, CyBarq Blue `#74C3F2` as the one flat field per layout, Sky and Ice for surfaces, Lime as a quiet secondary, Graphite for text, square corners, no gradients in interface components, no dashed strokes, the Stream (blades of the symbol on a fixed grid) as the motion identity. Tokens live in `src/styles/globals.css`; the Stream maths in `src/components/brand/stream-math.ts` mirrors the brand pattern generator.
