"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { CATEGORY_KINDS } from "@/lib/validation/content";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ImageUpload } from "./image-upload";
import { LangGrid, useSlug } from "./form-shared";
import { ServerActionForm } from "@/components/ui/server-action-form";

type FormAction = (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;

export type EmployeeOption = { user_id: string; full_name: string; full_name_ar: string | null };

export function AuthorForm({ action, defaults, employees, publicBase, mode }: { action: FormAction; defaults: Partial<Tables<"authors">>; employees: EmployeeOption[]; publicBase: string; mode: "create" | "edit" }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("content.authors.form");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-8" noValidate>
      <LangGrid
        en={
          <>
            <Field label={t("name")} htmlFor="name_en" error={fieldError(result, "name_en")} required>
              <Input id="name_en" name="name_en" defaultValue={defaults.name_en ?? ""} required maxLength={120} />
            </Field>
            <Field label={t("title")} htmlFor="title_en" error={fieldError(result, "title_en")}>
              <Input id="title_en" name="title_en" defaultValue={defaults.title_en ?? ""} maxLength={120} />
            </Field>
            <Field label={t("bio")} htmlFor="bio_en" error={fieldError(result, "bio_en")}>
              <Textarea id="bio_en" name="bio_en" defaultValue={defaults.bio_en ?? ""} maxLength={2000} />
            </Field>
          </>
        }
        ar={
          <>
            <Field label={t("name")} htmlFor="name_ar" error={fieldError(result, "name_ar")} required>
              <Input id="name_ar" name="name_ar" defaultValue={defaults.name_ar ?? ""} required maxLength={120} />
            </Field>
            <Field label={t("title")} htmlFor="title_ar" error={fieldError(result, "title_ar")}>
              <Input id="title_ar" name="title_ar" defaultValue={defaults.title_ar ?? ""} maxLength={120} />
            </Field>
            <Field label={t("bio")} htmlFor="bio_ar" error={fieldError(result, "bio_ar")}>
              <Textarea id="bio_ar" name="bio_ar" defaultValue={defaults.bio_ar ?? ""} maxLength={2000} />
            </Field>
          </>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-graphite">{t("avatar")}</span>
          <ImageUpload target="avatar" name="avatar_path" defaultPath={defaults.avatar_path} publicBase={publicBase} alt={defaults.name_en ?? ""} />
        </div>
        <Field label={t("employee")} htmlFor="user_id" hint={t("employeeHint")} error={fieldError(result, "user_id")}>
          <NativeSelect id="user_id" name="user_id" defaultValue={defaults.user_id ?? ""}>
            <option value="">{t("noEmployee")}</option>
            {employees.map((e) => (
              <option key={e.user_id} value={e.user_id}>{locale === "ar" ? e.full_name_ar || e.full_name : e.full_name}</option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{mode === "create" ? tc("create") : tc("saveChanges")}</SubmitButton>
        {result?.ok && mode === "edit" ? <span role="status" className="text-small text-success">{t("saved")}</span> : null}
      </div>
    </ServerActionForm>
  );
}

export function CategoryForm({ action, defaults, mode }: { action: FormAction; defaults: Partial<Tables<"categories">>; mode: "create" | "edit" }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("content.categories.form");
  const tc = useTranslations("common");
  const slug = useSlug(defaults.slug ?? "", mode === "create");
  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("kind")} htmlFor="kind" error={fieldError(result, "kind")} required>
          <NativeSelect id="kind" name="kind" defaultValue={defaults.kind ?? "news"}>
            {CATEGORY_KINDS.map((k) => (
              <option key={k} value={k}>{t(`kinds.${k}`)}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t("position")} htmlFor="position" error={fieldError(result, "position")}>
          <Input id="position" name="position" type="number" inputMode="numeric" min={0} defaultValue={defaults.position ?? 0} dir="ltr" />
        </Field>
        <Field label={t("nameEn")} htmlFor="name_en" error={fieldError(result, "name_en")} required>
          <Input id="name_en" name="name_en" defaultValue={defaults.name_en ?? ""} required maxLength={120} dir="ltr" onChange={(e) => slug.onTitleChange(e.target.value)} />
        </Field>
        <Field label={t("nameAr")} htmlFor="name_ar" error={fieldError(result, "name_ar")} required>
          <Input id="name_ar" name="name_ar" defaultValue={defaults.name_ar ?? ""} required maxLength={120} dir="rtl" />
        </Field>
        <Field label={t("slug")} htmlFor="slug" error={fieldError(result, "slug")} className="md:col-span-2">
          <Input id="slug" name="slug" value={slug.slug} onChange={(e) => slug.onSlugChange(e.target.value)} maxLength={120} dir="ltr" className="font-mono" />
        </Field>
      </div>
      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{mode === "create" ? tc("create") : tc("saveChanges")}</SubmitButton>
        {result?.ok && mode === "edit" ? <span role="status" className="text-small text-success">{t("saved")}</span> : null}
      </div>
    </ServerActionForm>
  );
}

export function TagForm({ action, defaults, mode }: { action: FormAction; defaults: Partial<Tables<"tags">>; mode: "create" | "edit" }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("content.tags.form");
  const tc = useTranslations("common");
  const slug = useSlug(defaults.slug ?? "", mode === "create");
  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("nameEn")} htmlFor="name_en" error={fieldError(result, "name_en")} required>
          <Input id="name_en" name="name_en" defaultValue={defaults.name_en ?? ""} required maxLength={80} dir="ltr" onChange={(e) => slug.onTitleChange(e.target.value)} />
        </Field>
        <Field label={t("nameAr")} htmlFor="name_ar" error={fieldError(result, "name_ar")} required>
          <Input id="name_ar" name="name_ar" defaultValue={defaults.name_ar ?? ""} required maxLength={80} dir="rtl" />
        </Field>
        <Field label={t("slug")} htmlFor="slug" error={fieldError(result, "slug")} className="md:col-span-2">
          <Input id="slug" name="slug" value={slug.slug} onChange={(e) => slug.onSlugChange(e.target.value)} maxLength={120} dir="ltr" className="font-mono" />
        </Field>
      </div>
      <FormMessage result={result} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{mode === "create" ? tc("create") : tc("saveChanges")}</SubmitButton>
        {result?.ok && mode === "edit" ? <span role="status" className="text-small text-success">{t("saved")}</span> : null}
      </div>
    </ServerActionForm>
  );
}
