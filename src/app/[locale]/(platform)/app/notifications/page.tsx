import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, withPage, type SearchParams } from "@/lib/data/paginate";
import { formatDateTime } from "@/lib/utils/format";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ActionButton } from "@/components/platform/action-button";
import { ListPagination } from "@/components/platform/list-pagination";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.notifications");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.notifications");
  const supabase = await createClient();
  const { page, pageSize, from, to } = pagination(sp);

  const [{ data: rows, count }, { count: unread }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title_en, title_ar, body_en, body_ar, link, read_at, created_at", { count: "exact" })
      .eq("user_id", viewer.userId)
      .order("read_at", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", viewer.userId).is("read_at", null),
  ]);
  const list = rows ?? [];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={(unread ?? 0) > 0 ? (
          <ActionButton action={markAllNotificationsRead} variant="outline" size="sm" successMessage={t("allRead")}>
            {t("markAllRead")}
          </ActionButton>
        ) : undefined}
      />
      {list.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyHint")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((n) => {
            const isUnread = n.read_at === null;
            const title = locale === "ar" ? n.title_ar : n.title_en;
            const body = locale === "ar" ? n.body_ar : n.body_en;
            return (
              <li key={n.id} className={cn("flex flex-col gap-3 border border-fog p-4 sm:flex-row sm:items-center sm:justify-between", isUnread ? "bg-white" : "bg-surface")}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-body", isUnread && "font-medium")}>{title}</span>
                    {isUnread ? <Badge variant="blue">{t("unread")}</Badge> : null}
                  </div>
                  {body ? <p className="mt-1 text-small text-slate">{body}</p> : null}
                  <p className="mt-1 text-label text-slate">{formatDateTime(n.created_at, locale)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {n.link ? (
                    <Link href={n.link} className="touch inline-flex items-center border border-fog px-3 text-small hover:bg-surface">{t("open")}</Link>
                  ) : null}
                  {isUnread ? (
                    <ActionButton action={markNotificationRead.bind(null, n.id)} variant="ghost" size="sm" successMessage={t("read")}>
                      {t("markRead")}
                    </ActionButton>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/notifications`, {}, p)} />
    </>
  );
}
