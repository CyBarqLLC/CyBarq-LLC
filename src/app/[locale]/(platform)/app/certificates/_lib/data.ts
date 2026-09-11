import "server-only";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { CERTIFICATE_TYPES } from "@/lib/validation/certificates";

/** Today's date in Amman as yyyy-mm-dd. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export const CERTIFICATE_STATUSES: Enums<"certificate_status">[] = ["draft", "issued", "revoked"];

export function isCertificateType(v: string | undefined): v is Enums<"certificate_type"> {
  return v !== undefined && (CERTIFICATE_TYPES as readonly string[]).includes(v);
}
export function isCertificateStatus(v: string | undefined): v is Enums<"certificate_status"> {
  return v !== undefined && (CERTIFICATE_STATUSES as string[]).includes(v);
}

export type CertificateListRow = Pick<Tables<"certificates">, "id" | "certificate_no" | "type" | "status" | "recipient_name_en" | "recipient_name_ar" | "title_en" | "title_ar" | "issue_date" | "updated_at">;

type ListFilters = { type?: string; status?: string; q?: string; from: number; to: number };

function likeTerm(q: string): string {
  return `%${q.replace(/[,()%\\]/g, " ").trim()}%`;
}

export async function listCertificates(supabase: SupabaseServerClient, f: ListFilters): Promise<{ rows: CertificateListRow[]; total: number }> {
  let query = supabase
    .from("certificates")
    .select("id, certificate_no, type, status, recipient_name_en, recipient_name_ar, title_en, title_ar, issue_date, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(f.from, f.to);
  if (isCertificateType(f.type)) query = query.eq("type", f.type);
  if (isCertificateStatus(f.status)) query = query.eq("status", f.status);
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`certificate_no.ilike.${term},recipient_name_en.ilike.${term},recipient_name_ar.ilike.${term},title_en.ilike.${term},title_ar.ilike.${term}`);
  }
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export type EmployeeOption = { userId: string; name: string; email: string | null };

/** Employees for the recipient picker (from the directory view). */
export async function employeeOptions(supabase: SupabaseServerClient, locale: Locale): Promise<EmployeeOption[]> {
  const { data } = await supabase.from("employee_directory").select("user_id, full_name, full_name_ar, email, job_title_en, job_title_ar").order("full_name");
  const out: EmployeeOption[] = [];
  for (const e of data ?? []) {
    if (!e.user_id) continue;
    const name = locale === "ar" ? e.full_name_ar || e.full_name || "" : e.full_name || e.full_name_ar || "";
    const job = pick({ job_title_en: e.job_title_en, job_title_ar: e.job_title_ar }, "job_title", locale);
    out.push({ userId: e.user_id, name: job ? `${name} · ${job}` : name, email: e.email });
  }
  return out;
}
