import * as React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FilterBarProps = {
  /** Locale-less route the form submits to (GET), e.g. "/app/projects". Also used by the reset link. */
  action: string;
  /** Whether any filter is currently active (shows the reset link). */
  active?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Server rendered GET filter form. Works without JavaScript and keeps filters in the URL. */
export async function FilterBar({ action, active, children, className }: FilterBarProps) {
  const [t, tl, locale] = await Promise.all([getTranslations("common"), getTranslations("platform.list"), getLocale()]);
  return (
    <form method="get" action={`/${locale}${action}`} className={cn("mb-5 flex flex-wrap items-end gap-3 border border-fog bg-white p-4", className)}>
      {children}
      <div className="flex items-end gap-2">
        <Button type="submit" variant="subtle" size="md">{t("filter")}</Button>
        {active ? (
          <Button asChild variant="ghost" size="md">
            <Link href={action}>{tl("clear")}</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Compact label + control for filter forms. */
export function FilterField({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none", className)}>
      <label htmlFor={htmlFor} className="text-label text-slate">{label}</label>
      {children}
    </div>
  );
}
