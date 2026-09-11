import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_STATUSES, CONTENT_SEGMENTS, type ContentTable } from "@/lib/validation/content";
import { CONTENT_STATUS_LABELS, label } from "@/lib/labels";
import { formatNumber } from "@/lib/utils/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { countByStatus } from "@/components/content/data";

const SECTIONS: ContentTable[] = ["news_posts", "articles", "public_projects", "case_studies"];

export default async function ContentIndexPage() {
  await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const supabase = await createClient();

  const [news, articles, projects, cases, { count: authors }, { count: categories }, { count: tags }] = await Promise.all([
    supabase.from("news_posts").select("status"),
    supabase.from("articles").select("status"),
    supabase.from("public_projects").select("status"),
    supabase.from("case_studies").select("status"),
    supabase.from("authors").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("tags").select("id", { count: "exact", head: true }),
  ]);
  const counts: Record<ContentTable, ReturnType<typeof countByStatus>> = {
    news_posts: countByStatus(news.data ?? []),
    articles: countByStatus(articles.data ?? []),
    public_projects: countByStatus(projects.data ?? []),
    case_studies: countByStatus(cases.data ?? []),
  };
  const taxonomy = [
    { key: "authors", count: authors ?? 0 },
    { key: "categories", count: categories ?? 0 },
    { key: "tags", count: tags ?? 0 },
  ];

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((table) => {
          const c = counts[table];
          return (
            <Card key={table} className="relative">
              <CardHeader className="flex-row items-baseline justify-between">
                <CardTitle>
                  <Link href={`/app/content/${CONTENT_SEGMENTS[table]}`} className="after:absolute after:inset-0 after:content-['']">
                    {t(`sections.${table}`)}
                  </Link>
                </CardTitle>
                <span className="text-h2 font-light">{formatNumber(c.total, locale)}</span>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {CONTENT_STATUSES.filter((s) => c[s] > 0 || s === "published" || s === "draft").map((s) => (
                  <Status key={s} value={s} label={`${formatNumber(c[s], locale)} ${label(CONTENT_STATUS_LABELS, s, locale)}`} />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <h2 className="mt-10 mb-4 text-h3">{t("taxonomy")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {taxonomy.map((item) => (
          <Card key={item.key} className="relative">
            <CardContent className="flex items-center justify-between">
              <Link href={`/app/content/${item.key}`} className="text-body font-medium after:absolute after:inset-0 after:content-['']">
                {t(`sections.${item.key}`)}
              </Link>
              <span className="text-h3 font-light">{formatNumber(item.count, locale)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
