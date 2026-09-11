"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { signedUploadUrl, safeFileName } from "@/lib/storage";
import { audit } from "@/lib/audit";
import { uuid } from "@/lib/validation/common";
import {
  createEmployeeSchema,
  employeeFieldsSchema,
  departmentSchema,
  teamSchema,
  teamMemberSchema,
  employeeDocumentSchema,
  hrUploadRequestSchema,
  type EmployeeInput,
} from "@/lib/validation/employees";
import type { UploadTicket } from "@/components/ui/file-upload";

function revalidateEmployees(_userId?: string) {
  revalidatePath("/[locale]/(platform)/app/employees", "layout");
}

function toRow(input: EmployeeInput) {
  const n = (v: string | undefined) => (v === undefined || v === "" ? null : v);
  return {
    employee_no: n(input.employee_no),
    department_id: n(input.department_id),
    job_title_en: input.job_title_en,
    job_title_ar: n(input.job_title_ar),
    employment_status: input.employment_status,
    start_date: n(input.start_date),
    end_date: n(input.end_date),
    work_phone: n(input.work_phone),
    work_email: n(input.work_email),
    emergency_contact_name: n(input.emergency_contact_name),
    emergency_contact_phone: n(input.emergency_contact_phone),
    notes: n(input.notes),
  };
}

// ---------------------------------------------------------------------------
// Employee records
// ---------------------------------------------------------------------------

export async function createEmployee(_prev: ActionResult<{ userId: string }> | null, formData: FormData): Promise<ActionResult<{ userId: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const input = createEmployeeSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("id, kind").eq("id", input.user_id).maybeSingle();
    if (!profile || profile.kind !== "employee") return fail("Choose an employee account.", "VALIDATION");
    const { error } = await supabase.from("employees").insert({ user_id: input.user_id, ...toRow(input) });
    if (error) {
      if (error.code === "23505") return fail("An employee record already exists for this account or employee number.", "CONFLICT");
      throw error;
    }
    revalidateEmployees(input.user_id);
    return ok({ userId: input.user_id });
  });
}

export async function updateEmployee(userId: string, _prev: ActionResult<{ userId: string }> | null, formData: FormData): Promise<ActionResult<{ userId: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const uid = uuid.parse(userId);
    const input = employeeFieldsSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("employees").update(toRow(input)).eq("user_id", uid).select("user_id");
    if (error) {
      if (error.code === "23505") return fail("This employee number is already in use.", "CONFLICT");
      throw error;
    }
    if (!data || data.length === 0) return fail("Not found.", "NOT_FOUND");
    revalidateEmployees(uid);
    return ok({ userId: uid });
  });
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export async function createDepartment(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const input = departmentSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("departments").insert(input).select("id").single();
    if (error) throw error;
    revalidateEmployees();
    return ok({ id: data.id });
  });
}

export async function updateDepartment(departmentId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(departmentId);
    const input = departmentSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("departments").update(input).eq("id", id);
    if (error) throw error;
    revalidateEmployees();
    return ok({ id });
  });
}

export async function deleteDepartment(departmentId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(departmentId);
    const supabase = await createClient();
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw error;
    revalidateEmployees();
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function createTeam(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const input = teamSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("teams")
      .insert({ name_en: input.name_en, name_ar: input.name_ar, department_id: input.department_id ?? null, lead_user_id: input.lead_user_id ?? null })
      .select("id")
      .single();
    if (error) throw error;
    revalidateEmployees();
    return ok({ id: data.id });
  });
}

export async function updateTeam(teamId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(teamId);
    const input = teamSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { error } = await supabase
      .from("teams")
      .update({ name_en: input.name_en, name_ar: input.name_ar, department_id: input.department_id ?? null, lead_user_id: input.lead_user_id ?? null })
      .eq("id", id);
    if (error) throw error;
    revalidateEmployees();
    revalidatePath("/[locale]/(platform)/app/employees/teams/[id]", "page");
    return ok({ id });
  });
}

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(teamId);
    const supabase = await createClient();
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) throw error;
    revalidateEmployees();
    return ok(undefined);
  });
}

export async function addTeamMember(teamId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(teamId);
    const input = teamMemberSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").upsert({ team_id: id, user_id: input.user_id }, { onConflict: "team_id,user_id", ignoreDuplicates: true });
    if (error) throw error;
    revalidateEmployees();
    revalidatePath("/[locale]/(platform)/app/employees/teams/[id]", "page");
    return ok(undefined);
  });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const id = uuid.parse(teamId);
    const uid = uuid.parse(userId);
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").delete().eq("team_id", id).eq("user_id", uid);
    if (error) throw error;
    revalidateEmployees();
    revalidatePath("/[locale]/(platform)/app/employees/teams/[id]", "page");
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// HR documents (private-hr-documents, <employee_user_id>/<uuid>-<name>)
// ---------------------------------------------------------------------------

export async function requestEmployeeDocumentUpload(employeeUserId: string, file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const uid = uuid.parse(employeeUserId);
    const input = hrUploadRequestSchema.parse(file);
    const supabase = await createClient();
    const { data: employee } = await supabase.from("employees").select("user_id").eq("user_id", uid).maybeSingle();
    if (!employee) return fail("Not found.", "NOT_FOUND");
    const path = `${uid}/${crypto.randomUUID()}-${safeFileName(input.name)}`;
    const ticket = await signedUploadUrl("private-hr-documents", path);
    return ok(ticket);
  });
}

export async function registerEmployeeDocument(input: { employeeUserId: string; path: string; title: string; kind?: string; size: number; mime?: string }): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("hr.write", "action");
    const parsed = employeeDocumentSchema.parse(input);
    if (!parsed.path.startsWith(`${parsed.employeeUserId}/`)) return fail("Invalid file path.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("employee_documents")
      .insert({
        employee_user_id: parsed.employeeUserId,
        kind: parsed.kind,
        title: parsed.title,
        storage_path: parsed.path,
        size_bytes: parsed.size,
        mime_type: parsed.mime ?? null,
        uploaded_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await audit("hr_document.uploaded", "employee_documents", data.id, { employee_user_id: parsed.employeeUserId, kind: parsed.kind });
    revalidateEmployees(parsed.employeeUserId);
    return ok({ id: data.id });
  });
}

export async function deleteEmployeeDocument(employeeUserId: string, documentId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("hr.write", "action");
    const uid = uuid.parse(employeeUserId);
    const did = uuid.parse(documentId);
    const supabase = await createClient();
    const { error } = await supabase.from("employee_documents").delete().eq("id", did).eq("employee_user_id", uid);
    if (error) throw error;
    await audit("hr_document.deleted", "employee_documents", did, { employee_user_id: uid });
    revalidateEmployees(uid);
    return ok(undefined);
  });
}
