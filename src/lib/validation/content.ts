import { z } from "zod";
import type { Enums } from "@/lib/supabase/database.types";
import { requiredString, optionalString, optionalUuid, uuid } from "./common";

export const CONTENT_STATUSES = ["draft", "review", "scheduled", "published", "archived"] as const satisfies readonly Enums<"content_status">[];
export const LANGUAGE_STATUSES = ["both", "en_only", "ar_only"] as const satisfies readonly Enums<"language_status">[];
export const PRACTICES = ["cybersecurity", "development", "ai", "infrastructure", "mixed"] as const satisfies readonly Enums<"practice">[];
export const CATEGORY_KINDS = ["news", "article", "project", "case_study"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/** Editorial tables share one column set; showcase tables share the publish workflow. */
export const EDITORIAL_TABLES = ["news_posts", "articles"] as const;
export const SHOWCASE_TABLES = ["public_projects", "case_studies"] as const;
export const CONTENT_TABLES = [...EDITORIAL_TABLES, ...SHOWCASE_TABLES] as const;
export type EditorialTable = (typeof EDITORIAL_TABLES)[number];
export type ShowcaseTable = (typeof SHOWCASE_TABLES)[number];
export type ContentTable = (typeof CONTENT_TABLES)[number];

/** URL segment under /app/content for each table. */
export const CONTENT_SEGMENTS: Record<ContentTable, string> = {
  news_posts: "news",
  articles: "articles",
  public_projects: "projects",
  case_studies: "case-studies",
};
export const CATEGORY_KIND_FOR_TABLE: Record<EditorialTable, CategoryKind> = { news_posts: "news", articles: "article" };

export const WORKFLOW_ACTIONS = ["submit_review", "publish", "schedule", "unpublish", "archive", "restore"] as const;
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number];

/** Which workflow actions apply from each status. Schedule only exists for editorial content. */
export function workflowActionsFor(status: Enums<"content_status">, table: ContentTable): WorkflowAction[] {
  const editorial = (EDITORIAL_TABLES as readonly string[]).includes(table);
  switch (status) {
    case "draft":
      return editorial ? ["submit_review", "publish", "schedule"] : ["publish"];
    case "review":
      return editorial ? ["publish", "schedule", "unpublish"] : ["publish", "unpublish"];
    case "scheduled":
      return ["publish", "unpublish"];
    case "published":
      return ["unpublish", "archive"];
    case "archived":
      return ["restore"];
  }
}

export const WORKFLOW_TARGET: Record<WorkflowAction, Enums<"content_status">> = {
  submit_review: "review",
  publish: "published",
  schedule: "scheduled",
  unpublish: "draft",
  archive: "archived",
  restore: "draft",
};

/** Mirrors private.slugify() in the database. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Time zone helpers for scheduled_for. Editors enter Amman local time in a
// datetime-local input; the database stores UTC.
// ---------------------------------------------------------------------------
const TIME_ZONE = "Asia/Amman";

function tzOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asIfUtc - utcMs;
}

/** "2026-09-11T10:30" (Amman) to an ISO instant. Returns null when the value is not a valid local time. */
export function localDateTimeToIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const guess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  const instant = guess - tzOffsetMs(guess);
  const date = new Date(instant);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO instant to "YYYY-MM-DDTHH:mm" in Amman time for a datetime-local input. */
export function isoToLocalDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

const optionalLocalDateTime = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/).optional(),
);

const richText = optionalString(300000);
const idList = z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(uuid).max(50));
const optionalYear = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? undefined : Number(v)) : v),
  z.number().int().min(1990).max(2100).optional(),
);
const position = z.preprocess((v) => (typeof v === "string" ? (v.trim() === "" ? 0 : Number(v)) : v), z.number().int().min(0).max(10000));
/** "a, b, c" to ["a", "b", "c"]. */
const csvList = z.preprocess(
  (v) => (typeof v === "string" ? v.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean) : v),
  z.array(z.string().max(120)).max(30),
);

const bilingualTitle = {
  title_en: optionalString(200),
  title_ar: optionalString(200),
  slug: optionalString(160),
};

const coverFields = {
  cover_path: optionalString(300),
  cover_alt_en: optionalString(200),
  cover_alt_ar: optionalString(200),
};

const seoFields = {
  seo_title_en: optionalString(120),
  seo_title_ar: optionalString(120),
  seo_description_en: optionalString(320),
  seo_description_ar: optionalString(320),
  language_status: z.enum(LANGUAGE_STATUSES),
};

