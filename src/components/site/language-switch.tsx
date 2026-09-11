"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { otherLocale, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/** Links to the same page in the other language (locale aware pathname). */
export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("common");
  const target = otherLocale(locale);
  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      dir={target === "ar" ? "rtl" : "ltr"}
      hrefLang={target}
      aria-label={t("switchLanguageLabel")}
      className={cn("touch inline-flex items-center px-2 text-body text-graphite hover:text-azure", className)}
    >
      {t("switchLanguage")}
    </Link>
  );
}
