import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYMENT_STATUS_LABELS } from "@/lib/labels";
import { EMPLOYMENT_STATUSES } from "@/lib/validation/employees";
import { createEmployee } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { EmployeeForm } from "../employee-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.record");
  return { title: t("new"), robots: { index: false, follow: false } };
}

export default async function NewEmployeePage() {
  await requirePermission("hr.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.record");
  const supabase = await createClient();

  const [{ data: profiles }, { data: existing }, { data: departments }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, full_name_ar, email").eq("kind", "employee").eq("is_active", true).order("full_name").limit(500),
    supabase.from("employees").select("user_id").limit(1000),
    supabase.from("departments").select("id, name_en, name_ar").order("position").order("name_en"),
  ]);
  const taken = new Set((existing ?? []).map((e) => e.user_id));
  const candidates = (profiles ?? []).filter((p) => !taken.has(p.id)).map((p) => ({ value: p.id, label: `${personName(p, locale)} (${p.email})` }));

  return (
    <>
      <PageHeader
        title={t("new")}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/employees">{t("back")}</Link>
          </Button>
        }
      />
      {candidates.length === 0 ? (
        <EmptyState title={t("noCandidates")} description={t("fields.accountHint")} />
      ) : (
        <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
          <EmployeeForm
            mode="create"
            action={createEmployee}
            candidates={candidates}
            departments={(departments ?? []).map((d) => ({ value: d.id, label: pick(d, "name", locale) }))}
            statuses={enumOptions(EMPLOYMENT_STATUS_LABELS, locale, EMPLOYMENT_STATUSES)}
            defaults={{
              employee_no: null,
              department_id: null,
              job_title_en: "",
              job_title_ar: null,
              employment_status: "active",
              start_date: null,
              end_date: null,
              work_phone: null,
              work_email: null,
              emergency_contact_name: null,
              emergency_contact_phone: null,
              notes: null,
            }}
          />
        </div>
      )}
    </>
  );
}
