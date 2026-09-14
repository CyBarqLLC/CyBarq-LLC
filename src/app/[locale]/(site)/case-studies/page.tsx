import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pick } from "@/i18n/bilingual";
import { label, PRACTICE_LABELS } from "@/lib/labels";
import { listCaseStudies, coverImage } from "@/lib/data/public-content";
import { EmptyState } from "@/components/ui/states";
import { PageIntro } from "@/components/site/page-intro";
import { ContentCard, ContentGrid } from "@/components/site/content-card";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.content.caseStudies" });
  return pageMetadata({ locale, path: "/case-studies", title: t("title"), description: t("seoDescription") });
}

export default async function CaseStudiesPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.content.caseStudies");
  const tn = await getTranslations("site.nav");
  const items = await listCaseStudies();

  return (
    <>
      <PageIntro title={t("title")} lead={t("lead")} crumbs={[{ href: "/", label: tn("home") }, { label: tn("caseStudies") }]} />
      <div className="container-page pb-16 sm:pb-24">
        {items.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <ContentGrid>
            {items.map((c) => (
              <ContentCard
                key={c.id}
                href={`/case-studies/${c.slug}`}
                title={pick(c, "title", locale)}
                excerpt={pick(c, "summary", locale) || null}
                category={label(PRACTICE_LABELS, c.practice, locale)}
                meta={[pick(c, "industry", locale), c.year ? String(c.year) : null].filter(Boolean).join(" · ") || null}
                image={coverImage(c, locale)}
              />
            ))}
          </ContentGrid>
        )}
      </div>
    </>
  );
}
