import "server-only";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { ClientOption, EmployeeOption, ProjectOption } from "./engagement-form";

/** Reference lists for the engagement form. Every query is RLS scoped to the viewer. */
export async function loadEngagementFormOptions(supabase: SupabaseServerClient): Promise<{ clients: ClientOption[]; projects: ProjectOption[]; employees: EmployeeOption[] }> {
  const [{ data: clients }, { data: projects }, { data: directory }] = await Promise.all([
    supabase.from("clients").select("id, name_en, name_ar").order("name_en"),
    supabase.from("projects").select("id, code, name_en, name_ar, client_id").neq("status", "cancelled").order("code"),
    supabase.from("employee_directory").select("user_id, full_name, full_name_ar, job_title_en, job_title_ar").order("full_name"),
  ]);
  return {
    clients: clients ?? [],
    projects: projects ?? [],
    employees: (directory ?? []).flatMap((e) =>
      e.user_id && e.full_name ? [{ user_id: e.user_id, full_name: e.full_name, full_name_ar: e.full_name_ar, job_title_en: e.job_title_en, job_title_ar: e.job_title_ar }] : [],
    ),
  };
}

export async function loadEmployees(supabase: SupabaseServerClient): Promise<EmployeeOption[]> {
  const { data } = await supabase.from("employee_directory").select("user_id, full_name, full_name_ar, job_title_en, job_title_ar").order("full_name");
  return (data ?? []).flatMap((e) =>
    e.user_id && e.full_name ? [{ user_id: e.user_id, full_name: e.full_name, full_name_ar: e.full_name_ar, job_title_en: e.job_title_en, job_title_ar: e.job_title_ar }] : [],
  );
}
