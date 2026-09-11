import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { getNewsPost, coverImage } from "@/lib/data/public-content";
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
  const post = await getNewsPost(slug);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/news/${post.slug}`,
    title: pick(post, "seo_title", locale) || pick(post, "title", locale),
    description: pick(post, "seo_description", locale) || pick(post, "excerpt", locale),
    type: "article",
    image: coverImage(post, locale)?.src ?? null,
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
  });
}

export default async function NewsPostPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const post = await getNewsPost(slug);
  if (!post) notFound();

  const t = await getTranslations("site.content");
  const tn = await getTranslations("site.nav");
  const cover = coverImage(post, locale);
  const authorName = post.author ? pick(post.author, "name", locale) : null;
  const title = pick(post, "title", locale);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: pick(post, "excerpt", locale) || undefined,
    image: cover ? [cover.src] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(locale, `/news/${post.slug}`),
    author: authorName ? { "@type": "Person", name: authorName } : { "@type": "Organization", name: company.legalName.en },
    publisher: { "@type": "Organization", name: company.legalName.en, logo: { "@type": "ImageObject", url: `${siteUrl()}/brand/logo/primary-graphite.png` } },
  };

  return (
    <article>
      <JsonLd data={schema} />
      <PostHeader
        crumbs={[{ href: "/", label: tn("home") }, { href: "/news", label: tn("news") }, { label: title }]}
        title={title}
        lead={pick(post, "excerpt", locale) || null}
        meta={[post.category ? pick(post.category, "name", locale) : null, authorName ? t("by", { name: authorName }) : null, post.published_at ? t("publishedOn", { date: formatDate(post.published_at, locale, "long") }) : null]}
        cover={cover}
      />
      <div className="container-page py-12 sm:py-16">
        <ContentBody html={pick(post, "body", locale)} />
        <div className="mt-12 border-t border-fog pt-6 text-small">
          <Link href="/news" className="site-link text-slate hover:text-graphite">
            {t("news.backToList")}
          </Link>
        </div>
      </div>
    </article>
  );
}
