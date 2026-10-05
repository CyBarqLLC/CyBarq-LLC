import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "@/components/site/action";
import { Pictogram } from "@/components/brand/pictogram";
import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/site/reveal";
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
        <nav aria-label={t("title")}>
          <ul className="flex flex-wrap gap-2">
            {practices.map((p) => (
              <li key={p.slug}>
                <a href={`#${p.slug}`} className="s-chip hover:border-white">
                  {p.title[locale]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      {practices.map((p, index) => {
        const list = servicesByPractice(p.slug);
        return (
          <section key={p.slug} id={p.slug} className={index % 2 === 1 ? "s-section s-field-surface" : "s-section"} aria-labelledby={`${p.slug}-title`}>
            <div className="container-page">
              <Reveal stagger className="s-head" data-split="">
                <div className="flex flex-col gap-5">
                  <Pictogram name={p.pictogram} className="size-12 text-azure" />
                  <h2 id={`${p.slug}-title`} className="s-title">
                    {p.title[locale]}
                  </h2>
                </div>
                <div>
                  <p className="s-lede s-head__lead">{p.intro[locale]}</p>
                  <Link href={`/services/${p.slug}`} className="s-head__aside inline-flex min-h-11 items-center gap-3 font-medium text-azure hover:text-graphite">
                    <span className="tabular-nums">{t("count", { count: list.length })}</span>
                    <Arrow />
                  </Link>
                </div>
              </Reveal>
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
