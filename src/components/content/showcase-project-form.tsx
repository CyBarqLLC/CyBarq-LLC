"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { PRACTICES } from "@/lib/validation/content";
import { PRACTICE_LABELS, label } from "@/lib/labels";
import { pick } from "@/i18n/bilingual";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { LangGrid, Section, TitleFields, CoverSection, SeoSection, useSlug } from "./form-shared";

export type InternalProjectOption = { id: string; code: string; name_en: string; name_ar: string | null };

type Props = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: Partial<Tables<"public_projects">>;
  internalProjects: InternalProjectOption[];
  publicBase: string;
  mode: "create" | "edit";
};

export function ShowcaseProjectForm({ action, defaults, internalProjects, publicBase, mode }: Props) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("content.form");
  const te = useTranslations("common.editor");
  const locale = useLocale() as Locale;
  const slug = useSlug(defaults.slug ?? "", mode === "create");
  const editorLabels = { link: te("link"), linkPrompt: te("linkPrompt") };

  return (
    <form action={formAction} className="flex flex-col gap-10" noValidate>
      <Section title={t("sections.content")}>
        <TitleFields result={result} defaults={defaults} slug={slug} />
        <LangGrid
          en={
            <>
              <Field label={t("summary")} htmlFor="summary_en" error={fieldError(result, "summary_en")}>
                <Textarea id="summary_en" name="summary_en" defaultValue={defaults.summary_en ?? ""} maxLength={1000} className="min-h-24" />
              </Field>
              <Field label={t("body")} htmlFor="body_en" error={fieldError(result, "body_en")}>
                <RichTextEditor name="body_en" defaultValue={defaults.body_en} dir="ltr" placeholder={te("placeholder")} labels={editorLabels} />
              </Field>
              <Field label={t("clientDisplayName")} htmlFor="client_display_name_en" hint={t("clientDisplayNameHint")} error={fieldError(result, "client_display_name_en")}>
                <Input id="client_display_name_en" name="client_display_name_en" defaultValue={defaults.client_display_name_en ?? ""} maxLength={200} />
              </Field>
              <Field label={t("services")} htmlFor="services_en" hint={t("servicesHint")} error={fieldError(result, "services_en")}>
                <Input id="services_en" name="services_en" defaultValue={(defaults.services_en ?? []).join(", ")} />
              </Field>
            </>
          }
          ar={
            <>
              <Field label={t("summary")} htmlFor="summary_ar" error={fieldError(result, "summary_ar")}>
                <Textarea id="summary_ar" name="summary_ar" defaultValue={defaults.summary_ar ?? ""} maxLength={1000} className="min-h-24" />
              </Field>
              <Field label={t("body")} htmlFor="body_ar" error={fieldError(result, "body_ar")}>
                <RichTextEditor name="body_ar" defaultValue={defaults.body_ar} dir="rtl" placeholder={te("placeholder")} labels={editorLabels} />
              </Field>
              <Field label={t("clientDisplayName")} htmlFor="client_display_name_ar" hint={t("clientDisplayNameHint")} error={fieldError(result, "client_display_name_ar")}>
                <Input id="client_display_name_ar" name="client_display_name_ar" defaultValue={defaults.client_display_name_ar ?? ""} maxLength={200} />
              </Field>
              <Field label={t("services")} htmlFor="services_ar" hint={t("servicesHint")} error={fieldError(result, "services_ar")}>
                <Input id="services_ar" name="services_ar" defaultValue={(defaults.services_ar ?? []).join("، ")} />
              </Field>
            </>
          }
        />
      </Section>

      <Section title={t("sections.classification")}>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label={t("practice")} htmlFor="practice" error={fieldError(result, "practice")} required>
            <NativeSelect id="practice" name="practice" defaultValue={defaults.practice ?? "development"}>
              {PRACTICES.map((p) => (
                <option key={p} value={p}>{label(PRACTICE_LABELS, p, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("year")} htmlFor="year" error={fieldError(result, "year")}>
            <Input id="year" name="year" type="number" inputMode="numeric" min={1990} max={2100} defaultValue={defaults.year ?? ""} dir="ltr" />
          </Field>
          <Field label={t("position")} htmlFor="position" hint={t("positionHint")} error={fieldError(result, "position")}>
            <Input id="position" name="position" type="number" inputMode="numeric" min={0} defaultValue={defaults.position ?? 0} dir="ltr" />
          </Field>
        </div>
        <Field label={t("internalProject")} htmlFor="internal_project_id" hint={t("internalProjectHint")} error={fieldError(result, "internal_project_id")} className="max-w-lg">
          <NativeSelect id="internal_project_id" name="internal_project_id" defaultValue={defaults.internal_project_id ?? ""}>
            <option value="">{t("noInternalProject")}</option>
            {internalProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.code} · {pick(p, "name", locale)}</option>
            ))}
          </NativeSelect>
        </Field>
      </Section>

      <CoverSection result={result} target="projects" defaults={defaults} publicBase={publicBase} />
      <SeoSection result={result} defaults={defaults} />

      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{mode === "create" ? t("createDraft") : t("save")}</SubmitButton>
        {result?.ok && mode === "edit" ? <span role="status" className="text-small text-success">{t("saved")}</span> : null}
      </div>
    </form>
  );
}
