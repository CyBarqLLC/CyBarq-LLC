import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { Sheet, mirror } from "@/components/site/sheet";
import { IndexRail } from "@/components/site/index-rail";
import { SectionHeading } from "@/components/site/section-heading";
import { Settle } from "@/components/site/reveal";
import { SpecimenGrid } from "@/components/site/specimens";
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

/**
 * The home page, composed as a document rather than a landing page: an opening
 * field with one statement, then numbered sheets — each one a rule, a number,
 * and the same label in both languages — with a single contained Graphite
 * chapter carrying the slogan and the figures. On very wide screens a live
 * index of those sheets sits in the start margin, the way the brand book
 * carries its contents column.
 */
export default async function HomePage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.home");
  const ts = await getTranslations("site.services");
  const tn = await getTranslations("site.nav");
  /* The same labels in the language the visitor is not reading, for the rules. */
  const tm = await mirror(locale, "site.home");

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

  const specimens = practices.map((p) => ({
    key: p.slug,
    href: `/services/${p.slug}`,
    title: p.title[locale],
    short: p.short[locale],
    icon: <Pictogram name={p.pictogram} className="size-9 sm:size-10" />,
  }));

  const steps = principles.map((p) => ({
    key: p.key,
    title: p.title[locale],
    body: p.body[locale],
    icon: <Pictogram name={p.pictogram} className="size-9 sm:size-11" />,
  }));

  const hasLatest = news.length + articles.length + caseStudies.length > 0;

  const rail = [
    { id: "practices", label: t("sheets.practices") },
    { id: "approach", label: t("sheets.approach") },
    { id: "selected", label: t("sheets.services") },
    ...(hasLatest ? [{ id: "latest", label: t("sheets.latest") }] : []),
    { id: "trust", label: t("sheets.trust") },
  ];

  return (
    <>
      <JsonLd data={organization} />
      <IndexRail items={rail} label={t("railLabel")} />

      <Hero
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        primary={{ href: "/contact", label: t("primaryCta") }}
        secondary={{ href: "/services", label: t("secondaryCta") }}
        ledger={practices.map((p) => ({ href: `/services/${p.slug}`, label: p.title[locale] }))}
        ledgerLabel={t("ledgerLabel")}
      />

      {/* 01 — One system: the four practices, set as specimens. */}
      <section id="practices" className="container-page section scroll-mt-24" aria-labelledby="practices-title">
        <Sheet index={1} label={t("sheets.practices")} mirrorLabel={tm("sheets.practices")} className="mb-12 sm:mb-16" />
        <SectionHeading id="practices-title" title={t("practicesTitle")} lead={t("practicesLead")} />
        <SpecimenGrid items={specimens} linkLabel={ts("explore")} />
      </section>

      {/* 02 — How the work is done. */}
      <section id="approach" className="container-page section scroll-mt-24" aria-labelledby="approach-title">
        <Sheet index={2} label={t("sheets.approach")} mirrorLabel={tm("sheets.approach")} className="mb-12 sm:mb-16" />
        <SectionHeading id="approach-title" title={t("howTitle")} />
        <PrinciplesNarrative steps={steps} />
      </section>

      {/* The one dark chapter: the slogan and the figures. */}
      <StatementBand locale={locale} statement={company.slogan[locale]} body={t("statementBody")} figures={company.stats} />

      {/* 03 — Where clients usually start. */}
      <section id="selected" className="container-page section scroll-mt-24" aria-labelledby="selected-title">
        <Sheet index={3} label={t("sheets.services")} mirrorLabel={tm("sheets.services")} className="mb-12 sm:mb-16" />
        <SectionHeading id="selected-title" title={t("selectedTitle")} lead={t("selectedLead")} className="mb-8 sm:mb-10" />
        <ServiceStrip labelledBy="selected-title" controls={{ previous: t("stripPrevious"), next: t("stripNext") }}>
          {featured.map((s) => (
            <ServiceStripCard key={s.slug} service={s} locale={locale} practiceLabel={getPractice(s.practice)?.title[locale]} />
          ))}
        </ServiceStrip>
        <Settle className="mt-10">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{t("allServices")}</Link>
          </Button>
        </Settle>
      </section>

      {/* 04 — News, articles and work. */}
      {hasLatest ? (
        <section id="latest" className="container-page section scroll-mt-24" aria-labelledby="latest-title">
          <Sheet index={4} label={t("sheets.latest")} mirrorLabel={tm("sheets.latest")} className="mb-12 sm:mb-16" />
          <SectionHeading id="latest-title" title={t("latestTitle")} />
          <LatestContent
            locale={locale}
            news={news}
            articles={articles}
            caseStudies={caseStudies}
            labels={{ news: tn("news"), articles: tn("articles"), caseStudies: tn("caseStudies"), allNews: t("viewAllNews"), allArticles: t("viewAllArticles"), allCaseStudies: t("viewAllCaseStudies") }}
          />
        </section>
      ) : null}

      {/* 05 — Who we work with, and the official registration. */}
      <section id="trust" className="container-page section scroll-mt-24" aria-labelledby="trust-title">
        <Sheet index={hasLatest ? 5 : 4} label={t("sheets.trust")} mirrorLabel={tm("sheets.trust")} className="mb-12 sm:mb-16" />
        <h2 id="trust-title" className="sr-only">
          {t("sheets.trust")}
        </h2>
        <div className="flex flex-col gap-20 sm:gap-24">
          <LogoMarquee id="partners" title={t("partnersTitle")} items={company.partners} labels={{ pause: t("logosPause"), play: t("logosPlay"), subject: t("logosSubject") }} />
          <LogoGrid id="certifications" title={t("certificationsTitle")} items={company.certifications} />
          <RegistrationPanel locale={locale} title={t("registrationTitle")} />
        </div>
      </section>

      <ClosingCta title={t("ctaTitle")} body={t("ctaBody")} primary={{ href: "/contact", label: t("ctaButton") }} secondary={{ href: "/about", label: tn("about") }} />
    </>
  );
}
