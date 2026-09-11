"use client";

import * as React from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { ENGAGEMENT_TYPES } from "@/lib/validation/security";
import { ENGAGEMENT_TYPE_LABELS, label } from "@/lib/labels";
import { pick } from "@/i18n/bilingual";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type ClientOption = { id: string; name_en: string; name_ar: string | null };
export type ProjectOption = { id: string; code: string; name_en: string; name_ar: string | null; client_id: string | null };
export type EmployeeOption = { user_id: string; full_name: string; full_name_ar: string | null; job_title_en: string | null; job_title_ar: string | null };

type EngagementFormProps = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: Partial<Tables<"security_engagements">> & { code: string };
  clients: ClientOption[];
  projects: ProjectOption[];
  employees: EmployeeOption[];
  mode: "create" | "edit";
};

export function employeeName(e: { full_name: string; full_name_ar: string | null }, locale: Locale): string {
  return locale === "ar" ? e.full_name_ar || e.full_name : e.full_name;
}

export function EngagementForm({ action, defaults, clients, projects, employees, mode }: EngagementFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("security.form");
  const locale = useLocale() as Locale;
  const [clientId, setClientId] = React.useState(defaults.client_id ?? "");
  const visibleProjects = clientId ? projects.filter((p) => p.client_id === clientId || p.id === defaults.project_id) : projects;
  const invalid = (name: string) => !!fieldError(result, name);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("sections.basics")}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={t("code")} htmlFor="code" hint={t("codeHint")} error={fieldError(result, "code")} required>
            <Input id="code" name="code" defaultValue={defaults.code} required maxLength={40} aria-invalid={invalid("code")} className="uppercase" />
          </Field>
          <Field label={t("type")} htmlFor="type" error={fieldError(result, "type")} required>
            <NativeSelect id="type" name="type" defaultValue={defaults.type ?? "penetration_test"} aria-invalid={invalid("type")}>
              {ENGAGEMENT_TYPES.map((v) => (
                <option key={v} value={v}>{label(ENGAGEMENT_TYPE_LABELS, v, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("title")} htmlFor="title" error={fieldError(result, "title")} required className="md:col-span-2">
            <Input id="title" name="title" defaultValue={defaults.title ?? ""} required maxLength={200} aria-invalid={invalid("title")} />
          </Field>
          <Field label={t("client")} htmlFor="client_id" error={fieldError(result, "client_id")}>
            <NativeSelect id="client_id" name="client_id" value={clientId} onChange={(e) => setClientId(e.target.value)} aria-invalid={invalid("client_id")}>
              <option value="">{t("noClient")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{pick(c, "name", locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("project")} htmlFor="project_id" hint={t("projectHint")} error={fieldError(result, "project_id")}>
            <NativeSelect id="project_id" name="project_id" defaultValue={defaults.project_id ?? ""} aria-invalid={invalid("project_id")}>
              <option value="">{t("noProject")}</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.code} · {pick(p, "name", locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("lead")} htmlFor="lead_user_id" error={fieldError(result, "lead_user_id")}>
            <NativeSelect id="lead_user_id" name="lead_user_id" defaultValue={defaults.lead_user_id ?? ""} aria-invalid={invalid("lead_user_id")}>
              <option value="">{t("noLead")}</option>
              {employees.map((e) => (
                <option key={e.user_id} value={e.user_id}>{employeeName(e, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label={t("startDate")} htmlFor="start_date" error={fieldError(result, "start_date")}>
              <Input id="start_date" name="start_date" type="date" defaultValue={defaults.start_date ?? ""} aria-invalid={invalid("start_date")} />
            </Field>
            <Field label={t("endDate")} htmlFor="end_date" error={fieldError(result, "end_date")}>
              <Input id="end_date" name="end_date" type="date" defaultValue={defaults.end_date ?? ""} aria-invalid={invalid("end_date")} />
            </Field>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("sections.scope")}</h2>
        <Field label={t("scopeSummary")} htmlFor="scope_summary" error={fieldError(result, "scope_summary")}>
          <Textarea id="scope_summary" name="scope_summary" defaultValue={defaults.scope_summary ?? ""} maxLength={5000} aria-invalid={invalid("scope_summary")} />
        </Field>
        <Field label={t("rules")} htmlFor="rules_of_engagement" hint={t("rulesHint")} error={fieldError(result, "rules_of_engagement")}>
          <Textarea id="rules_of_engagement" name="rules_of_engagement" defaultValue={defaults.rules_of_engagement ?? ""} maxLength={20000} className="min-h-40" aria-invalid={invalid("rules_of_engagement")} />
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("sections.authorisation")}</h2>
        <p className="text-small text-slate">{t("authorisationHint")}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={t("authorisedBy")} htmlFor="authorised_by_name" error={fieldError(result, "authorised_by_name")}>
            <Input id="authorised_by_name" name="authorised_by_name" defaultValue={defaults.authorised_by_name ?? ""} maxLength={200} aria-invalid={invalid("authorised_by_name")} />
          </Field>
          <Field label={t("authorisedAt")} htmlFor="authorised_at" error={fieldError(result, "authorised_at")}>
            <Input id="authorised_at" name="authorised_at" type="date" defaultValue={defaults.authorised_at ?? ""} aria-invalid={invalid("authorised_at")} />
          </Field>
        </div>
      </section>

      <FormMessage result={result} />
      <div className="flex flex-wrap gap-3">
        <SubmitButton>{mode === "create" ? t("create") : t("save")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
