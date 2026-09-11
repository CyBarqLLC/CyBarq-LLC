"use server";

import { revalidatePath } from "next/cache";
import { requireEmployee, requirePermission, type Viewer } from "@/lib/auth/session";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { signedUploadUrl, safeFileName } from "@/lib/storage";
import { sendMail, mailLayout } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";
import { uuid } from "@/lib/validation/common";
import {
  projectSchema,
  projectStatusChangeSchema,
  projectMemberSchema,
  milestoneSchema,
  projectUpdateSchema,
  projectDocumentSchema,
  uploadRequestSchema,
} from "@/lib/validation/projects";
import type { UploadTicket } from "@/components/ui/file-upload";
import type { Enums } from "@/lib/supabase/database.types";

type ProjectRef = { id: string; name_en: string; name_ar: string | null; manager_user_id: string | null; status: Enums<"project_status"> };

/** Loads a project through the caller's RLS scoped client. Null when invisible or missing. */
async function loadProject(supabase: SupabaseServerClient, projectId: string): Promise<ProjectRef | null> {
  const { data } = await supabase.from("projects").select("id, name_en, name_ar, manager_user_id, status").eq("id", projectId).maybeSingle();
  return data;
}

/** projects.write, the project manager, or a member with the manager role. RLS enforces the same rule. */
async function canManage(supabase: SupabaseServerClient, viewer: Viewer, project: ProjectRef): Promise<boolean> {
  if (viewer.can("projects.write") || project.manager_user_id === viewer.userId) return true;
  const { data } = await supabase.from("project_members").select("role").eq("project_id", project.id).eq("user_id", viewer.userId).maybeSingle();
  return data?.role === "manager";
}

function revalidateProject(_projectId: string) {
  // Dynamic route patterns: all project pages share the [id] layout.
  revalidatePath("/[locale]/(platform)/app/projects", "page");
  revalidatePath("/[locale]/(platform)/app/projects/[id]", "layout");
  revalidatePath("/[locale]/(platform)/app/tasks", "page");
  revalidatePath("/[locale]/(platform)/app", "page");
}

function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProject(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("projects.write", "action");
    const input = projectSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        code: input.code,
        name_en: input.name_en,
        name_ar: emptyToNull(input.name_ar),
        client_id: emptyToNull(input.client_id),
        practice: input.practice,
        status: input.status,
        description: emptyToNull(input.description),
        manager_user_id: emptyToNull(input.manager_user_id),
        start_date: emptyToNull(input.start_date),
        end_date: emptyToNull(input.end_date),
        client_visible: input.client_visible,
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return fail("A project with this code already exists. Choose another code.", "CONFLICT");
      throw error;
    }
    revalidatePath("/[locale]/(platform)/app/projects", "page");
    return ok({ id: data.id });
  });
}

export async function updateProject(projectId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const input = projectSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase
      .from("projects")
      .update({
        code: input.code,
        name_en: input.name_en,
        name_ar: emptyToNull(input.name_ar),
        client_id: emptyToNull(input.client_id),
        practice: input.practice,
        description: emptyToNull(input.description),
        manager_user_id: emptyToNull(input.manager_user_id),
        start_date: emptyToNull(input.start_date),
        end_date: emptyToNull(input.end_date),
        client_visible: input.client_visible,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") return fail("A project with this code already exists. Choose another code.", "CONFLICT");
      throw error;
    }
    revalidateProject(id);
    return ok({ id });
  });
}

