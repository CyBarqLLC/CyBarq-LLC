import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { label, TASK_PRIORITY_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { KpiTile } from "@/components/platform/kpi-tile";
import { SectionCard } from "@/components/platform/section-card";
import { ActivityList } from "@/components/platform/activity-list";
import { personName } from "@/components/platform/person";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.dashboard");
  return { title: t("title"), robots: { index: false, follow: false } };
}

const OPEN = ["todo", "in_progress", "review"] as const;

export default async function DashboardPage() {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.dashboard");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const me = viewer.userId;

  const canContent = viewer.can("content.publish");
  const canFinance = viewer.can("finance.read");
  const canClients = viewer.can("clients.read");

  const [
    { data: myTasks },
    { data: attention },
    { data: activity },
    { data: notifications },
    { count: openCount },
    { count: activeProjects },
    { count: unread },
    gated,
    reviewNews,
    reviewArticles,
    draftQuotes,
    draftInvoices,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, project_id, title, priority, due_date, project:projects!inner(name_en, name_ar)")
      .eq("assignee_user_id", me)
      .in("status", OPEN)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: false })
      .limit(8),
    // One query: active projects with their overdue tasks, overdue milestones and my membership row embedded.
    supabase
      .from("projects")
      .select("id, code, name_en, name_ar, manager_user_id, tasks(id), milestones(id), project_members(user_id)")
      .eq("status", "active")
      .lt("tasks.due_date", today)
      .in("tasks.status", OPEN)
      .lt("milestones.due_date", today)
      .neq("milestones.status", "completed")
      .eq("project_members.user_id", me)
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("activity")
      .select("id, project_id, entity_type, entity_id, action, metadata, created_at, actor:profiles!activity_actor_id_fkey(full_name, full_name_ar), project:projects(name_en, name_ar)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("notifications").select("id, title_en, title_ar, body_en, body_ar, link, created_at").eq("user_id", me).is("read_at", null).order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assignee_user_id", me).in("status", OPEN),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", me).is("read_at", null),
    canFinance
      ? supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "overdue")
      : canClients
        ? supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active")
        : Promise.resolve({ count: null }),
    canContent ? supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "review") : Promise.resolve({ count: null }),
    canContent ? supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "review") : Promise.resolve({ count: null }),
    canFinance ? supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "draft") : Promise.resolve({ count: null }),
    canFinance ? supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "draft") : Promise.resolve({ count: null }),
  ]);

  const needsAttention = (attention ?? [])
    .filter((p) => p.manager_user_id === me || p.project_members.length > 0)
    .filter((p) => p.tasks.length > 0 || p.milestones.length > 0);

  const approvals: { label: string; count: number; href: string }[] = [];
  if (canContent) approvals.push({ label: t("approvals.contentReview"), count: (reviewNews.count ?? 0) + (reviewArticles.count ?? 0), href: "/app/content" });
  if (canFinance) {
    approvals.push({ label: t("approvals.draftQuotes"), count: draftQuotes.count ?? 0, href: "/app/finance/quotes" });
    approvals.push({ label: t("approvals.draftInvoices"), count: draftInvoices.count ?? 0, href: "/app/finance/invoices" });
  }
  const showApprovals = canContent || canFinance;

  const name = personName(viewer.profile, locale, viewer.email);

  return (
    <>
      <PageHeader title={t("greeting", { name })} description={t("description")} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiTile label={t("kpi.myOpenTasks")} value={formatNumber(openCount ?? 0, locale)} href="/app/tasks" />
        <KpiTile label={t("kpi.activeProjects")} value={formatNumber(activeProjects ?? 0, locale)} href="/app/projects?status=active" />
        <KpiTile label={t("kpi.unread")} value={formatNumber(unread ?? 0, locale)} href="/app/notifications" />
        {canFinance ? (
          <KpiTile label={t("kpi.overdueInvoices")} value={formatNumber(gated.count ?? 0, locale)} href="/app/finance/invoices?status=overdue" />
        ) : canClients ? (
          <KpiTile label={t("kpi.activeClients")} value={formatNumber(gated.count ?? 0, locale)} href="/app/clients?status=active" />
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <SectionCard
            title={t("myWork.title")}
            description={t("myWork.description")}
            flush
            actions={
              <Button asChild variant="link" size="sm">
                <Link href="/app/tasks">{t("myWork.viewAll")}</Link>
              </Button>
            }
          >
            {(myTasks ?? []).length === 0 ? (
              <p className="px-4 py-6 text-center text-small text-slate">{t("myWork.empty")}</p>
            ) : (
              <ul className="divide-y divide-fog">
                {(myTasks ?? []).map((task) => {
                  const overdue = task.due_date !== null && task.due_date < today;
                  const isToday = task.due_date === today;
                  return (
                    <li key={task.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <Link href={`/app/projects/${task.project_id}/tasks/${task.id}`} className="block truncate text-body font-medium text-graphite hover:text-azure">
                          {task.title}
                        </Link>
                        <span className="block truncate text-small text-slate">{pick(task.project, "name", locale)}</span>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 text-small">
                        <Status value={task.priority} label={label(TASK_PRIORITY_LABELS, task.priority, locale)} />
                        {overdue ? (
                          <Badge variant="danger">{t("myWork.overdue")} · {formatDate(task.due_date, locale)}</Badge>
                        ) : isToday ? (
                          <Badge variant="warning">{t("myWork.today")}</Badge>
                        ) : task.due_date ? (
                          <span className="text-slate">{formatDate(task.due_date, locale)}</span>
                        ) : (
                          <span className="text-slate">{t("myWork.noDate")}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={t("attention.title")} description={t("attention.description")} flush>
            {needsAttention.length === 0 ? (
              <p className="px-4 py-6 text-center text-small text-slate">{t("attention.empty")}</p>
            ) : (
              <ul className="divide-y divide-fog">
                {needsAttention.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <Link href={`/app/projects/${p.id}`} className="min-w-0 truncate text-body font-medium text-graphite hover:text-azure">
                      {pick(p, "name", locale)} <span className="font-normal text-slate">{p.code}</span>
                    </Link>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {p.tasks.length > 0 ? <Badge variant="danger">{t("attention.overdueTasks", { count: p.tasks.length })}</Badge> : null}
                      {p.milestones.length > 0 ? <Badge variant="warning">{t("attention.overdueMilestones", { count: p.milestones.length })}</Badge> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={t("activity.title")} flush>
            <ActivityList rows={activity ?? []} locale={locale} showProject emptyText={t("activity.empty")} />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          {showApprovals ? (
            <SectionCard title={t("approvals.title")} flush>
              {approvals.every((a) => a.count === 0) ? (
                <p className="px-4 py-6 text-center text-small text-slate">{t("approvals.empty")}</p>
              ) : (
                <ul className="divide-y divide-fog">
                  {approvals.map((a) => (
                    <li key={a.label}>
                      <Link href={a.href} className="flex items-center justify-between gap-4 px-4 py-3 text-body hover:bg-surface">
                        <span>{a.label}</span>
                        <span className="tabular-nums font-medium">{formatNumber(a.count, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}

          <SectionCard
            title={t("notifications.title")}
            flush
            actions={
              <Button asChild variant="link" size="sm">
                <Link href="/app/notifications">{t("notifications.viewAll")}</Link>
              </Button>
            }
          >
            {(notifications ?? []).length === 0 ? (
              <p className="px-4 py-6 text-center text-small text-slate">{t("notifications.empty")}</p>
            ) : (
              <ul className="divide-y divide-fog">
                {(notifications ?? []).map((n) => {
                  const title = locale === "ar" ? n.title_ar : n.title_en;
                  const body = locale === "ar" ? n.body_ar : n.body_en;
                  const inner = (
                    <>
                      <span className="block text-body text-graphite">{title}</span>
                      {body ? <span className="block truncate text-small text-slate">{body}</span> : null}
                      <span className="block text-label text-slate">{formatDate(n.created_at, locale)}</span>
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link href={n.link} className="block px-4 py-3 hover:bg-surface">{inner}</Link>
                      ) : (
                        <div className="px-4 py-3">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
