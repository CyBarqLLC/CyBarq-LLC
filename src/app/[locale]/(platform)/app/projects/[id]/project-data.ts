import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/auth/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads one project (RLS scoped) once per request; shared by the layout and every tab. */
export const getProject = cache(async (id: string) => {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "id, code, name_en, name_ar, practice, status, description, start_date, end_date, client_visible, manager_user_id, created_at, updated_at, client:clients(id, name_en, name_ar), manager:profiles!projects_manager_user_id_fkey(id, full_name, full_name_ar, email, avatar_path), creator:profiles!projects_created_by_fkey(full_name, full_name_ar)",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
});

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProject>>>;

/** Members with their profile, once per request. */
export const getProjectMembers = cache(async (projectId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("user_id, role, created_at, profile:profiles!project_members_user_id_fkey(id, full_name, full_name_ar, email, avatar_path)")
    .eq("project_id", projectId)
    .order("created_at");
  return data ?? [];
});

export type ProjectMember = Awaited<ReturnType<typeof getProjectMembers>>[number];

/** projects.write, the project's manager, or a member with the manager role. */
export async function canManageProject(viewer: Viewer, project: { id: string; manager_user_id: string | null }): Promise<boolean> {
  if (viewer.can("projects.write") || project.manager_user_id === viewer.userId) return true;
  const members = await getProjectMembers(project.id);
  return members.some((m) => m.user_id === viewer.userId && m.role === "manager");
}

/** People a task can be assigned to: members plus the manager. */
export async function assignableUsers(project: ProjectDetail): Promise<{ id: string; full_name: string; full_name_ar: string | null; email: string }[]> {
  const members = await getProjectMembers(project.id);
  const list = members.flatMap((m) => (m.profile ? [{ id: m.profile.id, full_name: m.profile.full_name, full_name_ar: m.profile.full_name_ar, email: m.profile.email }] : []));
  if (project.manager && !list.some((p) => p.id === project.manager?.id)) {
    list.unshift({ id: project.manager.id, full_name: project.manager.full_name, full_name_ar: project.manager.full_name_ar, email: project.manager.email });
  }
  return list;
}
