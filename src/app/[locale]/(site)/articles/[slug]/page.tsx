import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { getArticle, coverImage } from "@/lib/data/public-content";
import { company } from "@/content/site/company";
import { PostHeader } from "@/components/site/post-header";
import { ContentBody } from "@/components/site/content-body";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, absoluteUrl, siteUrl } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const article = await getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    locale,
    path: `/articles/${article.slug}`,
    title: pick(article, "seo_title", locale) || pick(article, "title", locale),
    description: pick(article, "seo_description", locale) || pick(article, "excerpt", locale),
    type: "article",
    image: coverImage(article, locale)?.src ?? null,
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const article = await getArticle(slug);
  if (!article) notFound();

  const t = await getTranslations("site.content");
  const tn = await getTranslations("site.nav");
  const cover = coverImage(article, locale);
  const title = pick(article, "title", locale);
  const author = article.author;
  const authorName = author ? pick(author, "name", locale) : null;
  const authorTitle = author ? pick(author, "title", locale) : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: pick(article, "excerpt", locale) || undefined,
    image: cover ? [cover.src] : undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(locale, `/articles/${article.slug}`),
    author: authorName ? { "@type": "Person", name: authorName, jobTitle: authorTitle || undefined } : { "@type": "Organization", name: company.legalName.en },
    publisher: { "@type": "Organization", name: company.legalName.en, logo: { "@type": "ImageObject", url: `${siteUrl()}/brand/logo/primary-graphite.png` } },
  };

  return (
    <article>
      <JsonLd data={schema} />
      <PostHeader
        crumbs={[{ href: "/", label: tn("home") }, { href: "/articles", label: tn("articles") }, { label: title }]}
        title={title}
        lead={pick(article, "excerpt", locale) || null}
        meta={[
          article.category ? pick(article.category, "name", locale) : null,
          authorName ? t("by", { name: authorName }) : null,
          article.published_at ? t("publishedOn", { date: formatDate(article.published_at, locale, "long") }) : null,
          article.reading_minutes ? t("readingTime", { minutes: article.reading_minutes }) : null,
        ]}
        cover={cover}
      />
      <div className="container-page py-12 sm:py-16">
        <ContentBody html={pick(article, "body", locale)} />
        {authorName ? (
          <aside className="mt-12 max-w-prose border-t border-fog pt-6">
            <p className="text-label text-slate">{t("by", { name: authorName })}</p>
            {authorTitle ? <p className="mt-1 text-small text-slate">{authorTitle}</p> : null}
          </aside>
        ) : null}
        <div className="mt-8 border-t border-fog pt-6 text-small">
          <Link href="/articles" className="site-link text-slate hover:text-graphite">
            {t("articles.backToList")}
          </Link>
        </div>
      </div>
    </article>
  );
}
