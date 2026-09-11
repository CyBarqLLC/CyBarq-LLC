"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { CERTIFICATE_TYPES } from "@/lib/validation/certificates";
import { createCertificate, updateCertificate } from "@/lib/actions/certificates";

export type CertificateFormValues = {
  id?: string;
  type: Enums<"certificate_type">;
  language: Locale;
  recipient_name_en: string;
  recipient_name_ar: string | null;
  recipient_email: string | null;
  recipient_user_id: string | null;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  program_name_en: string | null;
  program_name_ar: string | null;
  role_title_en: string | null;
  role_title_ar: string | null;
  start_date: string | null;
  end_date: string | null;
  hours: number | null;
  signatory_name_en: string | null;
  signatory_name_ar: string | null;
  signatory_title_en: string | null;
  signatory_title_ar: string | null;
};

export type EmployeeChoice = { userId: string; name: string; email: string | null };

type Props = {
  mode: "create" | "edit";
  values: CertificateFormValues | null;
  employees: EmployeeChoice[];
  locale: Locale;
  cancelHref: string;
};

/**
 * Draft certificate form. The visible sections follow the certificate type:
 * training and internship show program and hours, experience shows the role
 * and employment period, appreciation and other keep only the core fields.
 */
export function CertificateForm({ mode, values, employees, locale, cancelHref }: Props) {
  const t = useTranslations("certificates");
  const tc = useTranslations("common");
  const action = mode === "create" ? createCertificate : updateCertificate;
  const [result, formAction] = useActionState(action, null);
  const [type, setType] = React.useState<Enums<"certificate_type">>(values?.type ?? "training");
  const [email, setEmail] = React.useState(values?.recipient_email ?? "");
  const err = (name: string) => fieldError(result, name);

  const showProgram = type === "training" || type === "internship";
  const showRole = type === "experience";
  const showPeriod = type !== "appreciation";
  const showHours = type === "training" || type === "internship";

  const onEmployee = (userId: string) => {
    const emp = employees.find((e) => e.userId === userId);
    if (emp?.email && !email) setEmail(emp.email);
  };

  return (
    <form action={formAction} className="flex flex-col gap-10" noValidate>
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.type")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.type")} htmlFor="type" hint={t("form.typeHint")} error={err("type")}>
            <NativeSelect id="type" name="type" value={type} onChange={(e) => setType(e.target.value as Enums<"certificate_type">)}>
              {CERTIFICATE_TYPES.map((v) => (
                <option key={v} value={v}>{label(CERTIFICATE_TYPE_LABELS, v, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("form.language")} htmlFor="language" error={err("language")}>
            <NativeSelect id="language" name="language" defaultValue={values?.language ?? locale}>
              <option value="en">{t("languages.en")}</option>
              <option value="ar">{t("languages.ar")}</option>
            </NativeSelect>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.recipient")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.recipientNameEn")} htmlFor="recipient_name_en" required error={err("recipient_name_en")}>
            <Input id="recipient_name_en" name="recipient_name_en" defaultValue={values?.recipient_name_en ?? ""} required maxLength={200} autoComplete="name" aria-invalid={!!err("recipient_name_en")} />
          </Field>
          <Field label={t("form.recipientNameAr")} htmlFor="recipient_name_ar" error={err("recipient_name_ar")}>
            <Input id="recipient_name_ar" name="recipient_name_ar" defaultValue={values?.recipient_name_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
          <Field label={t("form.employee")} htmlFor="recipient_user_id" hint={t("form.employeeHint")} error={err("recipient_user_id")}>
            <NativeSelect id="recipient_user_id" name="recipient_user_id" defaultValue={values?.recipient_user_id ?? ""} onChange={(e) => onEmployee(e.target.value)}>
              <option value="">{t("form.noEmployee")}</option>
              {employees.map((e) => (
                <option key={e.userId} value={e.userId}>{e.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("form.recipientEmail")} htmlFor="recipient_email" hint={t("form.recipientEmailHint")} error={err("recipient_email")}>
            <Input id="recipient_email" name="recipient_email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} aria-invalid={!!err("recipient_email")} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.content")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.titleEn")} htmlFor="title_en" required hint={t("form.titleHint")} error={err("title_en")}>
            <Input id="title_en" name="title_en" defaultValue={values?.title_en ?? ""} required maxLength={200} aria-invalid={!!err("title_en")} />
          </Field>
          <Field label={t("form.titleAr")} htmlFor="title_ar" error={err("title_ar")}>
            <Input id="title_ar" name="title_ar" defaultValue={values?.title_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
          <Field label={t("form.descriptionEn")} htmlFor="description_en" error={err("description_en")}>
            <Textarea id="description_en" name="description_en" defaultValue={values?.description_en ?? ""} maxLength={2000} className="min-h-24" />
          </Field>
          <Field label={t("form.descriptionAr")} htmlFor="description_ar" error={err("description_ar")}>
            <Textarea id="description_ar" name="description_ar" defaultValue={values?.description_ar ?? ""} maxLength={2000} dir="rtl" className="min-h-24" />
          </Field>
        </div>
      </section>

      {showProgram ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-h3">{t("form.sections.program")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t("form.programNameEn")} htmlFor="program_name_en" required={type === "training"} error={err("program_name_en")}>
              <Input id="program_name_en" name="program_name_en" defaultValue={values?.program_name_en ?? ""} maxLength={200} aria-invalid={!!err("program_name_en")} />
            </Field>
            <Field label={t("form.programNameAr")} htmlFor="program_name_ar" error={err("program_name_ar")}>
              <Input id="program_name_ar" name="program_name_ar" defaultValue={values?.program_name_ar ?? ""} maxLength={200} dir="rtl" />
            </Field>
          </div>
        </section>
      ) : null}

      {showRole ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-h3">{t("form.sections.role")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t("form.roleTitleEn")} htmlFor="role_title_en" required error={err("role_title_en")}>
              <Input id="role_title_en" name="role_title_en" defaultValue={values?.role_title_en ?? ""} maxLength={200} aria-invalid={!!err("role_title_en")} />
            </Field>
            <Field label={t("form.roleTitleAr")} htmlFor="role_title_ar" error={err("role_title_ar")}>
              <Input id="role_title_ar" name="role_title_ar" defaultValue={values?.role_title_ar ?? ""} maxLength={200} dir="rtl" />
            </Field>
          </div>
        </section>
      ) : null}

      {showPeriod ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-h3">{t("form.sections.period")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label={t("form.startDate")} htmlFor="start_date" required={type === "experience"} error={err("start_date")}>
              <Input id="start_date" name="start_date" type="date" defaultValue={values?.start_date ?? ""} aria-invalid={!!err("start_date")} />
            </Field>
            <Field label={t("form.endDate")} htmlFor="end_date" hint={type === "experience" ? t("form.endDateHint") : undefined} error={err("end_date")}>
              <Input id="end_date" name="end_date" type="date" defaultValue={values?.end_date ?? ""} aria-invalid={!!err("end_date")} />
            </Field>
            {showHours ? (
              <Field label={t("form.hours")} htmlFor="hours" error={err("hours")}>
                <Input id="hours" name="hours" inputMode="decimal" defaultValue={values && values.hours !== null ? String(values.hours) : ""} aria-invalid={!!err("hours")} />
              </Field>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.signatory")}</h2>
        <p className="text-small text-slate">{t("form.signatoryHint")}</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.signatoryNameEn")} htmlFor="signatory_name_en" error={err("signatory_name_en")}>
            <Input id="signatory_name_en" name="signatory_name_en" defaultValue={values?.signatory_name_en ?? ""} maxLength={120} />
          </Field>
          <Field label={t("form.signatoryNameAr")} htmlFor="signatory_name_ar" error={err("signatory_name_ar")}>
            <Input id="signatory_name_ar" name="signatory_name_ar" defaultValue={values?.signatory_name_ar ?? ""} maxLength={120} dir="rtl" />
          </Field>
          <Field label={t("form.signatoryTitleEn")} htmlFor="signatory_title_en" error={err("signatory_title_en")}>
            <Input id="signatory_title_en" name="signatory_title_en" defaultValue={values?.signatory_title_en ?? ""} maxLength={120} />
          </Field>
          <Field label={t("form.signatoryTitleAr")} htmlFor="signatory_title_ar" error={err("signatory_title_ar")}>
            <Input id="signatory_title_ar" name="signatory_title_ar" defaultValue={values?.signatory_title_ar ?? ""} maxLength={120} dir="rtl" />
          </Field>
        </div>
      </section>

      <FormMessage result={result} />
      {result?.ok && mode === "edit" ? <p role="status" className="text-small text-success">{t("form.saved")}</p> : null}

      <div className="flex flex-wrap gap-3 border-t border-fog pt-6">
        <SubmitButton>{mode === "create" ? t("create") : tc("saveChanges")}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href={cancelHref}>{t("form.cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}
