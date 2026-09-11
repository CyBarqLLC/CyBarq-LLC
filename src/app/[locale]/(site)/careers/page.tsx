import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
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

      <div className="container-page pb-4">
        {careers.sections.map((s) => (
          <Reveal as="section" key={s.title.en} className="grid gap-4 border-t border-fog py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <h2 className="text-h2">{s.title[locale]}</h2>
            <p className="max-w-prose text-lg leading-relaxed">{s.body[locale]}</p>
          </Reveal>
        ))}
      </div>

      <section className="border-t border-fog bg-ice">
        <Reveal className="container-page section grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <h2 className="text-h1">{careers.applyTitle[locale]}</h2>
            <p className="mt-5 max-w-prose text-lg text-slate">{careers.applyBody[locale]}</p>
            <p className="mt-5 text-small text-slate">
              {t("verifyNote")}{" "}
              <Link href="/verify" className="text-azure underline underline-offset-4">
                {tn("verify")}
              </Link>
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal py-3 text-start">
              <a href={`mailto:${email}?subject=${encodeURIComponent(t("mailSubject"))}`}>{t("applyButton", { email })}</a>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
