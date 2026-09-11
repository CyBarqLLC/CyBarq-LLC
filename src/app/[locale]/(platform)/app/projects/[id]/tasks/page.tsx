import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { param, type SearchParams } from "@/lib/data/paginate";
import { label, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { isTaskStatus, TASK_STATUSES } from "@/lib/validation/tasks";
import { setTaskStatus } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { StatusSelectForm } from "@/components/platform/status-select-form";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { getProject } from "../project-data";

export default async function ProjectTasksPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  await requireEmployee();
  const { id } = await params;
  const sp = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.tasks");
  const supabase = await createClient();

  const statusParam = param(sp, "status");
  const status = isTaskStatus(statusParam) ? statusParam : statusParam === "all" ? "all" : "open";

  let query = supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, assignee:profiles!tasks_assignee_user_id_fkey(full_name, full_name_ar), milestone:milestones(title_en, title_ar)")
    .eq("project_id", project.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "open") query = query.in("status", ["todo", "in_progress", "review"]);
  else if (status !== "all") query = query.eq("status", status);

  const { data: rows } = await query;
  type Row = NonNullable<typeof rows>[number];
  const tasks: Row[] = rows ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const statusOptions = enumOptions(TASK_STATUS_LABELS, locale, TASK_STATUSES);
  const base = `/app/projects/${project.id}/tasks`;

  const columns: Column<Row>[] = [
    { key: "title", header: t("columns.title"), primary: true, cell: (r) => (
      <Link href={`${base}/${r.id}`} className="font-medium text-graphite hover:text-azure">{r.title}</Link>
    ) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(TASK_STATUS_LABELS, r.status, locale)} /> },
    { key: "priority", header: t("columns.priority"), cell: (r) => <Status value={r.priority} label={label(TASK_PRIORITY_LABELS, r.priority, locale)} /> },
    { key: "assignee", header: t("columns.assignee"), cell: (r) => personName(r.assignee, locale, t("fields.unassigned")) },
    { key: "due", header: t("columns.dueDate"), cell: (r) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        {formatDate(r.due_date, locale)}
        {r.due_date && r.due_date < today && r.status !== "done" && r.status !== "cancelled" ? <Badge variant="danger">{t("overdue")}</Badge> : null}
      </span>
    ) },
    { key: "quick", header: t("update"), hideOnCard: false, cell: (r) => (
      <StatusSelectForm
        action={setTaskStatus.bind(null, r.id)}
        name="status"
        options={statusOptions}
        defaultValue={r.status}
        submitLabel={t("update")}
        successMessage={t("statusSaved")}
        ariaLabel={t("fields.status")}
      />
    ) },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <FilterBar action={base} active={status !== "open"} className="mb-0 flex-1">
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
        <Button asChild>
          <Link href={`${base}/new`}>{t("new")}</Link>
        </Button>
      </div>
      <DataTable rows={tasks} columns={columns} rowKey={(r) => r.id} emptyTitle={t("empty")} emptyDescription={t("emptyHint")} caption={t("title")} />
    </>
  );
}
