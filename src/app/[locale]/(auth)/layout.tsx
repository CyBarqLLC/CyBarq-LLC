import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/logo";
import { StreamStatic } from "@/components/brand/stream-static";
import { CornerMarks } from "@/components/brand/elements";
import { LanguageSwitch } from "@/components/site/language-switch";
import { company } from "@/content/site/company";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("auth");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col safe-px py-6 safe-pb">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-graphite" aria-label={company.legalName[locale]}>
            <Logo className="h-7" />
          </Link>
          <LanguageSwitch />
        </div>
        <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {children}
        </main>
        <p className="text-small text-slate">{t("footer", { year: new Date().getFullYear() })}</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-white lg:block" aria-hidden>
        <div className="absolute inset-0 text-graphite">
          <CornerMarks inset="1.5rem" />
        </div>
        <div className="absolute inset-0">
          <StreamStatic preset="opening" width={900} height={1000} density="master" params={{ cy0: 0.55, amp: 0.16 }} preserveAspectRatio="xMidYMid slice" />
        </div>
        <p className="absolute bottom-10 start-10 text-h2 text-graphite">{company.slogan[locale]}</p>
      </aside>
    </div>
  );
}
