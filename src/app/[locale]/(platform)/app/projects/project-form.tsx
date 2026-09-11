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

export type ProjectFormValues = {
  code: string;
  name_en: string;
  name_ar: string | null;
  client_id: string | null;
  practice: string;
  status: string;
  description: string | null;
  manager_user_id: string | null;
  start_date: string | null;
  end_date: string | null;
  client_visible: boolean;
};

type ProjectFormProps = {
  mode: "create" | "edit";
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: ProjectFormValues;
  clients: Option[];
  managers: Option[];
  practices: Option[];
  statuses: Option[];
};

export function ProjectForm({ mode, action, defaults, clients, managers, practices, statuses }: ProjectFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("projects");
  const router = useRouter();
  const handled = useRef<ActionResult<{ id: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(mode === "create" ? t("form.created") : t("form.saved"));
      router.push(`/app/projects/${result.data.id}`);
    }
  }, [result, mode, router, t]);

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.basics")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.code")} htmlFor="code" hint={t("fields.codeHint")} error={fieldError(result, "code")} required>
            <Input id="code" name="code" defaultValue={defaults.code} required maxLength={32} autoComplete="off" className="uppercase" aria-invalid={!!fieldError(result, "code")} />
          </Field>
          <Field label={t("fields.practice")} htmlFor="practice" error={fieldError(result, "practice")} required>
            <NativeSelect id="practice" name="practice" defaultValue={defaults.practice}>
              {practices.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("fields.nameEn")} htmlFor="name_en" error={fieldError(result, "name_en")} required>
            <Input id="name_en" name="name_en" defaultValue={defaults.name_en} required maxLength={200} dir="ltr" aria-invalid={!!fieldError(result, "name_en")} />
          </Field>
          <Field label={t("fields.nameAr")} htmlFor="name_ar" error={fieldError(result, "name_ar")}>
            <Input id="name_ar" name="name_ar" defaultValue={defaults.name_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
          <Field label={t("fields.client")} htmlFor="client_id" error={fieldError(result, "client_id")}>
            <NativeSelect id="client_id" name="client_id" defaultValue={defaults.client_id ?? ""}>
              <option value="">{t("fields.noClient")}</option>
              {clients.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          </Field>
          {mode === "create" ? (
            <Field label={t("fields.status")} htmlFor="status" error={fieldError(result, "status")} required>
              <NativeSelect id="status" name="status" defaultValue={defaults.status}>
                {statuses.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <input type="hidden" name="status" value={defaults.status} />
          )}
        </div>
        <Field label={t("fields.description")} htmlFor="description" error={fieldError(result, "description")}>
          <Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={5000} />
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.schedule")}</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t("fields.manager")} htmlFor="manager_user_id" error={fieldError(result, "manager_user_id")}>
            <NativeSelect id="manager_user_id" name="manager_user_id" defaultValue={defaults.manager_user_id ?? ""}>
              <option value="">{t("fields.noManager")}</option>
              {managers.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("fields.startDate")} htmlFor="start_date" error={fieldError(result, "start_date")}>
            <Input id="start_date" name="start_date" type="date" defaultValue={defaults.start_date ?? ""} />
          </Field>
          <Field label={t("fields.endDate")} htmlFor="end_date" error={fieldError(result, "end_date")}>
            <Input id="end_date" name="end_date" type="date" defaultValue={defaults.end_date ?? ""} aria-invalid={!!fieldError(result, "end_date")} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h3">{t("form.visibility")}</h2>
        <label htmlFor="client_visible" className="flex items-start gap-3 text-body">
          <input id="client_visible" name="client_visible" type="checkbox" defaultChecked={defaults.client_visible} className="mt-1 size-5 accent-graphite" />
          <span>
            <span className="block">{t("fields.clientVisible")}</span>
            <span className="block text-small text-slate">{t("fields.clientVisibleHint")}</span>
          </span>
        </label>
      </section>

      <FormMessage result={result} />
      <div className="flex flex-wrap gap-3">
        <SubmitButton>{mode === "create" ? t("form.create") : t("form.save")}</SubmitButton>
      </div>
    </form>
  );
}
