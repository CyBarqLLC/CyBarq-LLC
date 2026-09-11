import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { coverImage, type PostListItem, type CaseStudyListItem } from "@/lib/data/public-content";
import { ContentCard, ContentGrid } from "./content-card";
import { Reveal } from "./reveal";

type LatestContentProps = {
  locale: Locale;
  news: PostListItem[];
  articles: PostListItem[];
  caseStudies: CaseStudyListItem[];
  labels: { news: string; articles: string; caseStudies: string; allNews: string; allArticles: string; allCaseStudies: string };
};

/**
 * Home page strip of the latest published content. Renders nothing when every
 * list is empty: no placeholders on the public site.
 */
export function LatestContent({ locale, news, articles, caseStudies, labels }: LatestContentProps) {
  type Item = { key: string; href: string; title: string; excerpt: string | null; category: string; date: string | null; image: { src: string; alt: string } | null };
  const items: Item[] = [
    ...news.slice(0, 2).map((n) => ({ key: `news-${n.id}`, href: `/news/${n.slug}`, title: pick(n, "title", locale), excerpt: pick(n, "excerpt", locale) || null, category: labels.news, date: n.published_at, image: coverImage(n, locale) })),
    ...articles.slice(0, 2).map((a) => ({ key: `article-${a.id}`, href: `/articles/${a.slug}`, title: pick(a, "title", locale), excerpt: pick(a, "excerpt", locale) || null, category: labels.articles, date: a.published_at, image: coverImage(a, locale) })),
    ...caseStudies.slice(0, 2).map((c) => ({ key: `case-${c.id}`, href: `/case-studies/${c.slug}`, title: pick(c, "title", locale), excerpt: pick(c, "summary", locale) || null, category: labels.caseStudies, date: c.published_at, image: coverImage(c, locale) })),
  ];
  if (items.length === 0) return null;

  const links = [
    news.length > 0 ? { href: "/news", label: labels.allNews } : null,
    articles.length > 0 ? { href: "/articles", label: labels.allArticles } : null,
    caseStudies.length > 0 ? { href: "/case-studies", label: labels.allCaseStudies } : null,
  ].filter((l): l is { href: string; label: string } => l !== null);

  return (
    <>
      <ContentGrid>
        {items.slice(0, 6).map((item) => (
          <ContentCard key={item.key} href={item.href} title={item.title} excerpt={item.excerpt} category={item.category} meta={item.date ? formatDate(item.date, locale, "long") : null} image={item.image} />
        ))}
      </ContentGrid>
      {links.length > 0 ? (
        <Reveal className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-small">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="site-link text-azure">
              {l.label}
            </Link>
          ))}
        </Reveal>
      ) : null}
    </>
  );
}
