import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/validation/tasks";
import { updateTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { getProject, assignableUsers } from "../../../project-data";
import { TaskForm } from "../../task-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditTaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  await requireEmployee();
  const { id, taskId } = await params;
  const project = await getProject(id);
  if (!project || !UUID.test(taskId)) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.tasks");
  const supabase = await createClient();
  const [{ data: task }, assignees, { data: milestones }] = await Promise.all([
    supabase.from("tasks").select("id, title, description, status, priority, assignee_user_id, milestone_id, due_date").eq("id", taskId).eq("project_id", project.id).maybeSingle(),
    assignableUsers(project),
    supabase.from("milestones").select("id, title_en, title_ar").eq("project_id", project.id).order("due_date", { ascending: true, nullsFirst: false }),
  ]);
  if (!task) notFound();

  // Keep the current assignee selectable even if they left the project.
  const options = assignees.map((a) => ({ value: a.id, label: personName(a, locale) }));
  if (task.assignee_user_id && !options.some((o) => o.value === task.assignee_user_id)) {
    const { data: current } = await supabase.from("profiles").select("id, full_name, full_name_ar, email").eq("id", task.assignee_user_id).maybeSingle();
    if (current) options.push({ value: current.id, label: personName(current, locale) });
  }

  return (
    <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2">{t("edit")}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/projects/${project.id}/tasks/${task.id}`}>{t("back")}</Link>
        </Button>
      </div>
      <TaskForm
        mode="edit"
        projectId={project.id}
        action={updateTask.bind(null, project.id, task.id)}
        defaults={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee_user_id: task.assignee_user_id,
          milestone_id: task.milestone_id,
          due_date: task.due_date,
        }}
        assignees={options}
        milestones={(milestones ?? []).map((m) => ({ value: m.id, label: pick(m, "title", locale) }))}
        statuses={enumOptions(TASK_STATUS_LABELS, locale, TASK_STATUSES)}
        priorities={enumOptions(TASK_PRIORITY_LABELS, locale, TASK_PRIORITIES)}
      />
    </div>
  );
}
