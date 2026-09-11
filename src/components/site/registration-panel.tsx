import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { company } from "@/content/site/company";
import { cn } from "@/lib/utils/cn";
import { JordanLegalName, RegistrationMark, RegistrationNumber } from "./registration";

type RegistrationPanelProps = { locale: Locale; title: string; className?: string };

/**
 * Official registration statement (Jordan and the United States) with the
 * Ministry of Digital Economy and Entrepreneurship mark and the emblem of the
 * Hashemite Kingdom of Jordan. Shares its parts with the footer block.
 */
export async function RegistrationPanel({ locale, title, className }: RegistrationPanelProps) {
  const t = await getTranslations("site.registration");
  return (
    <section aria-labelledby="registration-title" className={cn("container-page", className)}>
      <div className="grid gap-8 border border-fog p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <h2 id="registration-title" className="text-h2">
            {title}
          </h2>
          <p className="mt-4 text-slate">
            {company.registration[locale]} {t("us")}
          </p>
          <p className="mt-4 text-small text-slate">
            {company.legalName[locale]}. <JordanLegalName label={t("legalNameLabel")} />
          </p>
          <RegistrationNumber format={(number) => t("number", { number })} className="mt-1 text-small text-slate" />
        </div>
        <RegistrationMark alt={t("alt")} sizes="(min-width: 1024px) 256px, 60vw" className="w-full max-w-64 justify-self-center lg:justify-self-end" />
      </div>
    </section>
  );
}