export async function setProjectStatus(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const { status } = projectStatusChangeSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

export async function setProjectClientVisibility(projectId: string, visible: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("projects").update({ client_visible: visible === true }).eq("id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

/** Only draft or cancelled projects can be deleted, and only with projects.write. */
export async function deleteProject(projectId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("projects.write", "action");
    const id = uuid.parse(projectId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (project.status !== "draft" && project.status !== "cancelled") {
      return fail("Only draft or cancelled projects can be deleted.", "CONFLICT");
    }
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/[locale]/(platform)/app/projects", "page");
    revalidatePath("/[locale]/(platform)/app", "page");
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function addProjectMember(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const input = projectMemberSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase
      .from("project_members")
      .upsert({ project_id: id, user_id: input.user_id, role: input.role, added_by: viewer.userId }, { onConflict: "project_id,user_id" });
    if (error) throw error;
    revalidateProject(id);
    if (input.user_id !== viewer.userId) await notifyProjectAssignment(supabase, input.user_id, project);
    return ok(undefined);
  });
}

export async function removeProjectMember(projectId: string, userId: string): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const member = uuid.parse(userId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("project_members").delete().eq("project_id", id).eq("user_id", member);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

/** Minimal email on project assignment. Mail failures never fail the action. */
async function notifyProjectAssignment(supabase: SupabaseServerClient, userId: string, project: ProjectRef): Promise<void> {
  try {
    const { data: profile } = await supabase.from("profiles").select("email, full_name, full_name_ar, locale").eq("id", userId).maybeSingle();
    if (!profile) return;
    const locale = profile.locale;
    const name = locale === "ar" ? project.name_ar || project.name_en : project.name_en;
    const link = `${publicEnv.NEXT_PUBLIC_SITE_URL}/${locale}/app/projects/${project.id}`;
    const subject = locale === "ar" ? `تمت إضافتك إلى مشروع: ${name}` : `You were added to a project: ${name}`;
    const body =
      locale === "ar"
        ? `<p>تمت إضافتك إلى المشروع <strong>${escapeHtml(name)}</strong>.</p><p><a href="${link}">فتح المشروع</a></p>`
        : `<p>You were added to the project <strong>${escapeHtml(name)}</strong>.</p><p><a href="${link}">Open the project</a></p>`;
    await sendMail({ to: profile.email, subject, html: mailLayout(subject, body, locale), text: `${subject}\n${link}` });
  } catch (error) {
    console.error("[mail] project assignment", error);
  }
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export async function createMilestone(projectId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const input = milestoneSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { data, error } = await supabase
      .from("milestones")
      .insert({
        project_id: id,
        title_en: input.title_en,
        title_ar: emptyToNull(input.title_ar),
        description: emptyToNull(input.description),
        due_date: emptyToNull(input.due_date),
        status: input.status,
        client_visible: input.client_visible,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidateProject(id);
    return ok({ id: data.id });
  });
}

export async function updateMilestone(projectId: string, milestoneId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const mid = uuid.parse(milestoneId);
    const input = milestoneSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase
      .from("milestones")
      .update({
        title_en: input.title_en,
        title_ar: emptyToNull(input.title_ar),
        description: emptyToNull(input.description),
        due_date: emptyToNull(input.due_date),
        status: input.status,
        client_visible: input.client_visible,
      })
      .eq("id", mid)
      .eq("project_id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok({ id: mid });
  });
}

export async function deleteMilestone(projectId: string, milestoneId: string): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const mid = uuid.parse(milestoneId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("milestones").delete().eq("id", mid).eq("project_id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

export async function createProjectUpdate(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const input = projectUpdateSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    const { error } = await supabase.from("project_updates").insert({
      project_id: id,
      title: input.title,
      body: input.body,
      client_visible: input.client_visible,
      author_id: viewer.userId,
    });
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

export async function deleteProjectUpdate(projectId: string, updateId: string): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const uid = uuid.parse(updateId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("project_updates").delete().eq("id", uid).eq("project_id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Documents (two step upload: ticket, then metadata row)
// ---------------------------------------------------------------------------

export async function requestProjectDocumentUpload(projectId: string, file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    await requireEmployee();
    const id = uuid.parse(projectId);
    const input = uploadRequestSchema.parse(file);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    const path = `${id}/${crypto.randomUUID()}-${safeFileName(input.name)}`;
    const ticket = await signedUploadUrl("private-project-documents", path);
    return ok(ticket);
  });
}

export async function registerProjectDocument(input: {
  projectId: string;
  path: string;
  title: string;
  category?: string;
  size: number;
  mime?: string;
  client_visible?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const parsed = projectDocumentSchema.parse(input);
    const supabase = await createClient();
    const project = await loadProject(supabase, parsed.projectId);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!parsed.path.startsWith(`${parsed.projectId}/`)) return fail("Invalid file path.", "VALIDATION");
    const { data, error } = await supabase
      .from("project_documents")
      .insert({
        project_id: parsed.projectId,
        title: parsed.title,
        category: parsed.category,
        storage_path: parsed.path,
        size_bytes: parsed.size,
        mime_type: parsed.mime ?? null,
        client_visible: parsed.client_visible,
        uploaded_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidateProject(parsed.projectId);
    return ok({ id: data.id });
  });
}

export async function deleteProjectDocument(projectId: string, documentId: string): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireEmployee();
    const id = uuid.parse(projectId);
    const did = uuid.parse(documentId);
    const supabase = await createClient();
    const project = await loadProject(supabase, id);
    if (!project) return fail("Not found.", "NOT_FOUND");
    if (!(await canManage(supabase, viewer, project))) return fail("You do not have permission to do this.", "FORBIDDEN");
    const { error } = await supabase.from("project_documents").delete().eq("id", did).eq("project_id", id);
    if (error) throw error;
    revalidateProject(id);
    return ok(undefined);
  });
}
