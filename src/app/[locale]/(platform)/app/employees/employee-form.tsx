"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";

export type EmployeeFormValues = {
  employee_no: string | null;
  department_id: string | null;
  job_title_en: string;
  job_title_ar: string | null;
  employment_status: string;
  start_date: string | null;
  end_date: string | null;
  work_phone: string | null;
  work_email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
};

type EmployeeFormProps = {
  mode: "create" | "edit";
  action: (prev: ActionResult<{ userId: string }> | null, formData: FormData) => Promise<ActionResult<{ userId: string }>>;
  defaults: EmployeeFormValues;
  departments: Option[];
  statuses: Option[];
  /** Create mode only: employee accounts without a record. */
  candidates?: Option[];
};

export function EmployeeForm({ mode, action, defaults, departments, statuses, candidates }: EmployeeFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("hr.record");
  const router = useRouter();
  const handled = useRef<ActionResult<{ userId: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(mode === "create" ? t("form.created") : t("form.saved"));
      router.push(`/app/employees/${result.data.userId}`);
    }
  }, [result, mode, router, t]);

  const err = (name: string) => fieldError(result, name);

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      {mode === "create" ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-h3">{t("fields.account")}</h2>
          <Field label={t("fields.account")} htmlFor="user_id" hint={t("fields.accountHint")} error={err("user_id")} required>
            <NativeSelect id="user_id" name="user_id" defaultValue="" required aria-invalid={!!err("user_id")}>
              <option value="" disabled>{t("fields.chooseAccount")}</option>
              {(candidates ?? []).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </NativeSelect>
          </Field>
        </section>
      ) : null}

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("employment")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.employeeNo")} htmlFor="employee_no" error={err("employee_no")}>
            <Input id="employee_no" name="employee_no" defaultValue={defaults.employee_no ?? ""} maxLength={50} dir="ltr" />
          </Field>
          <Field label={t("fields.employmentStatus")} htmlFor="employment_status" error={err("employment_status")} required>
            <NativeSelect id="employment_status" name="employment_status" defaultValue={defaults.employment_status}>
              {statuses.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("fields.jobTitleEn")} htmlFor="job_title_en" error={err("job_title_en")} required>
            <Input id="job_title_en" name="job_title_en" defaultValue={defaults.job_title_en} required maxLength={200} dir="ltr" aria-invalid={!!err("job_title_en")} />
          </Field>
          <Field label={t("fields.jobTitleAr")} htmlFor="job_title_ar" error={err("job_title_ar")}>
            <Input id="job_title_ar" name="job_title_ar" defaultValue={defaults.job_title_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
          <Field label={t("fields.department")} htmlFor="department_id" error={err("department_id")}>
            <NativeSelect id="department_id" name="department_id" defaultValue={defaults.department_id ?? ""}>
              <option value="">-</option>
              {departments.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("fields.startDate")} htmlFor="start_date" error={err("start_date")}>
              <Input id="start_date" name="start_date" type="date" defaultValue={defaults.start_date ?? ""} />
            </Field>
            <Field label={t("fields.endDate")} htmlFor="end_date" error={err("end_date")}>
              <Input id="end_date" name="end_date" type="date" defaultValue={defaults.end_date ?? ""} aria-invalid={!!err("end_date")} />
            </Field>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("contact")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.workEmail")} htmlFor="work_email" error={err("work_email")}>
            <Input id="work_email" name="work_email" type="email" inputMode="email" defaultValue={defaults.work_email ?? ""} maxLength={200} dir="ltr" aria-invalid={!!err("work_email")} />
          </Field>
          <Field label={t("fields.workPhone")} htmlFor="work_phone" error={err("work_phone")}>
            <Input id="work_phone" name="work_phone" type="tel" inputMode="tel" defaultValue={defaults.work_phone ?? ""} maxLength={50} dir="ltr" />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("emergency")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.emergencyContactName")} htmlFor="emergency_contact_name" error={err("emergency_contact_name")}>
            <Input id="emergency_contact_name" name="emergency_contact_name" defaultValue={defaults.emergency_contact_name ?? ""} maxLength={200} />
          </Field>
          <Field label={t("fields.emergencyContactPhone")} htmlFor="emergency_contact_phone" error={err("emergency_contact_phone")}>
            <Input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" inputMode="tel" defaultValue={defaults.emergency_contact_phone ?? ""} maxLength={50} dir="ltr" />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("notes")}</h2>
        <Field label={t("fields.notes")} htmlFor="notes" error={err("notes")}>
          <Textarea id="notes" name="notes" defaultValue={defaults.notes ?? ""} maxLength={5000} />
        </Field>
      </section>

      <FormMessage result={result} />
      <div>
        <SubmitButton>{mode === "create" ? t("form.create") : t("form.save")}</SubmitButton>
      </div>
    </form>
  );
}
