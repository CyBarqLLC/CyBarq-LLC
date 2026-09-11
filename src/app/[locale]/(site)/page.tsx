import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { SectionHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { PracticeGrid } from "@/components/site/practice-grid";
import { ServiceCard, ServiceGrid } from "@/components/site/service-card";
import { StatementPanel } from "@/components/site/statement-panel";
import { LatestContent } from "@/components/site/latest-content";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { RegistrationPanel } from "@/components/site/registration-panel";
import { CtaPanel } from "@/components/site/cta-panel";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, siteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { principles } from "@/content/site/principles";
import { featuredServices, getPractice } from "@/content/services";
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

  return (
    <>
      <JsonLd data={organization} />

      <Hero
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        primary={{ href: "/contact", label: t("primaryCta") }}
        secondary={{ href: "/services", label: t("secondaryCta") }}
      />

      <section className="container-page section">
        <SectionHeader eyebrow={t("practicesEyebrow")} title={t("practicesTitle")} description={t("practicesLead")} />
        <PracticeGrid locale={locale} linkLabel={ts("explore")} />
        <div className="mt-8">
          <Link href="/services" className="text-azure underline-offset-4 hover:underline">
            {t("allServices")}
          </Link>
        </div>
      </section>

      <section className="border-t border-fog">
        <div className="container-page section">
          <SectionHeader eyebrow={t("howEyebrow")} title={t("howTitle")} />
          <div className="grid gap-12 sm:grid-cols-2 lg:gap-x-20 lg:gap-y-16">
            {principles.map((p) => (
              <article key={p.key} className="flex gap-5">
                <Pictogram name={p.pictogram} className="size-10 shrink-0 text-graphite" />
                <div>
                  <h3 className="text-h3">{p.title[locale]}</h3>
                  <p className="mt-2 text-slate">{p.body[locale]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StatementPanel tone="blue" marks eyebrow={t("statementEyebrow")} statement={company.slogan[locale]} body={t("statementBody")} />

      <section className="container-page section">
        <SectionHeader eyebrow={t("selectedEyebrow")} title={t("selectedTitle")} description={t("selectedLead")} />
        <ServiceGrid columns={3}>
          {featured.map((s) => (
            <ServiceCard key={s.slug} service={s} locale={locale} practiceLabel={getPractice(s.practice)?.title[locale]} />
          ))}
        </ServiceGrid>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/services">{t("allServices")}</Link>
          </Button>
        </div>
      </section>

      {news.length + articles.length + caseStudies.length > 0 ? (
        <section className="border-t border-fog">
          <div className="container-page section">
            <SectionHeader eyebrow={t("latestEyebrow")} title={t("latestTitle")} />
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
        <div className="section flex flex-col gap-16 sm:gap-20">
          <LogoMarquee id="partners" title={t("partnersTitle")} items={company.partners} labels={{ pause: t("logosPause"), play: t("logosPlay"), subject: t("logosSubject") }} />
          <LogoGrid id="certifications" title={t("certificationsTitle")} items={company.certifications} />
          <RegistrationPanel locale={locale} title={t("registrationTitle")} />
        </div>
      </div>

      <CtaPanel title={t("ctaTitle")} body={t("ctaBody")} primary={{ href: "/contact", label: t("ctaButton") }} secondary={{ href: "/about", label: tn("about") }} />
    </>
  );
}
