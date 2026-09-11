import { getLocale, getTranslations } from "next-intl/server";
import { Download, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { ENGAGEMENT_STATUS_LABELS, ENGAGEMENT_TYPE_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";

export default async function PortalSecurityPage() {
  await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  // RLS: clients see engagement headers past scoping, and only final, client visible reports. Findings are never selectable.
  const [{ data: engagements }, { data: reports }] = await Promise.all([
    supabase.from("security_engagements").select("id, code, title, type, status, start_date, end_date").order("created_at", { ascending: false }),
    supabase.from("engagement_reports").select("id, engagement_id, version, title, issued_at").eq("status", "final").eq("client_visible", true).order("issued_at", { ascending: false }),
  ]);
  const reportsByEngagement = new Map<string, NonNullable<typeof reports>>();
  for (const r of reports ?? []) {
    const list = reportsByEngagement.get(r.engagement_id) ?? [];
    list.push(r);
    reportsByEngagement.set(r.engagement_id, list);
  }

  return (
    <div>
      <PageHeader title={t("security.title")} description={t("security.description")} />
      {(engagements ?? []).length === 0 ? (
        <EmptyState title={t("security.empty")} description={t("security.emptyDescription")} icon={<ShieldCheck aria-hidden />} />
      ) : (
        <div className="flex flex-col gap-4">
          {(engagements ?? []).map((e) => {
            const list = reportsByEngagement.get(e.id) ?? [];
            return (
              <Card key={e.id}>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle>{e.title}</CardTitle>
                    <p className="mt-1 text-small text-slate">
                      <span dir="ltr">{e.code}</span> · {label(ENGAGEMENT_TYPE_LABELS, e.type, locale)}
                      {e.start_date || e.end_date ? ` · ${formatDate(e.start_date, locale) || "…"} → ${formatDate(e.end_date, locale) || "…"}` : ""}
                    </p>
                  </div>
                  <Status value={e.status} label={label(ENGAGEMENT_STATUS_LABELS, e.status, locale)} />
                </CardHeader>
                <CardContent className="p-0">
                  {list.length === 0 ? (
                    <p className="px-5 py-4 text-small text-slate">{t("security.noReports")}</p>
                  ) : (
                    <ul className="divide-y divide-fog">
                      {list.map((r) => (
                        <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-medium">{r.title}</span>
                              <Badge variant="outline">{t("security.version", { n: r.version })}</Badge>
                            </div>
                            {r.issued_at ? <div className="text-small text-slate">{t("security.issued", { date: formatDateTime(r.issued_at, locale) })}</div> : null}
                          </div>
                          <a href={`/api/files/reports/${r.id}`} className="touch inline-flex items-center gap-1 border border-fog px-3 text-small hover:bg-surface" rel="noopener">
                            <Download className="size-4" aria-hidden /> {tc("download")}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
