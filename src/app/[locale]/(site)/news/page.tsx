import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { listNews, coverImage } from "@/lib/data/public-content";
import { EmptyState } from "@/components/ui/states";
import { PageIntro } from "@/components/site/page-intro";
import { ContentCard, ContentGrid } from "@/components/site/content-card";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.content.news" });
  return pageMetadata({ locale, path: "/news", title: t("title"), description: t("seoDescription") });
}

export default async function NewsPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.content.news");
  const tn = await getTranslations("site.nav");
  const posts = await listNews();

  return (
    <>
      <PageIntro title={t("title")} lead={t("lead")} crumbs={[{ href: "/", label: tn("home") }, { label: tn("news") }]} />
      <div className="container-page pb-16 sm:pb-24">
        {posts.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <ContentGrid>
            {posts.map((p) => (
              <ContentCard
                key={p.id}
                href={`/news/${p.slug}`}
                title={pick(p, "title", locale)}
                excerpt={pick(p, "excerpt", locale) || null}
                eyebrow={p.category ? pick(p.category, "name", locale) : null}
                meta={p.published_at ? formatDate(p.published_at, locale, "long") : null}
                image={coverImage(p, locale)}
              />
            ))}
          </ContentGrid>
        )}
      </div>
    </>
  );
}
