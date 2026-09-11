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

export type ContactValues = { name: string; email: string | null; phone: string | null; title: string | null };

type ContactFormProps = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: ContactValues;
  submitLabel: string;
  idPrefix: string;
  onDone?: () => void;
};

export function ContactForm({ action, defaults, submitLabel, idPrefix, onDone }: ContactFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("platform.clients.contacts");
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
    <ServerActionForm key={formKey} action={formAction} result={result} className="flex flex-col gap-4" noValidate>
      <Field label={t("name")} htmlFor={id("name")} error={fieldError(result, "name")} required>
        <Input id={id("name")} name="name" defaultValue={defaults.name} required maxLength={200} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("email")} htmlFor={id("email")} error={fieldError(result, "email")}>
          <Input id={id("email")} name="email" type="email" inputMode="email" defaultValue={defaults.email ?? ""} maxLength={200} dir="ltr" />
        </Field>
        <Field label={t("phone")} htmlFor={id("phone")} error={fieldError(result, "phone")}>
          <Input id={id("phone")} name="phone" type="tel" inputMode="tel" defaultValue={defaults.phone ?? ""} maxLength={50} dir="ltr" />
        </Field>
      </div>
      <Field label={t("jobTitle")} htmlFor={id("title")} error={fieldError(result, "title")}>
        <Input id={id("title")} name="title" defaultValue={defaults.title ?? ""} maxLength={200} />
      </Field>
      <FormMessage result={result} />
      <div className="flex gap-2">
        <SubmitButton size="sm">{submitLabel}</SubmitButton>
        {onDone ? <Button type="button" variant="ghost" size="sm" onClick={onDone}>{tc("cancel")}</Button> : null}
      </div>
    </ServerActionForm>
  );
}

type ContactItemProps = {
  contactId: string;
  values: ContactValues;
  updateAction: ContactFormProps["action"];
  summary: React.ReactNode;
  deleteControl?: React.ReactNode;
  canEdit: boolean;
};

export function ContactItem({ contactId, values, updateAction, summary, deleteControl, canEdit }: ContactItemProps) {
  const [editing, setEditing] = useState(false);
  const t = useTranslations("platform.clients.contacts");
  return (
    <li className="border border-fog bg-white p-4">
      {editing ? (
        <ContactForm action={updateAction} defaults={values} submitLabel={t("edit")} idPrefix={`c-${contactId}`} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">{summary}</div>
          {canEdit ? (
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("edit")}</Button>
              {deleteControl}
            </div>
          ) : null}
        </div>
      )}
    </li>
  );
}
