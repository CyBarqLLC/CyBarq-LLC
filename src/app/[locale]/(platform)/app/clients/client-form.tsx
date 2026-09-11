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
import { CLIENT_STATUSES } from "@/lib/validation/clients";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type ClientFormValues = {
  name_en: string;
  name_ar: string | null;
  legal_name: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  tax_number: string | null;
  website: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
};

type ClientFormProps = {
  mode: "create" | "edit";
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: ClientFormValues;
};

export function ClientForm({ mode, action, defaults }: ClientFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("platform.clients");
  const router = useRouter();
  const handled = useRef<ActionResult<{ id: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(mode === "create" ? t("form.created") : t("form.saved"));
      router.push(`/app/clients/${result.data.id}`);
    }
  }, [result, mode, router, t]);

  const err = (name: string) => fieldError(result, name);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.identity")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.nameEn")} htmlFor="name_en" error={err("name_en")} required>
            <Input id="name_en" name="name_en" defaultValue={defaults.name_en} required maxLength={200} dir="ltr" aria-invalid={!!err("name_en")} />
          </Field>
          <Field label={t("fields.nameAr")} htmlFor="name_ar" error={err("name_ar")}>
            <Input id="name_ar" name="name_ar" defaultValue={defaults.name_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
          <Field label={t("fields.legalName")} htmlFor="legal_name" error={err("legal_name")}>
            <Input id="legal_name" name="legal_name" defaultValue={defaults.legal_name ?? ""} maxLength={300} />
          </Field>
          <Field label={t("fields.status")} htmlFor="status" error={err("status")} required>
            <NativeSelect id="status" name="status" defaultValue={defaults.status}>
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("fields.taxNumber")} htmlFor="tax_number" error={err("tax_number")}>
            <Input id="tax_number" name="tax_number" defaultValue={defaults.tax_number ?? ""} maxLength={100} dir="ltr" />
          </Field>
          <Field label={t("fields.website")} htmlFor="website" error={err("website")}>
            <Input id="website" name="website" type="url" inputMode="url" defaultValue={defaults.website ?? ""} placeholder="https://" maxLength={300} dir="ltr" aria-invalid={!!err("website")} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.contact")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.primaryContactName")} htmlFor="primary_contact_name" error={err("primary_contact_name")}>
            <Input id="primary_contact_name" name="primary_contact_name" defaultValue={defaults.primary_contact_name ?? ""} maxLength={200} />
          </Field>
          <Field label={t("fields.primaryContactEmail")} htmlFor="primary_contact_email" error={err("primary_contact_email")}>
            <Input id="primary_contact_email" name="primary_contact_email" type="email" inputMode="email" defaultValue={defaults.primary_contact_email ?? ""} maxLength={200} dir="ltr" aria-invalid={!!err("primary_contact_email")} />
          </Field>
          <Field label={t("fields.phone")} htmlFor="phone" error={err("phone")}>
            <Input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={defaults.phone ?? ""} maxLength={50} dir="ltr" />
          </Field>
          <Field label={t("fields.country")} htmlFor="country" error={err("country")}>
            <Input id="country" name="country" defaultValue={defaults.country ?? ""} maxLength={100} autoComplete="country-name" />
          </Field>
          <Field label={t("fields.city")} htmlFor="city" error={err("city")}>
            <Input id="city" name="city" defaultValue={defaults.city ?? ""} maxLength={100} />
          </Field>
          <Field label={t("fields.address")} htmlFor="address" error={err("address")}>
            <Input id="address" name="address" defaultValue={defaults.address ?? ""} maxLength={500} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.other")}</h2>
        <Field label={t("fields.notes")} htmlFor="notes" error={err("notes")}>
          <Textarea id="notes" name="notes" defaultValue={defaults.notes ?? ""} maxLength={5000} />
        </Field>
      </section>

      <FormMessage result={result} />
      <div>
        <SubmitButton>{mode === "create" ? t("form.create") : t("form.save")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
