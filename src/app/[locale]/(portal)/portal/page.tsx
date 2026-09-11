import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils/format";
import { PROJECT_STATUS_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { EmptyState } from "@/components/ui/states";

export default async function PortalOverviewPage() {
  const viewer = await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const supabase = await createClient();

  const [{ data: clients }, { data: projects }, { data: milestones }, { data: updates }, { count: openSupport }, { count: unpaid }] = await Promise.all([
    supabase.from("clients").select("id, name_en, name_ar").in("id", viewer.clientIds.length > 0 ? viewer.clientIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("projects").select("id, code, name_en, name_ar, status, end_date").in("status", ["active", "planned", "on_hold"]).order("updated_at", { ascending: false }).limit(6),
    supabase.from("milestones").select("id, project_id, title_en, title_ar, due_date, status").eq("client_visible", true).neq("status", "completed").order("due_date", { ascending: true, nullsFirst: false }).limit(100),
    supabase.from("project_updates").select("id, title, body, created_at, project:projects(id, code, name_en, name_ar)").eq("client_visible", true).order("created_at", { ascending: false }).limit(5),
    supabase.from("support_requests").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress", "waiting_client"]),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["issued", "sent", "partially_paid", "overdue"]),
  ]);

  const nextMilestone = new Map<string, { title: string; due_date: string | null }>();
  for (const m of milestones ?? []) {
    if (!nextMilestone.has(m.project_id)) nextMilestone.set(m.project_id, { title: pick(m, "title", locale), due_date: m.due_date });
  }
  const clientNames = (clients ?? []).map((c) => pick(c, "name", locale));
  const firstName = (locale === "ar" ? viewer.profile.full_name_ar || viewer.profile.full_name : viewer.profile.full_name).split(/\s+/)[0] ?? "";

  const tiles = [
    { key: "projects", value: (projects ?? []).length, href: "/portal/projects", label: t("overview.activeProjects") },
    { key: "support", value: openSupport ?? 0, href: "/portal/support", label: t("overview.openRequests") },
    { key: "invoices", value: unpaid ?? 0, href: "/portal/finance", label: t("overview.unpaidInvoices") },
  ];

  return (
    <div>
      <PageHeader
        title={t("overview.welcome", { name: firstName })}
        description={clientNames.length > 0 ? t("overview.clientLine", { clients: clientNames.join(locale === "ar" ? "، " : ", ") }) : t("overview.noClient")}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.key} className="relative">
            <CardContent className="flex flex-col gap-1">
              <span className="text-small text-slate">{tile.label}</span>
              <span className="text-h1 font-light">{formatNumber(tile.value, locale)}</span>
              <Link href={tile.href} className="mt-1 inline-flex items-center gap-1 text-small text-azure after:absolute after:inset-0 after:content-['']">
                {t("overview.open")} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("overview.projectsTitle")}</CardTitle>
            <Link href="/portal/projects" className="text-small text-azure hover:underline">{t("overview.viewAll")}</Link>
          </CardHeader>
          <CardContent className="p-0">
            {(projects ?? []).length === 0 ? (
              <EmptyState title={t("projects.empty")} description={t("projects.emptyDescription")} className="border-0" />
            ) : (
              <ul className="divide-y divide-fog">
                {(projects ?? []).map((p) => {
                  const next = nextMilestone.get(p.id);
                  return (
                    <li key={p.id} className="relative flex flex-col gap-1 px-5 py-4 hover:bg-surface/70">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href={`/portal/projects/${p.id}`} className="font-medium after:absolute after:inset-0 after:content-['']">
                          {pick(p, "name", locale)}
                        </Link>
                        <Status value={p.status} label={label(PROJECT_STATUS_LABELS, p.status, locale)} />
                      </div>
                      <div className="text-small text-slate">
                        {next ? t("overview.nextMilestone", { title: next.title, date: next.due_date ? formatDate(next.due_date, locale) : t("overview.noDate") }) : t("overview.noMilestone")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("overview.updatesTitle")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {(updates ?? []).length === 0 ? (
              <EmptyState title={t("overview.noUpdates")} className="border-0" />
            ) : (
              <ul className="divide-y divide-fog">
                {(updates ?? []).map((u) => (
                  <li key={u.id} className="flex flex-col gap-1 px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{u.title}</span>
                      <span className="text-small text-slate">{formatDateTime(u.created_at, locale)}</span>
                    </div>
                    {u.project ? (
                      <Link href={`/portal/projects/${u.project.id}`} className="text-small text-azure hover:underline">{pick(u.project, "name", locale)}</Link>
                    ) : null}
                    <p className="line-clamp-3 whitespace-pre-wrap text-small text-graphite">{u.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
