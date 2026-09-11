import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { SectionHeader } from "@/components/ui/page-header";
import { PageIntro } from "@/components/site/page-intro";
import { PracticeGrid } from "@/components/site/practice-grid";
import { Stats } from "@/components/site/stats";
import { StatementPanel } from "@/components/site/statement-panel";
import { LogoStrip } from "@/components/site/logo-strip";
import { RegistrationPanel } from "@/components/site/registration-panel";
import { CtaPanel } from "@/components/site/cta-panel";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { about } from "@/content/site/about";
import { principles } from "@/content/site/principles";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.about" });
  return pageMetadata({ locale, path: "/about", title: t("title"), description: t("seoDescription") });
}

export default async function AboutPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.about");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");
  const ts = await getTranslations("site.services");

  return (
    <>
      <PageIntro eyebrow={t("title")} title={about.title[locale]} lead={about.lead[locale]} crumbs={[{ href: "/", label: tn("home") }, { label: tn("about") }]} />

      <section className="border-t border-fog">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="text-h2">{t("storyEyebrow")}</h2>
          <div className="flex max-w-prose flex-col gap-5 text-lg leading-relaxed">
            {about.story.map((p, i) => (
              <p key={i}>{p[locale]}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-fog">
        <div className="container-page py-14 sm:py-20">
          <SectionHeader eyebrow={t("statsEyebrow")} title={company.legalName[locale]} description={company.city[locale]} className="mb-8" />
          <Stats locale={locale} />
        </div>
      </section>

      <section className="border-t border-fog">
        <div className="container-page py-14 sm:py-20">
          <SectionHeader eyebrow={th("practicesEyebrow")} title={about.practicesTitle[locale]} description={about.practicesLead[locale]} />
          <PracticeGrid locale={locale} linkLabel={ts("explore")} />
          <div className="mt-8">
            <Link href="/services" className="text-azure hover:underline underline-offset-4">{t("practicesLink")}</Link>
          </div>
        </div>
      </section>

      <StatementPanel tone="ice" statement={company.slogan[locale]} body={th("statementBody")} />

      <section>
        <div className="container-page py-14 sm:py-20">
          <SectionHeader eyebrow={th("howEyebrow")} title={about.howTitle[locale]} />
          <div className="grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {principles.map((p) => (
              <article key={p.key} className="flex flex-col gap-4 bg-white p-6 sm:p-8">
                <Pictogram name={p.pictogram} className="size-10 text-graphite" />
                <h3 className="text-h3">{p.title[locale]}</h3>
                <p className="text-slate">{p.body[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-fog">
        <div className="section flex flex-col gap-14">
          <LogoStrip title={th("partnersTitle")} logos={company.partnerLogos} alt="Partner logo" />
          <LogoStrip title={th("certificationsTitle")} logos={company.certificationLogos} alt="Certification logo" />
          <RegistrationPanel locale={locale} title={about.registrationTitle[locale]} imageAlt={th("registrationAlt")} />
        </div>
      </div>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} secondary={{ href: "/careers", label: tn("careers") }} />
    </>
  );
}
