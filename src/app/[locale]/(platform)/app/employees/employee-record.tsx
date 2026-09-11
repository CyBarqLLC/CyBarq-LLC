import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import type { Viewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { label, EMPLOYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { DOCUMENT_KINDS, DOCUMENT_KIND_LABELS } from "@/lib/validation/employees";
import { deleteEmployeeDocument } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { SectionCard } from "@/components/platform/section-card";
import { DetailList } from "@/components/platform/detail-list";
import { Person, personName } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { formatBytes } from "@/components/platform/format-bytes";
import { EmployeeDocumentUploader } from "./employee-document-uploader";

/**
 * Full HR record for one employee. Callers guarantee the viewer may see it
 * (hr.read or the employee themself); RLS enforces the same rule.
 */
export async function EmployeeRecord({ userId, viewer, self }: { userId: string; viewer: Viewer; self: boolean }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.record");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  const [{ data: employee }, { data: documents }] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "user_id, employee_no, department_id, job_title_en, job_title_ar, employment_status, start_date, end_date, work_phone, work_email, emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at, profile:profiles!employees_user_id_fkey(id, full_name, full_name_ar, email, avatar_path, phone), department:departments(id, name_en, name_ar)",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("employee_documents").select("id, kind, title, size_bytes, mime_type, created_at").eq("employee_user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (!employee) {
    return (
      <>
        <PageHeader title={self ? t("noRecord") : t("title")} />
        <EmptyState
          title={t("noRecord")}
          description={t("noRecordHint")}
          action={
            <Button asChild variant="outline">
              <Link href="/app/employees">{t("back")}</Link>
            </Button>
          }
        />
      </>
    );
  }

  const canWrite = viewer.can("hr.write");
  type Doc = NonNullable<typeof documents>[number];
  const kindLabel = (kind: Doc["kind"]) => (DOCUMENT_KINDS.includes(kind) ? DOCUMENT_KIND_LABELS[kind][locale] : kind);
  const docColumns: Column<Doc>[] = [
    { key: "title", header: t("columns.title"), primary: true, cell: (d) => <a href={`/api/files/employee-documents/${d.id}`} className="font-medium text-graphite hover:text-azure">{d.title}</a> },
    { key: "kind", header: t("columns.kind"), cell: (d) => kindLabel(d.kind) },
    { key: "size", header: t("columns.size"), cell: (d) => formatBytes(d.size_bytes, locale) },
    { key: "date", header: t("columns.date"), cell: (d) => formatDate(d.created_at, locale) },
    { key: "actions", header: "", align: "end", cell: (d) => (
      <span className="inline-flex gap-1">
        <a href={`/api/files/employee-documents/${d.id}`} className="touch inline-flex items-center px-2 text-small text-azure hover:underline">{tc("download")}</a>
        {canWrite ? (
          <ConfirmAction
            action={deleteEmployeeDocument.bind(null, userId, d.id)}
            title={t("deleteDocumentTitle")}
            description={t("deleteDocumentDescription")}
            confirmLabel={t("deleteDocument")}
            triggerLabel={t("deleteDocument")}
            triggerVariant="ghost"
            destructive
            successMessage={t("documentDeleted")}
          />
        ) : null}
      </span>
    ) },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/employees" className="hover:text-azure">{t("back")}</Link>
            <span aria-hidden>/</span>
            <Status value={employee.employment_status} label={label(EMPLOYMENT_STATUS_LABELS, employee.employment_status, locale)} />
          </span>
        }
        title={personName(employee.profile, locale)}
        description={[pick(employee, "job_title", locale), employee.department ? pick(employee.department, "name", locale) : null].filter(Boolean).join(" · ")}
        actions={canWrite ? (
          <Button asChild variant="outline">
            <Link href={`/app/employees/${userId}/edit`}>{t("edit")}</Link>
          </Button>
        ) : undefined}
      />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title={t("employment")} description={t("hrOnly")}>
            <div className="mb-5">
              <Person person={employee.profile} locale={locale} secondary={employee.profile?.email ?? null} size="md" />
            </div>
            <DetailList
              items={[
                { label: t("fields.employeeNo"), value: employee.employee_no ? <span className="font-mono" dir="ltr">{employee.employee_no}</span> : "" },
                { label: t("fields.employmentStatus"), value: label(EMPLOYMENT_STATUS_LABELS, employee.employment_status, locale) },
                { label: t("fields.jobTitleEn"), value: employee.job_title_en },
                { label: t("fields.jobTitleAr"), value: employee.job_title_ar },
                { label: t("fields.department"), value: employee.department ? pick(employee.department, "name", locale) : "" },
                { label: t("fields.startDate"), value: formatDate(employee.start_date, locale) },
                { label: t("fields.endDate"), value: formatDate(employee.end_date, locale) },
              ]}
            />
          </SectionCard>
          <SectionCard title={t("contact")}>
            <DetailList
              items={[
                { label: t("fields.workEmail"), value: employee.work_email ? <span dir="ltr">{employee.work_email}</span> : "" },
                { label: t("fields.workPhone"), value: employee.work_phone ? <span dir="ltr">{employee.work_phone}</span> : "" },
              ]}
            />
          </SectionCard>
          <SectionCard title={t("emergency")}>
            <DetailList
              items={[
                { label: t("fields.emergencyContactName"), value: employee.emergency_contact_name },
                { label: t("fields.emergencyContactPhone"), value: employee.emergency_contact_phone ? <span dir="ltr">{employee.emergency_contact_phone}</span> : "" },
              ]}
            />
          </SectionCard>
          {viewer.can("hr.read") ? (
            <SectionCard title={t("notes")}>
              {employee.notes ? <p className="whitespace-pre-line text-body">{employee.notes}</p> : <p className="text-small text-slate">-</p>}
            </SectionCard>
          ) : null}
        </div>
        <div className="flex flex-col gap-6">
          <SectionCard title={t("documents")} flush>
            <DataTable rows={documents ?? []} columns={docColumns} rowKey={(d) => d.id} emptyTitle={t("documentsEmpty")} caption={t("documents")} className="[&>ul]:p-4 [&>div]:border-0" />
          </SectionCard>
          {canWrite ? (
            <SectionCard title={t("uploadDocument")}>
              <EmployeeDocumentUploader employeeUserId={userId} kinds={DOCUMENT_KINDS.map((k) => ({ value: k, label: DOCUMENT_KIND_LABELS[k][locale] }))} />
            </SectionCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
