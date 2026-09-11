import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDateTime } from "@/lib/utils/format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { MarkReadButton } from "@/components/portal/mark-read-button";

export default async function PortalNotificationsPage() {
  const viewer = await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title_en, title_ar, body_en, body_ar, link, read_at, created_at")
    .eq("user_id", viewer.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  const unread = rows.some((n) => !n.read_at);

  return (
    <div>
      <PageHeader title={t("notifications.title")} actions={unread ? <MarkReadButton label={t("notifications.markAllRead")} /> : null} />
      {rows.length === 0 ? (
        <EmptyState title={t("notifications.empty")} />
      ) : (
        <ul className="flex flex-col divide-y divide-fog border border-fog bg-white">
          {rows.map((n) => {
            const title = pick(n, "title", locale);
            const body = pick(n, "body", locale);
            const href = n.link && n.link.startsWith("/portal") ? n.link : null;
            return (
              <li key={n.id} className={`flex flex-col gap-1 px-5 py-4 ${n.read_at ? "" : "bg-ice/40"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  {href ? <Link href={href} className="font-medium hover:text-azure">{title}</Link> : <span className="font-medium">{title}</span>}
                  <span className="text-small text-slate">{formatDateTime(n.created_at, locale)}</span>
                </div>
                {body ? <p className="text-small text-slate">{body}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
