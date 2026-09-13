import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { listArticles, coverImage } from "@/lib/data/public-content";
import { EmptyState } from "@/components/ui/states";
import { PageIntro } from "@/components/site/page-intro";
import { mirror } from "@/components/site/sheet";
import { ContentCard, ContentGrid } from "@/components/site/content-card";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.content.articles" });
  return pageMetadata({ locale, path: "/articles", title: t("title"), description: t("seoDescription") });
}

export default async function ArticlesPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.content");
  const tn = await getTranslations("site.nav");
  const tMirror = await mirror(locale, "site.nav");
  const articles = await listArticles();

  return (
    <>
      <PageIntro mirrorLabel={tMirror("articles")} title={t("articles.title")} lead={t("articles.lead")} crumbs={[{ href: "/", label: tn("home") }, { label: tn("articles") }]} />
      <div className="container-page pb-16 sm:pb-24">
        {articles.length === 0 ? (
          <EmptyState title={t("articles.empty")} />
        ) : (
          <ContentGrid>
            {articles.map((a) => {
              const meta = [
                a.author ? pick(a.author, "name", locale) : null,
                a.published_at ? formatDate(a.published_at, locale, "long") : null,
                a.reading_minutes ? t("readingTime", { minutes: a.reading_minutes }) : null,
              ].filter((m): m is string => typeof m === "string" && m !== "");
              return (
                <ContentCard
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  title={pick(a, "title", locale)}
                  excerpt={pick(a, "excerpt", locale) || null}
                  category={a.category ? pick(a.category, "name", locale) : null}
                  meta={meta.join(" · ") || null}
                  image={coverImage(a, locale)}
                />
              );
            })}
          </ContentGrid>
        )}
      </div>
    </>
  );
}
