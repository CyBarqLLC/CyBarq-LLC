"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type TeamFormValues = { name_en: string; name_ar: string; department_id: string | null; lead_user_id: string | null };

type TeamFormProps = {
  mode: "create" | "edit";
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: TeamFormValues;
  departments: Option[];
  leads: Option[];
};

export function TeamForm({ mode, action, defaults, departments, leads }: TeamFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("hr.teams");
  const router = useRouter();
  const handled = useRef<ActionResult<{ id: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(mode === "create" ? t("created") : t("saved"));
      if (mode === "create") router.push(`/app/employees/teams/${result.data.id}`);
      else router.refresh();
    }
  }, [result, mode, router, t]);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("nameEn")} htmlFor="team-name_en" error={fieldError(result, "name_en")} required>
          <Input id="team-name_en" name="name_en" defaultValue={defaults.name_en} required maxLength={120} dir="ltr" />
        </Field>
        <Field label={t("nameAr")} htmlFor="team-name_ar" error={fieldError(result, "name_ar")} required>
          <Input id="team-name_ar" name="name_ar" defaultValue={defaults.name_ar} required maxLength={120} dir="rtl" />
        </Field>
        <Field label={t("department")} htmlFor="team-department_id" error={fieldError(result, "department_id")}>
          <NativeSelect id="team-department_id" name="department_id" defaultValue={defaults.department_id ?? ""}>
            <option value="">{t("noDepartment")}</option>
            {departments.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("lead")} htmlFor="team-lead_user_id" error={fieldError(result, "lead_user_id")}>
          <NativeSelect id="team-lead_user_id" name="lead_user_id" defaultValue={defaults.lead_user_id ?? ""}>
            <option value="">{t("noLead")}</option>
            {leads.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{mode === "create" ? t("add") : t("edit")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
