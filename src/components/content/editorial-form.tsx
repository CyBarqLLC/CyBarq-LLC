"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { isoToLocalDateTime, type EditorialTable, CONTENT_SEGMENTS, type CoverKind } from "@/lib/validation/content";
import { pick } from "@/i18n/bilingual";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { LangGrid, Section, TitleFields, CoverSection, SeoSection, useSlug } from "./form-shared";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type AuthorOption = { id: string; name_en: string; name_ar: string };
export type CategoryOption = { id: string; name_en: string; name_ar: string };
export type TagOption = { id: string; name_en: string; name_ar: string };

type EditorialFormProps = {
  table: EditorialTable;
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  defaults: Partial<Tables<"articles">>;
  authors: AuthorOption[];
  categories: CategoryOption[];
  tags: TagOption[];
  selectedTagIds: string[];
  publicBase: string;
  mode: "create" | "edit";
};

export function EditorialForm({ table, action, defaults, authors, categories, tags, selectedTagIds, publicBase, mode }: EditorialFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("content.form");
  const te = useTranslations("common.editor");
  const locale = useLocale() as Locale;
  const slug = useSlug(defaults.slug ?? "", mode === "create");
  const coverTarget: CoverKind = CONTENT_SEGMENTS[table] === "news" ? "news" : "articles";
  const editorLabels = { link: te("link"), linkPrompt: te("linkPrompt") };

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-10" noValidate>
      <Section title={t("sections.content")}>
        <TitleFields result={result} defaults={defaults} slug={slug} />
        <LangGrid
          en={
            <>
              <Field label={t("excerpt")} htmlFor="excerpt_en" error={fieldError(result, "excerpt_en")}>
                <Textarea id="excerpt_en" name="excerpt_en" defaultValue={defaults.excerpt_en ?? ""} maxLength={500} className="min-h-24" />
              </Field>
              <Field label={t("body")} htmlFor="body_en" error={fieldError(result, "body_en")}>
                <RichTextEditor name="body_en" defaultValue={defaults.body_en} dir="ltr" placeholder={te("placeholder")} labels={editorLabels} />
              </Field>
            </>
          }
          ar={
            <>
              <Field label={t("excerpt")} htmlFor="excerpt_ar" error={fieldError(result, "excerpt_ar")}>
                <Textarea id="excerpt_ar" name="excerpt_ar" defaultValue={defaults.excerpt_ar ?? ""} maxLength={500} className="min-h-24" />
              </Field>
              <Field label={t("body")} htmlFor="body_ar" error={fieldError(result, "body_ar")}>
                <RichTextEditor name="body_ar" defaultValue={defaults.body_ar} dir="rtl" placeholder={te("placeholder")} labels={editorLabels} />
              </Field>
            </>
          }
        />
      </Section>

      <Section title={t("sections.classification")}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={t("author")} htmlFor="author_id" error={fieldError(result, "author_id")}>
            <NativeSelect id="author_id" name="author_id" defaultValue={defaults.author_id ?? ""}>
              <option value="">{t("noAuthor")}</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{pick(a, "name", locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("category")} htmlFor="category_id" error={fieldError(result, "category_id")}>
            <NativeSelect id="category_id" name="category_id" defaultValue={defaults.category_id ?? ""}>
              <option value="">{t("noCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{pick(c, "name", locale)}</option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-label text-graphite">{t("tags")}</legend>
          {tags.length === 0 ? (
            <p className="text-small text-slate">{t("noTags")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex cursor-pointer items-center gap-2 border border-fog bg-white px-3 py-2 text-small has-checked:border-graphite has-checked:bg-ice">
                  <input type="checkbox" name="tag_ids" value={tag.id} defaultChecked={selectedTagIds.includes(tag.id)} className="size-4 accent-graphite" />
                  {pick(tag, "name", locale)}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        {defaults.status === "scheduled" ? (
          <Field label={t("scheduledFor")} htmlFor="scheduled_for" hint={t("scheduledForHint")} error={fieldError(result, "scheduled_for")} className="max-w-sm">
            <Input id="scheduled_for" name="scheduled_for" type="datetime-local" defaultValue={isoToLocalDateTime(defaults.scheduled_for)} dir="ltr" />
          </Field>
        ) : null}
      </Section>

      <CoverSection result={result} target={coverTarget} defaults={defaults} publicBase={publicBase} />
      <SeoSection result={result} defaults={defaults} />

      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{mode === "create" ? t("createDraft") : t("save")}</SubmitButton>
        {result?.ok && mode === "edit" ? <span role="status" className="text-small text-success">{t("saved")}</span> : null}
      </div>
    </ServerActionForm>
  );
}
