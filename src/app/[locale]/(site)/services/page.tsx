import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { PageIntro } from "@/components/site/page-intro";
import { ServiceCard, ServiceGrid } from "@/components/site/service-card";
import { CtaPanel } from "@/components/site/cta-panel";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, absoluteUrl } from "@/components/site/metadata";
import { practices, servicesByPractice } from "@/content/services";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.services" });
  return pageMetadata({ locale, path: "/services", title: t("title"), description: t("seoDescription") });
}

export default async function ServicesPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.services");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tn("home"), item: absoluteUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: t("title"), item: absoluteUrl(locale, "/services") },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PageIntro title={t("title")} lead={t("lead")} crumbs={[{ href: "/", label: tn("home") }, { label: t("title") }]}>
        <nav aria-label={t("title")} className="flex flex-wrap gap-x-6 gap-y-2 text-small">
          {practices.map((p) => (
            <a key={p.slug} href={`#${p.slug}`} className="text-azure hover:underline underline-offset-4">{p.title[locale]}</a>
          ))}
        </nav>
      </PageIntro>

      {practices.map((p) => {
        const list = servicesByPractice(p.slug);
        return (
          <section key={p.slug} id={p.slug} className="border-t border-fog" aria-labelledby={`${p.slug}-title`}>
            <div className="container-page section">
              <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end">
                <div className="flex gap-5">
                  <Pictogram name={p.pictogram} className="size-12 shrink-0 text-graphite" />
                  <div>
                    <p className="text-small text-slate">{t("count", { count: list.length })}</p>
                    <h2 id={`${p.slug}-title`} className="text-h1 mt-1">
                      <Link href={`/services/${p.slug}`} className="hover:text-azure">{p.title[locale]}</Link>
                    </h2>
                    <p className="mt-3 max-w-2xl text-slate">{p.intro[locale]}</p>
                  </div>
                </div>
              </div>
              <ServiceGrid columns={3}>
                {list.map((s) => (
                  <ServiceCard key={s.slug} service={s} locale={locale} />
                ))}
              </ServiceGrid>
            </div>
          </section>
        );
      })}

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} />
    </>
  );
}