const requireOneTitle = <T extends { title_en?: string; title_ar?: string }>(v: T) => Boolean(v.title_en || v.title_ar);
const titleMessage = { message: "Enter a title in at least one language.", path: ["title_en"] };

export const editorialSchema = z
  .object({
    ...bilingualTitle,
    excerpt_en: optionalString(500),
    excerpt_ar: optionalString(500),
    body_en: richText,
    body_ar: richText,
    author_id: optionalUuid,
    category_id: optionalUuid,
    tag_ids: idList,
    ...coverFields,
    ...seoFields,
    scheduled_for: optionalLocalDateTime,
  })
  .refine(requireOneTitle, titleMessage);
export type EditorialInput = z.infer<typeof editorialSchema>;

export const showcaseProjectSchema = z
  .object({
    ...bilingualTitle,
    summary_en: optionalString(1000),
    summary_ar: optionalString(1000),
    body_en: richText,
    body_ar: richText,
    practice: z.enum(PRACTICES),
    client_display_name_en: optionalString(200),
    client_display_name_ar: optionalString(200),
    year: optionalYear,
    services_en: csvList,
    services_ar: csvList,
    ...coverFields,
    ...seoFields,
    position,
    internal_project_id: optionalUuid,
  })
  .refine(requireOneTitle, titleMessage);
export type ShowcaseProjectInput = z.infer<typeof showcaseProjectSchema>;

export const impactItemSchema = z.object({
  label_en: z.string().trim().max(120),
  label_ar: z.string().trim().max(120),
  value: z.string().trim().max(60),
  verified: z.boolean(),
});
export type ImpactItem = z.infer<typeof impactItemSchema>;

const impactList = z.preprocess(
  (v) => {
    if (typeof v !== "string") return v;
    if (v.trim() === "") return [];
    try {
      return JSON.parse(v) as unknown;
    } catch {
      return v;
    }
  },
  z.array(impactItemSchema).max(20),
);

export const caseStudySchema = z
  .object({
    ...bilingualTitle,
    summary_en: optionalString(1000),
    summary_ar: optionalString(1000),
    challenge_en: richText,
    challenge_ar: richText,
    solution_en: richText,
    solution_ar: richText,
    implementation_en: richText,
    implementation_ar: richText,
    outcome_en: richText,
    outcome_ar: richText,
    impact: impactList,
    practice: z.enum(PRACTICES),
    client_display_name_en: optionalString(200),
    client_display_name_ar: optionalString(200),
    industry_en: optionalString(120),
    industry_ar: optionalString(120),
    year: optionalYear,
    ...coverFields,
    ...seoFields,
    position,
    internal_project_id: optionalUuid,
  })
  .refine(requireOneTitle, titleMessage);
export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const workflowSchema = z.object({
  table: z.enum(CONTENT_TABLES),
  id: uuid,
  action: z.enum(WORKFLOW_ACTIONS),
  scheduled_for: optionalLocalDateTime,
});

export const deleteContentSchema = z.object({ table: z.enum(CONTENT_TABLES), id: uuid });

export const authorSchema = z.object({
  name_en: requiredString(120),
  name_ar: requiredString(120),
  title_en: optionalString(120),
  title_ar: optionalString(120),
  bio_en: optionalString(2000),
  bio_ar: optionalString(2000),
  avatar_path: optionalString(300),
  user_id: optionalUuid,
});
export type AuthorInput = z.infer<typeof authorSchema>;

export const categorySchema = z.object({
  kind: z.enum(CATEGORY_KINDS),
  slug: optionalString(120),
  name_en: requiredString(120),
  name_ar: requiredString(120),
  position,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  slug: optionalString(120),
  name_en: requiredString(80),
  name_ar: requiredString(80),
});
export type TagInput = z.infer<typeof tagSchema>;

export const idSchema = z.object({ id: uuid });

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/avif"] as const;
export const imageUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(10 * 1024 * 1024),
  type: z.enum(IMAGE_TYPES),
});
export const COVER_KINDS = ["news", "articles", "projects", "case-studies"] as const;
export type CoverKind = (typeof COVER_KINDS)[number];

const EXT_FOR_TYPE: Record<(typeof IMAGE_TYPES)[number], string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};
export function imageExtension(type: (typeof IMAGE_TYPES)[number]): string {
  return EXT_FOR_TYPE[type];
}

/** Word count based reading time (200 words per minute, minimum 1). */
export function readingMinutes(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
