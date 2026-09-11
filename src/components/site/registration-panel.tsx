import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { company } from "@/content/site/company";
import { cn } from "@/lib/utils/cn";

type RegistrationPanelProps = { locale: Locale; title: string; imageAlt: string; className?: string };

/** Official registration statement with the Jordan ministry and NCSC logos. */
export function RegistrationPanel({ locale, title, imageAlt, className }: RegistrationPanelProps) {
  return (
    <section className={cn("container-page", className)}>
      <div className="grid gap-8 border border-fog p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
        <div className="max-w-2xl">
          <h2 className="text-h2">{title}</h2>
          <p className="mt-4 text-slate">{company.registration[locale]}</p>
          <p className="mt-4 text-small text-slate">{company.legalName[locale]}. {company.city[locale]}.</p>
        </div>
        <Image src="/images/jordan-registration.png" alt={imageAlt} width={1127} height={666} className="h-auto w-full max-w-xs justify-self-center lg:justify-self-end" sizes="(min-width: 1024px) 320px, 80vw" />
      </div>
    </section>
  );
}
