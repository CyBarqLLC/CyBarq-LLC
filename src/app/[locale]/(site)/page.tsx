import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pictogram } from "@/components/brand/pictogram";
import { Action } from "@/components/site/action";
import { Hero } from "@/components/site/hero";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { PracticeGrid } from "@/components/site/practice-grid";
import { LatestContent } from "@/components/site/latest-content";
import { LogoMarquee } from "@/components/site/logo-strip";
import { CtaPanel } from "@/components/site/cta-panel";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, siteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { principles } from "@/content/site/principles";
import { featuredServices, practices, services, servicePath } from "@/content/services";
import { listNews, listArticles, listCaseStudies } from "@/lib/data/public-content";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.home" });
  return pageMetadata({ locale, path: "/", title: t("seoTitle"), description: t("seoDescription"), absoluteTitle: true });
}

/**
 * The home page, in the order a visitor asks their questions: what is this
 * (the hero and the globe), what do you build (the four practices), is it for
 * someone like me (who we work with), how do you work (the principles), and
 * how do I reach you. It talks about the work and the people it is for, and
 * says nothing about where the company is registered.
 */
export default async function HomePage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.home");
  const tn = await getTranslations("site.nav");
  const ts = await getTranslations("site.services");

  const [news, articles, caseStudies] = await Promise.all([listNews(2), listArticles(2), listCaseStudies(2)]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.fullName.en,
    alternateName: [company.name.en, company.name.ar, company.fullName.ar],
    url: siteUrl(),
    logo: `${siteUrl()}/brand/logo/primary-graphite.png`,
    email: company.emails.general,
    slogan: company.slogan[locale],
    description: company.description[locale],
    sameAs: Object.values(company.social),
  };

  /* The names that rise off the globe: the work we are asked for most often,
     dealt out across three anchors on the sphere. */
  const featured = featuredServices().map((service) => ({ title: service.title[locale], href: servicePath(service) }));
  /* The globe sits at the end side of the hero, so the anchors are mirrored in
     right to left: two names reach outward, one reaches toward the copy. */
  const anchors = locale === "ar" ? [142, 214, -20] : [38, -34, 200];
  const labels = anchors.map((angle, i) => ({ angle, items: featured.filter((_, index) => index % 3 === i) })).filter((slot) => slot.items.length > 0);

  const facts = (["team", "languages", "reach", "written"] as const).map((key) => ({ title: t(`facts.${key}.title`), body: t(`facts.${key}.body`) }));
  const audiences = (["build", "run", "ai"] as const).map((key) => ({ key, title: t(`serve.${key}.title`), body: t(`serve.${key}.body`) }));
  const figures = [
    { value: String(practices.length), label: t("figures.practices") },
    { value: String(services.length), label: t("figures.services") },
    ...company.stats.map((s) => ({ value: s.value, label: s.label[locale] })),
  ];
  const hasLatest = news.length + articles.length + caseStudies.length > 0;

  return (
    <>
      <JsonLd data={organization} />

      <Hero
        title={t("title")}
        lead={t("lead")}
        primary={{ href: "/contact", label: t("primaryCta") }}
        secondary={{ href: "/services", label: t("secondaryCta") }}
        facts={facts}
        factsLabel={t("factsLabel")}
        labels={labels}
      />

      {/* What we build. */}
      <section id="services" className="s-section" aria-labelledby="build-title">
        <div className="container-page">
          <SectionHeading id="build-title" title={t("buildTitle")} lead={t("buildLead")} />
          <PracticeGrid locale={locale} countLabel={(count) => ts("count", { count })} />
          <Reveal className="mt-10 flex">
            <Action href="/services" variant="line" arrow>
              {ts("allServices")}
            </Action>
          </Reveal>
        </div>
      </section>

      {/* Who we work with. */}
      <section className="s-section s-field-surface" aria-labelledby="serve-title">
        <div className="container-page">
          <SectionHeading id="serve-title" title={t("serveTitle")} lead={t("serveLead")} />
          <Reveal as="ul" stagger className="s-trio">
            {audiences.map((a) => (
              <li key={a.key} className="s-trio__item">
                <h3 className="s-sub">{a.title}</h3>
                <p className="s-soft max-w-md">{a.body}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* How we work. */}
      <section className="s-section" aria-labelledby="approach-title">
        <div className="container-page">
          <SectionHeading id="approach-title" title={t("approachTitle")} lead={t("approachLead")} />
          <ul className="s-rows">
            {principles.map((p) => (
              <Reveal as="li" key={p.key} className="s-row">
                <Pictogram name={p.pictogram} className="size-10 text-azure" />
                <h3 className="s-sub">{p.title[locale]}</h3>
                <p className="s-row__body">{p.body[locale]}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* The statement and the figures: the one field of the second colour. */}
      <section className="s-section s-field-lime text-graphite" aria-labelledby="statement-title">
        <div className="container-page">
          <Reveal stagger className="mb-16 flex flex-col gap-6 lg:mb-24">
            <h2 id="statement-title" className="s-display max-w-4xl">
              {company.slogan[locale]}
            </h2>
            <p className="s-lede max-w-2xl">{t("statementBody")}</p>
          </Reveal>
          <Reveal as="dl" stagger className="s-figures">
            {figures.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd className="s-figure">{f.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* The technology we work with, and recent writing where there is some. */}
      <section className="s-section" aria-label={t("partnersTitle")}>
        <div className="container-page flex flex-col gap-(--s-rhythm)">
          <LogoMarquee id="partners" title={t("partnersTitle")} items={company.partners} labels={{ pause: t("logosPause"), play: t("logosPlay"), subject: t("logosSubject") }} />
          {hasLatest ? (
            <div>
              <SectionHeading id="latest-title" title={t("latestTitle")} />
              <LatestContent
                locale={locale}
                news={news}
                articles={articles}
                caseStudies={caseStudies}
                labels={{ news: tn("news"), articles: tn("articles"), caseStudies: tn("caseStudies"), allNews: t("viewAllNews"), allArticles: t("viewAllArticles"), allCaseStudies: t("viewAllCaseStudies") }}
              />
            </div>
          ) : null}
        </div>
      </section>

      <CtaPanel title={t("ctaTitle")} body={t("ctaBody")} primary={{ href: "/contact", label: t("ctaButton") }} secondary={{ href: "/about", label: tn("about") }} />
    </>
  );
}
