import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { param, type SearchParams } from "@/lib/data/paginate";
import { label, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { isTaskStatus, TASK_STATUSES } from "@/lib/validation/tasks";
import { setTaskStatus } from "@/lib/actions/tasks";
import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { EmptyState } from "@/components/ui/states";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { StatusSelectForm } from "@/components/platform/status-select-form";
import { enumOptions } from "@/components/platform/enum-options";
import { addDays, businessToday } from "@/lib/time";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.myTasks");
  return { title: t("title"), robots: { index: false, follow: false } };
}

type Group = "overdue" | "dueToday" | "thisWeek" | "later" | "noDate";

function groupOf(due: string | null, today: string, weekEnd: string): Group {
  if (!due) return "noDate";
  if (due < today) return "overdue";
  if (due === today) return "dueToday";
  if (due <= weekEnd) return "thisWeek";
  return "later";
}

export default async function MyTasksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.myTasks");
  const tt = await getTranslations("projects.tasks");
  const supabase = await createClient();

  const statusParam = param(sp, "status");
  const status = isTaskStatus(statusParam) ? statusParam : statusParam === "all" ? "all" : "open";

  let query = supabase
    .from("tasks")
    .select("id, project_id, title, status, priority, due_date, project:projects!inner(id, code, name_en, name_ar)")
    .eq("assignee_user_id", viewer.userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: false })
    .limit(200);
  if (status === "open") query = query.in("status", ["todo", "in_progress", "review"]);
  else if (status !== "all") query = query.eq("status", status);
  const { data: rows } = await query;
  type Row = NonNullable<typeof rows>[number];
  const tasks: Row[] = rows ?? [];

  const now = new Date();
  const today = businessToday(now);
  const weekEnd = addDays(today, 7);
  const groups: Record<Group, Row[]> = { overdue: [], dueToday: [], thisWeek: [], later: [], noDate: [] };
  for (const task of tasks) groups[groupOf(task.due_date, today, weekEnd)].push(task);
  const order: Group[] = ["overdue", "dueToday", "thisWeek", "later", "noDate"];
  const statusOptions = enumOptions(TASK_STATUS_LABELS, locale, TASK_STATUSES);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <FilterBar action="/app/tasks" active={status !== "open"}>
        <FilterField label={t("filter")} htmlFor="status">
          <NativeSelect id="status" name="status" defaultValue={status}>
            <option value="open">{t("open")}</option>
            <option value="all">{t("all")}</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </FilterField>
      </FilterBar>
      {tasks.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-8">
          {order.map((g) =>
            groups[g].length === 0 ? null : (
              <section key={g} aria-labelledby={`group-${g}`}>
                <h2 id={`group-${g}`} className={`mb-3 text-label ${g === "overdue" ? "text-danger" : "text-slate"}`}>
                  {t(g)} <span className="text-slate">({groups[g].length})</span>
                </h2>
                <ul className="flex flex-col gap-2">
                  {groups[g].map((task) => (
                    <li key={task.id} className="flex flex-col gap-3 border border-fog bg-white p-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <Link href={`/app/projects/${task.project_id}/tasks/${task.id}`} className="block truncate text-body font-medium text-graphite hover:text-azure">
                          {task.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-small text-slate">
                          <Link href={`/app/projects/${task.project_id}`} className="hover:text-azure">{pick(task.project, "name", locale)}</Link>
                          <span aria-hidden>·</span>
                          <span>{task.due_date ? formatDate(task.due_date, locale) : t("noDate")}</span>
                          <Status value={task.priority} label={label(TASK_PRIORITY_LABELS, task.priority, locale)} />
                          <Status value={task.status} label={label(TASK_STATUS_LABELS, task.status, locale)} />
                        </div>
                      </div>
                      <StatusSelectForm
                        action={setTaskStatus.bind(null, task.id)}
                        name="status"
                        options={statusOptions}
                        defaultValue={task.status}
                        submitLabel={tt("update")}
                        successMessage={tt("statusSaved")}
                        ariaLabel={tt("fields.status")}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </>
  );
}
