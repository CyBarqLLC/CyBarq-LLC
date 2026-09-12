import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { label, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { TASK_STATUSES } from "@/lib/validation/tasks";
import { setTaskStatus, deleteTask, deleteTaskComment } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/platform/section-card";
import { DetailList } from "@/components/platform/detail-list";
import { Reference } from "@/components/platform/reference";
import { Person, personName } from "@/components/platform/person";
import { StatusSelectForm } from "@/components/platform/status-select-form";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { enumOptions } from "@/components/platform/enum-options";
import { getProject, canManageProject } from "../../project-data";
import { CommentForm, EditableComment } from "./comments";
import { businessToday } from "@/lib/time";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.tasks");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const viewer = await requireEmployee();
  const { id, taskId } = await params;
  const project = await getProject(id);
  if (!project || !UUID.test(taskId)) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.tasks");
  const tp = await getTranslations("projects");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  const [{ data: task }, { data: comments }] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, reference, title, description, status, priority, due_date, created_at, updated_at, assignee:profiles!tasks_assignee_user_id_fkey(id, full_name, full_name_ar, email, avatar_path), creator:profiles!tasks_created_by_fkey(full_name, full_name_ar), milestone:milestones(id, title_en, title_ar)",
      )
      .eq("id", taskId)
      .eq("project_id", project.id)
      .maybeSingle(),
    supabase
      .from("task_comments")
      .select("id, body, created_at, updated_at, author_id, author:profiles!task_comments_author_id_fkey(full_name, full_name_ar, email, avatar_path)")
      .eq("task_id", taskId)
      .order("created_at"),
  ]);
  if (!task) notFound();

  const manage = await canManageProject(viewer, project);
  const today = businessToday();
  const overdue = task.due_date !== null && task.due_date < today && task.status !== "done" && task.status !== "cancelled";
  const base = `/app/projects/${project.id}/tasks`;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={base} className="text-small text-slate hover:text-azure">{t("back")}</Link>
            <h2 className="mt-1 text-h2 break-words">{task.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Status value={task.status} label={label(TASK_STATUS_LABELS, task.status, locale)} />
              <Status value={task.priority} label={label(TASK_PRIORITY_LABELS, task.priority, locale)} />
              {overdue ? <Badge variant="danger">{t("overdue")}</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`${base}/${task.id}/edit`}>{t("edit")}</Link>
            </Button>
            {manage ? (
              <ConfirmAction
                action={deleteTask.bind(null, project.id, task.id)}
                title={t("deleteTitle")}
                description={t("deleteDescription")}
                confirmLabel={t("delete")}
                triggerLabel={t("delete")}
                triggerVariant="ghost"
                destructive
                redirectTo={base}
                successMessage={t("deleted")}
              />
            ) : null}
          </div>
        </div>

        <SectionCard title={t("fields.description")}>
          {task.description ? <p className="whitespace-pre-line text-body">{task.description}</p> : <p className="text-small text-slate">{tp("overview.noDescription")}</p>}
        </SectionCard>

        <SectionCard title={t("comments.title")}>
          {(comments ?? []).length === 0 ? <p className="text-small text-slate">{t("comments.empty")}</p> : null}
          <ul className="flex flex-col gap-3">
            {(comments ?? []).map((c) => {
              const own = c.author_id === viewer.userId;
              const edited = c.updated_at !== c.created_at;
              return (
                <EditableComment
                  key={c.id}
                  projectId={project.id}
                  taskId={task.id}
                  commentId={c.id}
                  body={c.body}
                  canEdit={own}
                  header={
                    <Person person={c.author} locale={locale} secondary={`${formatDateTime(c.created_at, locale)}${edited ? ` · ${t("comments.edited")}` : ""}`} />
                  }
                  deleteControl={own || viewer.can("projects.write") ? (
                    <ConfirmAction
                      action={deleteTaskComment.bind(null, project.id, task.id, c.id)}
                      title={t("comments.deleteTitle")}
                      confirmLabel={t("comments.delete")}
                      triggerLabel={t("comments.delete")}
                      triggerVariant="ghost"
                      destructive
                      successMessage={t("comments.deleted")}
                    />
                  ) : undefined}
                />
              );
            })}
          </ul>
          <div className="mt-6 border-t border-fog pt-5">
            <CommentForm projectId={project.id} taskId={task.id} />
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-col gap-6">
        <SectionCard title={t("fields.status")}>
          <StatusSelectForm
            action={setTaskStatus.bind(null, task.id)}
            name="status"
            options={enumOptions(TASK_STATUS_LABELS, locale, TASK_STATUSES)}
            defaultValue={task.status}
            submitLabel={t("update")}
            successMessage={t("statusSaved")}
            ariaLabel={t("fields.status")}
            className="flex flex-col gap-2"
          />
        </SectionCard>
        <SectionCard title={t("title")}>
          <DetailList
            columns={1}
            items={[
              { label: tc("reference"), value: <Reference value={task.reference} /> },
              { label: t("project"), value: <Link href={`/app/projects/${project.id}`} className="text-azure hover:underline">{pick(project, "name", locale)}</Link> },
              { label: t("fields.assignee"), value: task.assignee ? <Person person={task.assignee} locale={locale} /> : t("fields.unassigned") },
              { label: t("fields.milestone"), value: task.milestone ? pick(task.milestone, "title", locale) : t("fields.noMilestone") },
              { label: t("fields.dueDate"), value: formatDate(task.due_date, locale) },
              { label: t("createdBy"), value: personName(task.creator, locale) },
              { label: t("createdAt"), value: formatDateTime(task.created_at, locale) },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}
