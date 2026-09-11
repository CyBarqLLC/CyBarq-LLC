"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/actions/result";
import type { CoverKind } from "@/lib/validation/content";
import { LANGUAGE_STATUSES, slugify } from "@/lib/validation/content";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { fieldError } from "@/components/ui/form-message";
import { ImageUpload } from "./image-upload";

/** Two language columns: side by side from lg, stacked below. Each column carries its own direction. */
export function LangGrid({ en, ar, className }: { en: React.ReactNode; ar: React.ReactNode; className?: string }) {
  const t = useTranslations("content.form");
  return (
    <div className={`grid gap-6 lg:grid-cols-2 ${className ?? ""}`}>
      <div dir="ltr" className="flex flex-col gap-5 border border-fog bg-white p-4 sm:p-5">
        <span className="text-label text-slate">{t("english")}</span>
        {en}
      </div>
      <div dir="rtl" className="flex flex-col gap-5 border border-fog bg-white p-4 sm:p-5">
        <span className="text-label text-slate">{t("arabic")}</span>
        {ar}
      </div>
    </div>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-h3">{title}</h2>
        {description ? <p className="mt-1 text-small text-slate">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Slug that follows the English title until the editor edits it by hand. */
export function useSlug(initialSlug: string, autoFromTitle: boolean) {
  const [slug, setSlug] = React.useState(initialSlug);
  const [touched, setTouched] = React.useState(!autoFromTitle || initialSlug !== "");
  const onTitleChange = (title: string) => {
    if (!touched) setSlug(slugify(title));
  };
  const onSlugChange = (value: string) => {
    setTouched(true);
    setSlug(value);
  };
  return { slug, onTitleChange, onSlugChange };
}

type TitleFieldsProps = {
  result: ActionResult<unknown> | null;
  defaults: { title_en?: string | null; title_ar?: string | null; slug?: string | null };
  slug: ReturnType<typeof useSlug>;
};

/** title_en, title_ar and slug, laid out as the first bilingual row. */
export function TitleFields({ result, defaults, slug }: TitleFieldsProps) {
  const t = useTranslations("content.form");
  return (
    <>
      <LangGrid
        en={
          <Field label={t("title")} htmlFor="title_en" error={fieldError(result, "title_en")}>
            <Input id="title_en" name="title_en" defaultValue={defaults.title_en ?? ""} maxLength={200} onChange={(e) => slug.onTitleChange(e.target.value)} aria-invalid={!!fieldError(result, "title_en")} />
          </Field>
        }
        ar={
          <Field label={t("title")} htmlFor="title_ar" error={fieldError(result, "title_ar")}>
            <Input id="title_ar" name="title_ar" defaultValue={defaults.title_ar ?? ""} maxLength={200} aria-invalid={!!fieldError(result, "title_ar")} />
          </Field>
        }
      />
      <Field label={t("slug")} htmlFor="slug" hint={t("slugHint")} error={fieldError(result, "slug")} required>
        <Input id="slug" name="slug" value={slug.slug} onChange={(e) => slug.onSlugChange(e.target.value)} maxLength={160} dir="ltr" className="font-mono" aria-invalid={!!fieldError(result, "slug")} />
      </Field>
    </>
  );
}

type CoverSectionProps = {
  result: ActionResult<unknown> | null;
  target: CoverKind;
  defaults: { cover_path?: string | null; cover_alt_en?: string | null; cover_alt_ar?: string | null };
  publicBase: string;
};

export function CoverSection({ result, target, defaults, publicBase }: CoverSectionProps) {
  const t = useTranslations("content.form");
  return (
    <Section title={t("cover")} description={t("coverHint")}>
      <ImageUpload target={target} name="cover_path" defaultPath={defaults.cover_path} publicBase={publicBase} alt={defaults.cover_alt_en ?? ""} />
      <LangGrid
        en={
          <Field label={t("coverAlt")} htmlFor="cover_alt_en" error={fieldError(result, "cover_alt_en")}>
            <Input id="cover_alt_en" name="cover_alt_en" defaultValue={defaults.cover_alt_en ?? ""} maxLength={200} />
          </Field>
        }
        ar={
          <Field label={t("coverAlt")} htmlFor="cover_alt_ar" error={fieldError(result, "cover_alt_ar")}>
            <Input id="cover_alt_ar" name="cover_alt_ar" defaultValue={defaults.cover_alt_ar ?? ""} maxLength={200} />
          </Field>
        }
      />
    </Section>
  );
}

type SeoSectionProps = {
  result: ActionResult<unknown> | null;
  defaults: {
    seo_title_en?: string | null;
    seo_title_ar?: string | null;
    seo_description_en?: string | null;
    seo_description_ar?: string | null;
    language_status?: (typeof LANGUAGE_STATUSES)[number] | null;
  };
};

export function SeoSection({ result, defaults }: SeoSectionProps) {
  const t = useTranslations("content.form");
  return (
    <Section title={t("seo")} description={t("seoHint")}>
      <LangGrid
        en={
          <>
            <Field label={t("seoTitle")} htmlFor="seo_title_en" error={fieldError(result, "seo_title_en")}>
              <Input id="seo_title_en" name="seo_title_en" defaultValue={defaults.seo_title_en ?? ""} maxLength={120} />
            </Field>
            <Field label={t("seoDescription")} htmlFor="seo_description_en" error={fieldError(result, "seo_description_en")}>
              <Textarea id="seo_description_en" name="seo_description_en" defaultValue={defaults.seo_description_en ?? ""} maxLength={320} className="min-h-20" />
            </Field>
          </>
        }
        ar={
          <>
            <Field label={t("seoTitle")} htmlFor="seo_title_ar" error={fieldError(result, "seo_title_ar")}>
              <Input id="seo_title_ar" name="seo_title_ar" defaultValue={defaults.seo_title_ar ?? ""} maxLength={120} />
            </Field>
            <Field label={t("seoDescription")} htmlFor="seo_description_ar" error={fieldError(result, "seo_description_ar")}>
              <Textarea id="seo_description_ar" name="seo_description_ar" defaultValue={defaults.seo_description_ar ?? ""} maxLength={320} className="min-h-20" />
            </Field>
          </>
        }
      />
      <Field label={t("languageStatus")} htmlFor="language_status" hint={t("languageStatusHint")} error={fieldError(result, "language_status")} className="max-w-sm">
        <NativeSelect id="language_status" name="language_status" defaultValue={defaults.language_status ?? "both"}>
          {LANGUAGE_STATUSES.map((v) => (
            <option key={v} value={v}>{t(`languageStatuses.${v}`)}</option>
          ))}
        </NativeSelect>
      </Field>
    </Section>
  );
}
