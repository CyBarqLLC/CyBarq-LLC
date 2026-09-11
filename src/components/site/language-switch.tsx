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
export function LanguageSwitch({ className }: { className?: string }) {
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
      <span className="sr-only">{t("switchLanguageLabel")}: </span>
      <span lang={target} dir={dirOf(target)}>
        {t("switchLanguage")}
      </span>
    </Link>
  );
}
