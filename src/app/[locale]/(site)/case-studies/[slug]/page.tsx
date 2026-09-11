import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/i18n/bilingual";
import { label, PRACTICE_LABELS } from "@/lib/labels";
import { getCaseStudy, parseImpact, coverImage } from "@/lib/data/public-content";
import { practiceByEnum } from "@/content/services";
import { PostHeader } from "@/components/site/post-header";
import { ContentBody } from "@/components/site/content-body";
import { Reveal } from "@/components/site/reveal";
import { CtaPanel } from "@/components/site/cta-panel";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const item = await getCaseStudy(slug);
  if (!item) return {};
  return pageMetadata({
    locale,
    path: `/case-studies/${item.slug}`,
    title: pick(item, "seo_title", locale) || pick(item, "title", locale),
    description: pick(item, "seo_description", locale) || pick(item, "summary", locale),
    image: coverImage(item, locale)?.src ?? null,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const item = await getCaseStudy(slug);
  if (!item) notFound();

  const t = await getTranslations("site.content");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");
  const practice = practiceByEnum(item.practice);
  const impact = parseImpact(item.impact);
  const client = pick(item, "client_display_name", locale);
  const industry = pick(item, "industry", locale);

  const sections = [
    { key: "challenge", title: t("caseStudies.challenge"), html: pick(item, "challenge", locale) },
    { key: "solution", title: t("caseStudies.solution"), html: pick(item, "solution", locale) },
    { key: "implementation", title: t("caseStudies.implementation"), html: pick(item, "implementation", locale) },
    { key: "outcome", title: t("caseStudies.outcome"), html: pick(item, "outcome", locale) },
  ].filter((s) => s.html.trim() !== "");

  return (
    <>
      <PostHeader
        crumbs={[{ href: "/", label: tn("home") }, { href: "/case-studies", label: tn("caseStudies") }, { label: pick(item, "title", locale) }]}
        title={pick(item, "title", locale)}
        lead={pick(item, "summary", locale) || null}
        meta={[label(PRACTICE_LABELS, item.practice, locale), client ? `${t("client")}: ${client}` : null, industry ? `${t("industry")}: ${industry}` : null, item.year ? `${t("year")}: ${item.year}` : null]}
        cover={coverImage(item, locale)}
      />

      <div className="container-page pt-6 sm:pt-10">
        {sections.map((s) => (
          <section key={s.key} className="grid gap-4 border-t border-fog py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <h2 className="text-h2 lg:sticky lg:top-[calc(var(--site-header-offset)+1.5rem)] lg:self-start">{s.title}</h2>
            <Reveal>
              <ContentBody html={s.html} />
            </Reveal>
          </section>
        ))}

        {impact.length > 0 ? (
          <section className="grid gap-4 border-t border-fog py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <h2 className="text-h2">{t("caseStudies.impact")}</h2>
            <Reveal as="dl" stagger className="grid gap-px border border-fog bg-fog sm:grid-cols-2">
              {impact.map((i, idx) => (
                <div key={idx} className="flex flex-col gap-2 bg-white p-5">
                  <dt className="order-2 text-small text-slate">{locale === "ar" ? i.label_ar || i.label_en : i.label_en || i.label_ar}</dt>
                  <dd className="order-1 text-h2 tabular-nums">{i.value}</dd>
                  {i.verified === true ? <dd className="order-3 mt-1 text-label text-success">{t("caseStudies.verified")}</dd> : null}
                </div>
              ))}
            </Reveal>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-fog py-8 text-small">
          <Link href="/case-studies" className="site-link text-slate hover:text-graphite">
            {t("caseStudies.backToList")}
          </Link>
          {practice ? (
            <Link href={`/services/${practice.slug}`} className="site-link text-azure">
              {t("moreInPractice", { practice: practice.title[locale] })}
            </Link>
          ) : null}
        </div>
      </div>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} />
    </>
  );
}
