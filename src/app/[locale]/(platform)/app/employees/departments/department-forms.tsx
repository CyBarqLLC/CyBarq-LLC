"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type DepartmentValues = { name_en: string; name_ar: string; position: number };

type DepartmentFormProps = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: DepartmentValues;
  submitLabel: string;
  idPrefix: string;
  onDone?: () => void;
};

export function DepartmentForm({ action, defaults, submitLabel, idPrefix, onDone }: DepartmentFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("hr.departments");
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

  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <ServerActionForm key={formKey} action={formAction} result={result} className="grid gap-4 sm:grid-cols-[1fr_1fr_6rem_auto] sm:items-end" noValidate>
      <Field label={t("nameEn")} htmlFor={id("name_en")} error={fieldError(result, "name_en")} required>
        <Input id={id("name_en")} name="name_en" defaultValue={defaults.name_en} required maxLength={120} dir="ltr" />
      </Field>
      <Field label={t("nameAr")} htmlFor={id("name_ar")} error={fieldError(result, "name_ar")} required>
        <Input id={id("name_ar")} name="name_ar" defaultValue={defaults.name_ar} required maxLength={120} dir="rtl" />
      </Field>
      <Field label={t("position")} htmlFor={id("position")} error={fieldError(result, "position")}>
        <Input id={id("position")} name="position" type="number" inputMode="numeric" min={0} max={1000} defaultValue={defaults.position} dir="ltr" />
      </Field>
      <div className="flex gap-2">
        <SubmitButton size="md">{submitLabel}</SubmitButton>
        {onDone ? <Button type="button" variant="ghost" onClick={onDone}>{tc("cancel")}</Button> : null}
      </div>
      <FormMessage result={result} className="sm:col-span-full" />
    </ServerActionForm>
  );
}

type DepartmentItemProps = {
  departmentId: string;
  values: DepartmentValues;
  updateAction: DepartmentFormProps["action"];
  summary: React.ReactNode;
  deleteControl: React.ReactNode;
};

export function DepartmentItem({ departmentId, values, updateAction, summary, deleteControl }: DepartmentItemProps) {
  const [editing, setEditing] = useState(false);
  const t = useTranslations("hr.departments");
  return (
    <li className="border border-fog bg-white p-4">
      {editing ? (
        <DepartmentForm action={updateAction} defaults={values} submitLabel={t("edit")} idPrefix={`d-${departmentId}`} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">{summary}</div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("edit")}</Button>
            {deleteControl}
          </div>
        </div>
      )}
    </li>
  );
}
