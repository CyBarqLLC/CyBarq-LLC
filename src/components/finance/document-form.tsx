"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { CURRENCIES } from "@/lib/validation/finance";
import { currencyOption } from "@/lib/labels";
import { createQuote, updateQuote, createInvoice, updateInvoice } from "@/lib/actions/finance";
import { LineItemsEditor, type LineItemDraft } from "./line-items-editor";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type DocumentFormValues = {
  id?: string;
  /** Version the form was loaded from; the save is refused if someone changed the draft since. */
  updated_at?: string;
  client_id: string;
  project_id: string | null;
  language: Locale;
  currency: string;
  tax_rate: number;
  title_en: string | null;
  title_ar: string | null;
  notes_en: string | null;
  notes_ar: string | null;
  terms_en: string | null;
  terms_ar: string | null;
  /** Quote: valid_until. Invoice: due_date. */
  date: string | null;
};

export type ClientOption = { id: string; name: string };
export type ProjectOption = { id: string; name: string; client_id: string | null };

type Props = {
  kind: "quote" | "invoice";
  mode: "create" | "edit";
  values: DocumentFormValues | null;
  items: LineItemDraft[];
  clients: ClientOption[];
  projects: ProjectOption[];
  locale: Locale;
  cancelHref: string;
};

/** Draft quote / invoice form. One component, two document kinds. */
export function DocumentForm({ kind, mode, values, items, clients, projects, locale, cancelHref }: Props) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const action = kind === "quote" ? (mode === "create" ? createQuote : updateQuote) : mode === "create" ? createInvoice : updateInvoice;
  const [result, formAction] = useActionState(action, null);
  const [clientId, setClientId] = React.useState(values?.client_id ?? "");
  const [currency, setCurrency] = React.useState(values?.currency ?? "JOD");
  const err = (name: string) => fieldError(result, name);
  const visibleProjects = projects.filter((p) => !clientId || p.client_id === clientId || p.client_id === null);
  const dateField = kind === "quote" ? "valid_until" : "due_date";

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-10" noValidate>
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {values?.updated_at ? <input type="hidden" name="expected_updated_at" value={values.updated_at} /> : null}

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.document")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.client")} htmlFor="client_id" required error={err("client_id")}>
            <NativeSelect id="client_id" name="client_id" value={clientId} onChange={(e) => setClientId(e.target.value)} required aria-invalid={!!err("client_id")}>
              <option value="">{t("form.selectClient")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("form.project")} htmlFor="project_id" error={err("project_id")}>
            <NativeSelect id="project_id" name="project_id" defaultValue={values?.project_id ?? ""}>
              <option value="">{t("form.noProject")}</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("form.language")} htmlFor="language" hint={t("form.languageHint")} error={err("language")}>
            <NativeSelect id="language" name="language" defaultValue={values?.language ?? locale}>
              <option value="en">{t("languages.en")}</option>
              <option value="ar">{t("languages.ar")}</option>
            </NativeSelect>
          </Field>
          <Field label={t("form.currency")} htmlFor="currency" error={err("currency")}>
            <NativeSelect id="currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{currencyOption(c, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("form.taxRate")} htmlFor="tax_rate" error={err("tax_rate")}>
            <Input id="tax_rate" name="tax_rate" inputMode="decimal" defaultValue={values ? String(values.tax_rate) : "0"} aria-invalid={!!err("tax_rate")} />
          </Field>
          <Field label={kind === "quote" ? t("form.validUntil") : t("form.dueDate")} htmlFor={dateField} hint={kind === "quote" ? t("form.validUntilHint") : t("form.dueDateHint")} error={err(dateField)}>
            <Input id={dateField} name={dateField} type="date" defaultValue={values?.date ?? ""} aria-invalid={!!err(dateField)} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.content")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.titleEn")} htmlFor="title_en" error={err("title_en")}>
            <Input id="title_en" name="title_en" defaultValue={values?.title_en ?? ""} maxLength={200} />
          </Field>
          <Field label={t("form.titleAr")} htmlFor="title_ar" error={err("title_ar")}>
            <Input id="title_ar" name="title_ar" defaultValue={values?.title_ar ?? ""} maxLength={200} dir="rtl" />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.items")}</h2>
        <LineItemsEditor initial={items} currency={currency} locale={locale} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("form.sections.notes")}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("form.notesEn")} htmlFor="notes_en" error={err("notes_en")}>
            <Textarea id="notes_en" name="notes_en" defaultValue={values?.notes_en ?? ""} maxLength={4000} />
          </Field>
          <Field label={t("form.notesAr")} htmlFor="notes_ar" error={err("notes_ar")}>
            <Textarea id="notes_ar" name="notes_ar" defaultValue={values?.notes_ar ?? ""} maxLength={4000} dir="rtl" />
          </Field>
          <Field label={t("form.termsEn")} htmlFor="terms_en" error={err("terms_en")}>
            <Textarea id="terms_en" name="terms_en" defaultValue={values?.terms_en ?? ""} maxLength={4000} />
          </Field>
          <Field label={t("form.termsAr")} htmlFor="terms_ar" error={err("terms_ar")}>
            <Textarea id="terms_ar" name="terms_ar" defaultValue={values?.terms_ar ?? ""} maxLength={4000} dir="rtl" />
          </Field>
        </div>
      </section>

      <FormMessage result={result} />
      {result?.ok && mode === "edit" ? <p role="status" className="text-small text-success">{t("form.saved")}</p> : null}

      <div className="flex flex-wrap gap-3 border-t border-fog pt-6">
        <SubmitButton>{mode === "create" ? (kind === "quote" ? t("quotes.create") : t("invoices.create")) : tc("saveChanges")}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href={cancelHref}>{t("form.cancel")}</Link>
        </Button>
      </div>
    </ServerActionForm>
  );
}
