import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { PageIntro } from "@/components/site/page-intro";
import { SectionHeading } from "@/components/site/section-heading";
import { PracticeGrid } from "@/components/site/practice-grid";
import { ServiceCard, ServiceGrid } from "@/components/site/service-card";
import { CtaPanel } from "@/components/site/cta-panel";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, absoluteUrl } from "@/components/site/metadata";
import { practices, getPractice, servicesByPractice } from "@/content/services";

type Props = { params: Promise<{ locale: string; practice: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => practices.map((p) => ({ locale, practice: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, practice: slug } = await params;
  const locale = resolveLocale(raw);
  const practice = getPractice(slug);
  if (!practice) return {};
  return pageMetadata({ locale, path: `/services/${practice.slug}`, title: practice.seo.title[locale], description: practice.seo.description[locale] });
}

export default async function PracticePage({ params }: Props) {
  const { locale: raw, practice: slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const practice = getPractice(slug);
  if (!practice) notFound();

  const t = await getTranslations("site.services");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");
  const list = servicesByPractice(practice.slug);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tn("home"), item: absoluteUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: tn("services"), item: absoluteUrl(locale, "/services") },
      { "@type": "ListItem", position: 3, name: practice.title[locale], item: absoluteUrl(locale, `/services/${practice.slug}`) },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PageIntro
        title={practice.title[locale]}
        lead={practice.intro[locale]}
        crumbs={[{ href: "/", label: tn("home") }, { href: "/services", label: tn("services") }, { label: practice.title[locale] }]}
        aside={<Pictogram name={practice.pictogram} className="size-20 text-graphite lg:size-28" />}
      />

      <section className="border-t border-fog">
        <div className="container-page section">
          <SectionHeading title={t("inPractice")} className="mb-8">
            <p className="text-small tabular-nums text-slate">{t("count", { count: list.length })}</p>
          </SectionHeading>
          <ServiceGrid columns={3}>
            {list.map((s) => (
              <ServiceCard key={s.slug} service={s} locale={locale} />
            ))}
          </ServiceGrid>
        </div>
      </section>

      <section className="border-t border-fog">
        <div className="container-page section">
          <SectionHeading title={t("morePractices")} className="mb-8" />
          <PracticeGrid locale={locale} linkLabel={t("explore")} exclude={practice.slug} />
        </div>
      </section>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} secondary={{ href: "/services", label: t("allServices") }} />
    </>
  );
}
