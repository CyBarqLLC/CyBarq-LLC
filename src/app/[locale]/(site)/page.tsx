import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Opening } from "@/components/site/opening";
import { Sheet } from "@/components/site/sheet";
import { Rise } from "@/components/site/reveal";
import { PracticeColumns } from "@/components/site/practice-columns";
import { Passages } from "@/components/site/passages";
import { LimeChapter } from "@/components/site/lime-chapter";
import { SectionHeading } from "@/components/site/section-heading";
import { LatestContent } from "@/components/site/latest-content";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { ClosingCta } from "@/components/site/closing-cta";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, siteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { principles } from "@/content/site/principles";
import { practices, servicesByPractice, servicePath, type PracticeSlug } from "@/content/services";
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
 * It opens on the globe: the company's own symbol repeated over the world in
 * one blue, turning slowly, a few marks drifting away from it. After that the
 * page is written rather than assembled: four quiet columns say what the
 * company does, four short passages say how it works, and one field of the
 * second colour carries the statement and the figures. Nothing is numbered.
 */
export default async function HomePage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.home");
  const tn = await getTranslations("site.nav");

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

  const columns = practices.map((practice) => ({
    slug: practice.slug,
    title: practice.title[locale],
    short: practice.short[locale],
    href: `/services/${practice.slug}`,
    services: servicesByPractice(practice.slug as PracticeSlug).map((service) => ({
      slug: service.slug,
      title: service.title[locale],
      href: servicePath(service),
    })),
  }));

  const steps = principles.map((p) => ({ key: p.key, title: p.title[locale], body: p.body[locale] }));
  const hasLatest = news.length + articles.length + caseStudies.length > 0;

  return (
    <>
      <JsonLd data={organization} />

      <Opening
        title={t("title")}
        lead={t("lead")}
        primary={{ href: "/contact", label: t("primaryCta") }}
        secondary={{ href: "#index", label: t("secondaryCta") }}
        ledger={practices.map((p) => ({ href: `/services/${p.slug}`, label: p.title[locale] }))}
        ledgerLabel={t("ledgerLabel")}
      />

      {/* 01 — What we do, set out once and in full. */}
      <section id="index" className="container-page scroll-mt-24 pt-14 pb-(--spacing-section) sm:pt-20" aria-labelledby="index-title">
        <Sheet label={t("sheets.index")} className="mb-10 sm:mb-14" />
        <h2 id="index-title" className="sr-only">
          {t("sheets.index")}
        </h2>
        <Rise>
          <p className="s-passages__intro mb-12 sm:mb-16">{t("indexIntro")}</p>
        </Rise>
        <PracticeColumns items={columns} />
      </section>

      {/* 02 — How the work is done, written out. */}
      <section id="approach" className="container-page section scroll-mt-24" aria-labelledby="approach-title">
        <Sheet label={t("sheets.approach")} className="mb-10 sm:mb-14" />
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
          <Sheet label={t("sheets.latest")} className="mb-10 sm:mb-14" />
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
        <Sheet label={t("sheets.trust")} className="mb-10 sm:mb-14" />
        <h2 id="trust-title" className="sr-only">
          {t("sheets.trust")}
        </h2>
        <div className="flex flex-col gap-20 sm:gap-24">
          <LogoMarquee id="partners" title={t("partnersTitle")} items={company.partners} labels={{ pause: t("logosPause"), play: t("logosPlay"), subject: t("logosSubject") }} />
          <LogoGrid id="certifications" title={t("certificationsTitle")} items={company.certifications} />
        </div>
      </section>

      <ClosingCta title={t("ctaTitle")} body={t("ctaBody")} primary={{ href: "/contact", label: t("ctaButton") }} secondary={{ href: "/about", label: tn("about") }} />
    </>
  );
}
