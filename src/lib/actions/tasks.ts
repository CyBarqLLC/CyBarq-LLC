"use server";

import { revalidatePath } from "next/cache";
import { requireEmployee } from "@/lib/auth/session";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { sendMail, mailLayout } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";
import { uuid } from "@/lib/validation/common";
import { taskSchema, taskStatusSchema, commentSchema } from "@/lib/validation/tasks";

function revalidateTask(_projectId: string, _taskId?: string) {
  // Dynamic route patterns: the project layout covers task lists and task pages.
  revalidatePath("/[locale]/(platform)/app/tasks", "page");
  revalidatePath("/[locale]/(platform)/app", "page");
  revalidatePath("/[locale]/(platform)/app/projects/[id]", "layout");
}

function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

function invalidAssignee(): ActionResult<never> {
  return { ok: false, error: "Some fields need attention.", fieldErrors: { assignee_user_id: ["The assignee must be a member of the project."] }, code: "VALIDATION" };
}

async function projectVisible(supabase: SupabaseServerClient, projectId: string): Promise<{ id: string; name_en: string; name_ar: string | null } | null> {
  const { data } = await supabase.from("projects").select("id, name_en, name_ar").eq("id", projectId).maybeSingle();
  return data;
}

/** The assignee must be a member or the manager of the project, so tasks never point outside the team. */
async function assigneeAllowed(supabase: SupabaseServerClient, projectId: string, userId: string): Promise<boolean> {
  const [{ data: member }, { data: project }] = await Promise.all([
    supabase.from("project_members").select("user_id").eq("project_id", projectId).eq("user_id", userId).maybeSingle(),
    supabase.from("projects").select("manager_user_id").eq("id", projectId).maybeSingle(),
  ]);
  return Boolean(member) || project?.manager_user_id === userId;
}

export async function createTask(projectId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const pid = uuid.parse(projectId);
    const input = taskSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await projectVisible(supabase, pid);
    if (!project) return fail("Not found.", "NOT_FOUND");
    const assignee = emptyToNull(input.assignee_user_id);
    if (assignee && !(await assigneeAllowed(supabase, pid, assignee))) {
      return invalidAssignee();
    }
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: pid,
        title: input.title,
        description: emptyToNull(input.description),
        status: input.status,
        priority: input.priority,
        assignee_user_id: assignee,
        milestone_id: emptyToNull(input.milestone_id),
        due_date: emptyToNull(input.due_date),
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidateTask(pid, data.id);
    if (assignee && assignee !== viewer.userId) await notifyTaskAssignment(supabase, assignee, { id: data.id, title: input.title, projectId: pid });
    return ok({ id: data.id });
  });
}

export async function updateTask(projectId: string, taskId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const pid = uuid.parse(projectId);
    const tid = uuid.parse(taskId);
    const input = taskSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data: existing } = await supabase.from("tasks").select("id, assignee_user_id").eq("id", tid).eq("project_id", pid).maybeSingle();
    if (!existing) return fail("Not found.", "NOT_FOUND");
    const assignee = emptyToNull(input.assignee_user_id);
    if (assignee && assignee !== existing.assignee_user_id && !(await assigneeAllowed(supabase, pid, assignee))) {
      return invalidAssignee();
    }
    const { error } = await supabase
      .from("tasks")
      .update({
        title: input.title,
        description: emptyToNull(input.description),
        status: input.status,
        priority: input.priority,
        assignee_user_id: assignee,
        milestone_id: emptyToNull(input.milestone_id),
        due_date: emptyToNull(input.due_date),
      })
      .eq("id", tid)
      .eq("project_id", pid);
    if (error) throw error;
    revalidateTask(pid, tid);
    if (assignee && assignee !== existing.assignee_user_id && assignee !== viewer.userId) {
      await notifyTaskAssignment(supabase, assignee, { id: tid, title: input.title, projectId: pid });
    }
    return ok({ id: tid });
  });
}

/** Quick status change from the task list. */
export async function setTaskStatus(taskId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireEmployee();
    const tid = uuid.parse(taskId);
    const { status } = taskStatusSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data: existing } = await supabase.from("tasks").select("id, project_id").eq("id", tid).maybeSingle();
    if (!existing) return fail("Not found.", "NOT_FOUND");
    const { error } = await supabase.from("tasks").update({ status }).eq("id", tid);
    if (error) throw error;
    revalidateTask(existing.project_id, tid);
    return ok(undefined);
  });
}

export async function deleteTask(projectId: string, taskId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireEmployee();
    const pid = uuid.parse(projectId);
    const tid = uuid.parse(taskId);
    const supabase = await createClient();
    // RLS: projects.write or a managed project. A silent no-op means forbidden or missing.
    const { data, error } = await supabase.from("tasks").delete().eq("id", tid).eq("project_id", pid).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("You do not have permission to do this.", "FORBIDDEN");
    revalidateTask(pid);
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export async function addTaskComment(projectId: string, taskId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const pid = uuid.parse(projectId);
    const tid = uuid.parse(taskId);
    const { body } = commentSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data: task } = await supabase.from("tasks").select("id").eq("id", tid).eq("project_id", pid).maybeSingle();
    if (!task) return fail("Not found.", "NOT_FOUND");
    const { error } = await supabase.from("task_comments").insert({ task_id: tid, author_id: viewer.userId, body });
    if (error) throw error;
    revalidateTask(pid, tid);
    return ok(undefined);
  });
}

export async function updateTaskComment(projectId: string, taskId: string, commentId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const pid = uuid.parse(projectId);
    const tid = uuid.parse(taskId);
    const cid = uuid.parse(commentId);
    const { body } = commentSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("task_comments").update({ body }).eq("id", cid).eq("task_id", tid).eq("author_id", viewer.userId).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("You can only edit your own comments.", "FORBIDDEN");
    revalidateTask(pid, tid);
    return ok(undefined);
  });
}

export async function deleteTaskComment(projectId: string, taskId: string, commentId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireEmployee();
    const pid = uuid.parse(projectId);
    const tid = uuid.parse(taskId);
    const cid = uuid.parse(commentId);
    const supabase = await createClient();
    // RLS: own comments, or projects.write.
    const { data, error } = await supabase.from("task_comments").delete().eq("id", cid).eq("task_id", tid).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("You can only delete your own comments.", "FORBIDDEN");
    revalidateTask(pid, tid);
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Mail
// ---------------------------------------------------------------------------

async function notifyTaskAssignment(supabase: SupabaseServerClient, userId: string, task: { id: string; title: string; projectId: string }): Promise<void> {
  try {
    const { data: profile } = await supabase.from("profiles").select("email, locale").eq("id", userId).maybeSingle();
    if (!profile) return;
    const locale = profile.locale;
    const link = `${publicEnv.NEXT_PUBLIC_SITE_URL}/${locale}/app/projects/${task.projectId}/tasks/${task.id}`;
    const subject = locale === "ar" ? `تم إسناد مهمة إليك: ${task.title}` : `You were assigned a task: ${task.title}`;
    const safeTitle = task.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const body =
      locale === "ar"
        ? `<p>تم إسناد المهمة <strong>${safeTitle}</strong> إليك.</p><p><a href="${link}">فتح المهمة</a></p>`
        : `<p>The task <strong>${safeTitle}</strong> was assigned to you.</p><p><a href="${link}">Open the task</a></p>`;
    await sendMail({ to: profile.email, subject, html: mailLayout(subject, body, locale), text: `${subject}\n${link}` });
  } catch (error) {
    console.error("[mail] task assignment", error);
  }
}
