"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { defaultLocale, dirOf, isLocale, otherLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * Links to the same page in the other language (locale aware pathname). The
 * visible name is written in the target language and marked up as such; the
 * screen reader prefix stays in the page language, so each part is read in
 * the right voice and the accessible name contains the visible text.
 */
export function LanguageSwitch({ className, icon = false }: { className?: string; icon?: boolean }) {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const target = otherLocale(isLocale(current) ? current : defaultLocale);
  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      className={cn("touch inline-flex items-center px-2 text-graphite transition-colors duration-(--duration-state) hover:text-azure", className)}
    >
      {icon ? (
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden focusable="false" className="me-2 size-[1.125rem] shrink-0">
          <circle cx="9" cy="9" r="7.5" />
          <path d="M1.5 9h15M9 1.5c2.2 2 3.3 4.5 3.3 7.5S11.200 14.500 9 16.500C6.800 14.500 5.700 12 5.700 9S6.800 3.500 9 1.500Z" />
        </svg>
      ) : null}
      <span className="sr-only">{t("switchLanguageLabel")}: </span>
      <span lang={target} dir={dirOf(target)}>
        {t("switchLanguage")}
      </span>
    </Link>
  );
}
