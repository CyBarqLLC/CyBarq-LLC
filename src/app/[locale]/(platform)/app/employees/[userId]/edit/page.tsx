import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYMENT_STATUS_LABELS } from "@/lib/labels";
import { EMPLOYMENT_STATUSES } from "@/lib/validation/employees";
import { updateEmployee } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { EmployeeForm } from "../../employee-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.record");
  return { title: t("edit"), robots: { index: false, follow: false } };
}

export default async function EditEmployeePage({ params }: { params: Promise<{ userId: string }> }) {
  await requirePermission("hr.write");
  const { userId } = await params;
  if (!UUID.test(userId)) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.record");
  const supabase = await createClient();
  const [{ data: employee }, { data: departments }] = await Promise.all([
    supabase
      .from("employees")
      .select("user_id, employee_no, department_id, job_title_en, job_title_ar, employment_status, start_date, end_date, work_phone, work_email, emergency_contact_name, emergency_contact_phone, notes, profile:profiles!employees_user_id_fkey(full_name, full_name_ar, email)")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("departments").select("id, name_en, name_ar").order("position").order("name_en"),
  ]);
  if (!employee) notFound();

  return (
    <>
      <PageHeader
        eyebrow={<Link href={`/app/employees/${userId}`} className="hover:text-azure">{personName(employee.profile, locale)}</Link>}
        title={t("edit")}
        actions={
          <Button asChild variant="ghost">
            <Link href={`/app/employees/${userId}`}>{t("back")}</Link>
          </Button>
        }
      />
      <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
        <EmployeeForm
          mode="edit"
          action={updateEmployee.bind(null, userId)}
          departments={(departments ?? []).map((d) => ({ value: d.id, label: pick(d, "name", locale) }))}
          statuses={enumOptions(EMPLOYMENT_STATUS_LABELS, locale, EMPLOYMENT_STATUSES)}
          defaults={{
            employee_no: employee.employee_no,
            department_id: employee.department_id,
            job_title_en: employee.job_title_en,
            job_title_ar: employee.job_title_ar,
            employment_status: employee.employment_status,
            start_date: employee.start_date,
            end_date: employee.end_date,
            work_phone: employee.work_phone,
            work_email: employee.work_email,
            emergency_contact_name: employee.emergency_contact_name,
            emergency_contact_phone: employee.emergency_contact_phone,
            notes: employee.notes,
          }}
        />
      </div>
    </>
  );
}
