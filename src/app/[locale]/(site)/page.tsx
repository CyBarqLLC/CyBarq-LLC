import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { PracticePanels } from "@/components/site/practice-panels";
import { PrinciplesNarrative } from "@/components/site/principles-narrative";
import { StatementBand } from "@/components/site/statement-band";
import { ServiceStrip } from "@/components/site/service-strip";
import { ServiceStripCard } from "@/components/site/service-card";
import { LatestContent } from "@/components/site/latest-content";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { RegistrationPanel } from "@/components/site/registration-panel";
import { ClosingCta } from "@/components/site/closing-cta";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, siteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { principles } from "@/content/site/principles";
import { featuredServices, getPractice, practices } from "@/content/services";
import { listNews, listArticles, listCaseStudies } from "@/lib/data/public-content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.home" });
  return pageMetadata({ locale, path: "/", title: t("seoTitle"), description: t("seoDescription"), absoluteTitle: true });
}

export default async function HomePage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.home");
  const ts = await getTranslations("site.services");
  const tn = await getTranslations("site.nav");

  const [news, articles, caseStudies] = await Promise.all([listNews(2), listArticles(2), listCaseStudies(2)]);
  const featured = featuredServices();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.legalName.en,
    alternateName: [company.name.en, company.name.ar, company.legalName.ar],
    url: siteUrl(),
    logo: `${siteUrl()}/brand/logo/primary-graphite.png`,
    email: company.emails.general,
    foundingDate: String(company.foundedYear),
    slogan: company.slogan[locale],
    description: company.description[locale],
    address: { "@type": "PostalAddress", addressLocality: "Amman", addressCountry: "JO" },
    sameAs: Object.values(company.social),
  };

  const panels = practices.map((p) => ({
    key: p.slug,
    href: `/services/${p.slug}`,
    title: p.title[locale],
    short: p.short[locale],
    intro: p.intro[locale],
    icon: <Pictogram name={p.pictogram} className="size-8 sm:size-10 lg:size-12" />,
  }));

  const steps = principles.map((p) => ({
    key: p.key,
    title: p.title[locale],
    body: p.body[locale],
    icon: <Pictogram name={p.pictogram} className="size-9 sm:size-11" />,
  }));

  return (
    <>
      <JsonLd data={organization} />

      <Hero locale={locale} title={t("title")} lead={t("lead")} primary={{ href: "/contact", label: t("primaryCta") }} secondary={{ href: "/services", label: t("secondaryCta") }} />

      {/* One system: the four practices */}
      <section className="container-page section" aria-labelledby="practices-title">
        <SectionHeading id="practices-title" title={t("practicesTitle")} lead={t("practicesLead")} />
        <PracticePanels panels={panels} linkLabel={ts("explore")} />
      </section>

      {/* How we work: pinned narrative */}
      <section className="border-t border-fog" aria-labelledby="how-title">
        <div className="container-page section">
          <SectionHeading id="how-title" title={t("howTitle")} />
          <PrinciplesNarrative steps={steps} />
        </div>
      </section>

      <StatementBand statement={company.slogan[locale]} body={t("statementBody")} />

      {/* Selected services: a row that scrolls sideways */}
      <section className="container-page section" aria-labelledby="selected-title">
        <SectionHeading id="selected-title" title={t("selectedTitle")} lead={t("selectedLead")} className="mb-6 sm:mb-8" />
        <ServiceStrip labelledBy="selected-title" controls={{ previous: t("stripPrevious"), next: t("stripNext") }}>
          {featured.map((s) => (
            <ServiceStripCard key={s.slug} service={s} locale={locale} practiceLabel={getPractice(s.practice)?.title[locale]} />
          ))}
        </ServiceStrip>
        <Reveal className="mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{t("allServices")}</Link>
          </Button>
        </Reveal>
      </section>

      {news.length + articles.length + caseStudies.length > 0 ? (
        <section className="border-t border-fog" aria-labelledby="latest-title">
          <div className="container-page section">
            <SectionHeading id="latest-title" title={t("latestTitle")} />
            <LatestContent
              locale={locale}
              news={news}
              articles={articles}
              caseStudies={caseStudies}
              labels={{ news: tn("news"), articles: tn("articles"), caseStudies: tn("caseStudies"), allNews: t("viewAllNews"), allArticles: t("viewAllArticles"), allCaseStudies: t("viewAllCaseStudies") }}
            />
          </div>
        </section>
      ) : null}

      <div className="border-t border-fog">
        <div className="section flex flex-col gap-20 sm:gap-24 lg:gap-28">
          <LogoMarquee id="partners" title={t("partnersTitle")} items={company.partners} labels={{ pause: t("logosPause"), play: t("logosPlay"), subject: t("logosSubject") }} />
          <LogoGrid id="certifications" title={t("certificationsTitle")} items={company.certifications} />
          <RegistrationPanel locale={locale} title={t("registrationTitle")} />
        </div>
      </div>

      <ClosingCta title={t("ctaTitle")} body={t("ctaBody")} primary={{ href: "/contact", label: t("ctaButton") }} secondary={{ href: "/about", label: tn("about") }} />
    </>
  );
}
