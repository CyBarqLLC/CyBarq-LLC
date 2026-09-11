import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { CornerMarks } from "@/components/brand/elements";
import { AccessForm } from "@/components/maintenance/access-form";
import { MAINTENANCE_COPY } from "@/components/maintenance/copy";
import { safeNextPath, type MaintenanceLang } from "@/lib/site-lock";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
};

function langOf(value: string): MaintenanceLang {
  return value === "ar" ? "ar" : "en";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const copy = MAINTENANCE_COPY[langOf((await params).lang)];
  return {
    title: copy.metaTitle,
    description: copy.lines.join(" "),
    icons: { icon: "/brand/logo/symbol-graphite.svg", apple: "/apple-touch-icon.png" },
    robots: { index: false, follow: false },
  };
}

/**
 * Under Maintenance screen. One logo, one statement, one quiet way in.
 * Shown by the middleware on every page while SITE_LOCKED=true.
 */
export default async function MaintenancePage({ params, searchParams }: Props) {
  const lang = langOf((await params).lang);
  const sp = await searchParams;
  const copy = MAINTENANCE_COPY[lang];
  const next = safeNextPath(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  const errorParam = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const initialError = errorParam === "invalid" || errorParam === "rate_limited" ? errorParam : null;
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-dvh flex-col bg-white text-graphite">
      <div className="pointer-events-none absolute inset-0 text-grey" aria-hidden>
        <CornerMarks inset="max(1rem, env(safe-area-inset-top))" size={12} />
      </div>

      <header className="safe-px safe-pt">
        <div className="mx-auto flex w-full max-w-6xl items-center pt-8 sm:pt-12">
          <Logo className="h-7 sm:h-8" title="CyBarq" />
        </div>
      </header>

      <main id="main" className="safe-px flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-display">{copy.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-slate sm:mt-8 sm:text-xl">
              {copy.lines[0]}
              <br />
              {copy.lines[1]}
            </p>
            <div className="mt-12 sm:mt-16">
              <AccessForm copy={copy} next={next} initialError={initialError} />
            </div>
          </div>
        </div>
      </main>

      <footer className="safe-px safe-pb">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-fog py-6 text-small text-slate">
          <span>
            {copy.company}, {copy.city}
          </span>
          <span>© {year}</span>
        </div>
      </footer>
    </div>
  );
}
