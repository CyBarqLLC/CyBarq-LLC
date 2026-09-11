import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/validation/tasks";
import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { getProject, assignableUsers } from "../../project-data";
import { TaskForm } from "../task-form";

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.tasks");
  const supabase = await createClient();
  const [assignees, { data: milestones }] = await Promise.all([
    assignableUsers(project),
    supabase.from("milestones").select("id, title_en, title_ar").eq("project_id", project.id).order("due_date", { ascending: true, nullsFirst: false }),
  ]);
  const base = `/app/projects/${project.id}/tasks`;
  const canSelf = assignees.some((a) => a.id === viewer.userId);

  return (
    <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2">{t("new")}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={base}>{t("back")}</Link>
        </Button>
      </div>
      <TaskForm
        mode="create"
        projectId={project.id}
        action={createTask.bind(null, project.id)}
        defaults={{ title: "", description: null, status: "todo", priority: "medium", assignee_user_id: canSelf ? viewer.userId : null, milestone_id: null, due_date: null }}
        assignees={assignees.map((a) => ({ value: a.id, label: personName(a, locale) }))}
        milestones={(milestones ?? []).map((m) => ({ value: m.id, label: pick(m, "title", locale) }))}
        statuses={enumOptions(TASK_STATUS_LABELS, locale, TASK_STATUSES)}
        priorities={enumOptions(TASK_PRIORITY_LABELS, locale, TASK_PRIORITIES)}
      />
    </div>
  );
}
