"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";

export type MilestoneFormValues = {
  title_en: string;
  title_ar: string | null;
  description: string | null;
  due_date: string | null;
  status: string;
  client_visible: boolean;
};

type MilestoneFormProps = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: MilestoneFormValues;
  statuses: Option[];
  submitLabel: string;
  onDone?: () => void;
  idPrefix: string;
};

export function MilestoneForm({ action, defaults, statuses, submitLabel, onDone, idPrefix }: MilestoneFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("projects.milestones");
  const tc = useTranslations("common");
  const router = useRouter();
  const handled = useRef<ActionResult<{ id: string }> | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("saved"));
      setFormKey((k) => k + 1);
      router.refresh();
      onDone?.();
    }
  }, [result, router, t, onDone]);

  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label={t("titleEn")} htmlFor={id("title_en")} error={fieldError(result, "title_en")} required>
        <Input id={id("title_en")} name="title_en" defaultValue={defaults.title_en} required maxLength={200} dir="ltr" />
      </Field>
      <Field label={t("titleAr")} htmlFor={id("title_ar")} error={fieldError(result, "title_ar")}>
        <Input id={id("title_ar")} name="title_ar" defaultValue={defaults.title_ar ?? ""} maxLength={200} dir="rtl" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("dueDate")} htmlFor={id("due_date")} error={fieldError(result, "due_date")}>
          <Input id={id("due_date")} name="due_date" type="date" defaultValue={defaults.due_date ?? ""} />
        </Field>
        <Field label={t("status")} htmlFor={id("status")} error={fieldError(result, "status")}>
          <NativeSelect id={id("status")} name="status" defaultValue={defaults.status}>
            {statuses.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field label={t("description")} htmlFor={id("description")} error={fieldError(result, "description")}>
        <Textarea id={id("description")} name="description" defaultValue={defaults.description ?? ""} className="min-h-20" maxLength={2000} />
      </Field>
      <label htmlFor={id("client_visible")} className="flex items-center gap-3 text-body">
        <input id={id("client_visible")} name="client_visible" type="checkbox" defaultChecked={defaults.client_visible} className="size-5 accent-graphite" />
        {t("clientVisible")}
      </label>
      <FormMessage result={result} />
      <div className="flex flex-wrap gap-2">
        <SubmitButton size="sm">{submitLabel}</SubmitButton>
        {onDone ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>{tc("cancel")}</Button>
        ) : null}
      </div>
    </form>
  );
}
