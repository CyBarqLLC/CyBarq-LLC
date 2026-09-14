import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Opening } from "@/components/site/opening";
import { Sheet, mirror } from "@/components/site/sheet";
import { IndexRail } from "@/components/site/index-rail";
import { Rise } from "@/components/site/reveal";
import { ServiceIndex } from "@/components/site/service-index";
import { Passages } from "@/components/site/passages";
import { LimeChapter } from "@/components/site/lime-chapter";
import { SectionHeading } from "@/components/site/section-heading";
import { LatestContent } from "@/components/site/latest-content";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { RegistrationPanel } from "@/components/site/registration-panel";
import { ClosingCta } from "@/components/site/closing-cta";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, siteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { principles } from "@/content/site/principles";
import { getPractice, practices, services, servicePath } from "@/content/services";
import { listNews, listArticles, listCaseStudies } from "@/lib/data/public-content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.home" });
  return pageMetadata({ locale, path: "/", title: t("seoTitle"), description: t("seoDescription"), absoluteTitle: true });
}

/**
 * The home page.
 *
 * It opens on the globe: the company's own pattern wrapped onto the world,
 * turning, releasing blades into the field around it. After that the page is
 * written rather than assembled. There is no wall of cards and no strip of
 * selected services: everything the company does is set out once, as a working
 * index a visitor can read, narrow and search. How the work is done is four
 * short passages of prose. The one change of temperature is a full field of
 * the second colour carrying the statement and the figures.
 */
export default async function HomePage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.home");
  const tn = await getTranslations("site.nav");
  /* The same labels in the language the visitor is not reading, for the rules. */
  const tm = await mirror(locale, "site.home");

  const [news, articles, caseStudies] = await Promise.all([listNews(2), listArticles(2), listCaseStudies(2)]);

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

  const indexItems = services.map((service) => ({
    slug: service.slug,
    practice: service.practice,
    practiceLabel: getPractice(service.practice)?.title[locale] ?? "",
    title: service.title[locale],
    summary: service.summary[locale],
    href: servicePath(service),
  }));

  const steps = principles.map((p) => ({ key: p.key, title: p.title[locale], body: p.body[locale] }));
  const hasLatest = news.length + articles.length + caseStudies.length > 0;

  const rail = [
    { id: "index", label: t("sheets.index") },
    { id: "approach", label: t("sheets.approach") },
    ...(hasLatest ? [{ id: "latest", label: t("sheets.latest") }] : []),
    { id: "trust", label: t("sheets.trust") },
  ];

  return (
    <>
      <JsonLd data={organization} />
      <IndexRail items={rail} label={t("railLabel")} />

      <Opening
        title={t("title")}
        lead={t("lead")}
        primary={{ href: "/contact", label: t("primaryCta") }}
        secondary={{ href: "#index", label: t("secondaryCta") }}
        ledger={practices.map((p) => ({ href: `/services/${p.slug}`, label: p.title[locale] }))}
        ledgerLabel={t("ledgerLabel")}
      />

      {/* 01 — What we do, set out once and in full. */}
      <section id="index" className="container-page section scroll-mt-24" aria-labelledby="index-title">
        <Sheet index={1} label={t("sheets.index")} mirrorLabel={tm("sheets.index")} className="mb-10 sm:mb-14" />
        <h2 id="index-title" className="sr-only">
          {t("sheets.index")}
        </h2>
        <Rise>
          <p className="s-passages__intro mb-10 sm:mb-14">{t("indexIntro")}</p>
        </Rise>
        <ServiceIndex
          items={indexItems}
          practices={practices.map((p) => ({ slug: p.slug, label: p.title[locale] }))}
          labels={{
            region: t("index.region"),
            search: t("index.search"),
            searchLabel: t("index.searchLabel"),
            all: t("index.all"),
            empty: t("index.empty"),
            filterLabel: t("index.filterLabel"),
          }}
        />
      </section>

      {/* 02 — How the work is done, written out. */}
      <section id="approach" className="container-page section scroll-mt-24" aria-labelledby="approach-title">
        <Sheet index={2} label={t("sheets.approach")} mirrorLabel={tm("sheets.approach")} className="mb-10 sm:mb-14" />
        <h2 id="approach-title" className="sr-only">
          {t("approachTitle")}
        </h2>
        <Passages intro={t("approachIntro")} items={steps} />
      </section>

      {/* The one change of temperature: the statement and the figures. */}
      <LimeChapter locale={locale} statement={company.slogan[locale]} body={t("statementBody")} figures={company.stats} />

      {/* 03 — Recent writing and work. */}
      {hasLatest ? (
        <section id="latest" className="container-page section scroll-mt-24" aria-labelledby="latest-title">
          <Sheet index={3} label={t("sheets.latest")} mirrorLabel={tm("sheets.latest")} className="mb-10 sm:mb-14" />
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

      {/* 04 — Who we work with, and the official registration. */}
      <section id="trust" className="container-page section scroll-mt-24" aria-labelledby="trust-title">
        <Sheet index={hasLatest ? 4 : 3} label={t("sheets.trust")} mirrorLabel={tm("sheets.trust")} className="mb-10 sm:mb-14" />
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
