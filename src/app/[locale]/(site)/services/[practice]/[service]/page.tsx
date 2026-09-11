import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Pictogram } from "@/components/brand/pictogram";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { NarrativeSection } from "@/components/site/service-narrative";
import { ServiceCard, ServiceGrid } from "@/components/site/service-card";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, absoluteUrl } from "@/components/site/metadata";
import { services, getService, getPractice, relatedServices, servicePath } from "@/content/services";
import { company } from "@/content/site/company";

type Props = { params: Promise<{ locale: string; practice: string; service: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => services.map((s) => ({ locale, practice: s.practice, service: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, practice, service: slug } = await params;
  const locale = resolveLocale(raw);
  const service = getService(practice, slug);
  if (!service) return {};
  return pageMetadata({ locale, path: servicePath(service), title: service.seo.title[locale], description: service.seo.description[locale] });
}

export default async function ServicePage({ params }: Props) {
  const { locale: raw, practice: practiceSlug, service: slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const service = getService(practiceSlug, slug);
  const practice = getPractice(practiceSlug);
  if (!service || !practice) notFound();

  const t = await getTranslations("services");
  const tn = await getTranslations("site.nav");
  const related = relatedServices(service);
  const path = servicePath(service);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tn("home"), item: absoluteUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: tn("services"), item: absoluteUrl(locale, "/services") },
      { "@type": "ListItem", position: 3, name: practice.title[locale], item: absoluteUrl(locale, `/services/${practice.slug}`) },
      { "@type": "ListItem", position: 4, name: service.title[locale], item: absoluteUrl(locale, path) },
    ],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title[locale],
    description: service.seo.description[locale],
    serviceType: service.title.en,
    url: absoluteUrl(locale, path),
    areaServed: "JO",
    provider: { "@type": "Organization", name: company.legalName.en, url: company.url },
  };

  const sections = [
    { id: "problem", heading: t("sections.problem"), section: service.problem },
    { id: "where-it-appears", heading: t("sections.whereItAppears"), section: service.whereItAppears },
    { id: "approach", heading: t("sections.approach"), section: service.approach },
    { id: "engagement", heading: t("sections.engagement"), section: service.engagement },
    { id: "deliverables", heading: t("sections.deliverables"), section: service.deliverables },
    ...(service.extraSections ?? []).map((section, i) => ({ id: `more-${i + 1}`, heading: section.heading?.[locale] ?? "", section })),
    { id: "business-meaning", heading: t("sections.businessMeaning"), section: service.businessMeaning },
  ];

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={serviceSchema} />

      <header className="container-page pt-10 pb-12 sm:pt-14 sm:pb-16">
        <Breadcrumbs
          className="mb-8"
          items={[{ href: "/", label: t("breadcrumbs.home") }, { href: "/services", label: t("breadcrumbs.services") }, { href: `/services/${practice.slug}`, label: practice.title[locale] }, { label: service.title[locale] }]}
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="mb-5 text-small text-slate">
              <Link href={`/services/${practice.slug}`} className="transition-colors duration-(--duration-state) hover:text-azure">
                {practice.title[locale]}
              </Link>
            </p>
            <h1 className="text-display">{service.title[locale]}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-graphite">{service.hero[locale]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/contact?service=${service.slug}`}>{t("cta.button")}</Link>
              </Button>
            </div>
          </div>
          <aside className="flex flex-col gap-4 border-t border-fog pt-6 lg:border-t-0 lg:border-s lg:ps-8 lg:pt-0">
            <Pictogram name={service.pictogram} className="size-14 text-graphite" />
            <p className="text-small text-slate">{t("summaryEyebrow")}</p>
            <p className="text-slate">{service.summary[locale]}</p>
          </aside>
        </div>
      </header>

      <div className="container-page">
        {sections.map((s) => (
          <NarrativeSection key={s.id} id={s.id} heading={s.heading} section={s.section} locale={locale} />
        ))}
      </div>

      <section className="border-t border-fog" aria-labelledby="related-heading">
        <div className="container-page section">
          <h2 id="related-heading" className="text-h2 mb-8">{t("sections.related")}</h2>
          <ServiceGrid columns={3}>
            {related.map((r) => (
              <ServiceCard key={r.slug} service={r} locale={locale} practiceLabel={r.practice !== service.practice ? getPractice(r.practice)?.title[locale] : undefined} />
            ))}
          </ServiceGrid>
        </div>
      </section>

      <section className="border-t border-fog bg-ice">
        <div className="container-page section flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-h1">{t("cta.title", { service: service.title[locale] })}</h2>
            <p className="mt-4 text-lg text-slate">{t("cta.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/contact?service=${service.slug}`}>{t("cta.button")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">{t("cta.secondary")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
