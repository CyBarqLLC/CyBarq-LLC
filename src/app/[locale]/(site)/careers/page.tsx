import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Action } from "@/components/site/action";
import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/site/reveal";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { careers } from "@/content/site/careers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.careers" });
  return pageMetadata({ locale, path: "/careers", title: t("seoTitle"), description: t("seoDescription") });
}

export default async function CareersPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.careers");
  const tn = await getTranslations("site.nav");
  const email = company.emails.general;

  return (
    <>
      <PageIntro title={careers.title[locale]} lead={careers.lead[locale]} crumbs={[{ href: "/", label: tn("home") }, { label: tn("careers") }]} />

      <div className="container-page py-6 sm:py-10">
        {careers.sections.map((s) => (
          <Reveal as="section" key={s.title.en} className="s-narrative">
            <h2 className="s-sub">{s.title[locale]}</h2>
            <p className="s-prose">{s.body[locale]}</p>
          </Reveal>
        ))}
      </div>

      <section className="s-field-blue text-graphite">
        <Reveal className="container-page flex flex-col gap-10 py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-28">
          <div className="max-w-3xl">
            <h2 className="s-title">{careers.applyTitle[locale]}</h2>
            <p className="s-lede mt-5 max-w-2xl">{careers.applyBody[locale]}</p>
            <p className="mt-5 text-small text-graphite/80">
              {t("verifyNote")}{" "}
              <Link href="/verify" className="font-medium text-graphite underline underline-offset-4">
                {tn("verify")}
              </Link>
            </p>
          </div>
          <Action href={`mailto:${email}?subject=${encodeURIComponent(t("mailSubject"))}`} arrow className="shrink-0">
            {t("applyButton", { email })}
          </Action>
        </Reveal>
      </section>
    </>
  );
}
