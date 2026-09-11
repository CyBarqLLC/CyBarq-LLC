"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Json } from "@/lib/supabase/database.types";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { formToObject } from "@/lib/validation/common";
import {
  editorialSchema,
  showcaseProjectSchema,
  caseStudySchema,
  workflowSchema,
  deleteContentSchema,
  authorSchema,
  categorySchema,
  tagSchema,
  idSchema,
  imageUploadSchema,
  imageExtension,
  slugify,
  localDateTimeToIso,
  readingMinutes,
  workflowActionsFor,
  WORKFLOW_TARGET,
  CONTENT_SEGMENTS,
  COVER_KINDS,
  EDITORIAL_TABLES,
  type EditorialTable,
  type ContentTable,
  type CoverKind,
  type ImpactItem,
} from "@/lib/validation/content";
import { sanitizeRichText, stripHtml } from "@/lib/sanitize";
import { signedUploadUrl } from "@/lib/storage";

type UploadTicket = { signedUrl: string; token: string; path: string };

function nul<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

function clean(html: string | undefined): string | null {
  if (!html) return null;
  const out = sanitizeRichText(html).trim();
  return out === "" || out === "<p></p>" ? null : out;
}

function revalidateContent(table: ContentTable) {
  revalidatePath("/[locale]/app/content", "page");
  revalidatePath(`/[locale]/app/content/${CONTENT_SEGMENTS[table]}`, "page");
  revalidatePath(`/[locale]/app/content/${CONTENT_SEGMENTS[table]}/[id]`, "page");
  // Public pages read the same rows.
  revalidatePath("/[locale]", "layout");
}

async function redirectTo(href: string): Promise<never> {
  const locale = (await getLocale()) as Locale;
  redirect({ href, locale });
  throw new Error("redirect did not interrupt the action");
}

function isEditorial(table: ContentTable): table is EditorialTable {
  return (EDITORIAL_TABLES as readonly string[]).includes(table);
}

// ---------------------------------------------------------------------------
// News and articles (same editorial shape)
// ---------------------------------------------------------------------------

function editorialRow(input: ReturnType<typeof editorialSchema.parse>, userId: string) {
  const slug = slugify(input.slug || input.title_en || input.title_ar || "");
  return {
    slug,
    title_en: input.title_en ?? "",
    title_ar: input.title_ar ?? "",
    excerpt_en: nul(input.excerpt_en),
    excerpt_ar: nul(input.excerpt_ar),
    body_en: clean(input.body_en),
    body_ar: clean(input.body_ar),
    author_id: nul(input.author_id),
    category_id: nul(input.category_id),
    cover_path: nul(input.cover_path),
    cover_alt_en: nul(input.cover_alt_en),
    cover_alt_ar: nul(input.cover_alt_ar),
    seo_title_en: nul(input.seo_title_en),
    seo_title_ar: nul(input.seo_title_ar),
    seo_description_en: nul(input.seo_description_en),
    seo_description_ar: nul(input.seo_description_ar),
    language_status: input.language_status,
    scheduled_for: input.scheduled_for ? localDateTimeToIso(input.scheduled_for) : null,
    updated_by: userId,
  };
}

function articleMinutes(row: { body_en: string | null; body_ar: string | null }): number {
  return readingMinutes(stripHtml(row.body_en || row.body_ar || ""));
}

async function syncEditorialTags(table: EditorialTable, id: string, tagIds: string[]) {
  const supabase = await createClient();
  if (table === "news_posts") {
    const { error: delError } = await supabase.from("news_tags").delete().eq("news_id", id);
    if (delError) throw delError;
    if (tagIds.length > 0) {
      const { error } = await supabase.from("news_tags").insert(tagIds.map((tag_id) => ({ news_id: id, tag_id })));
      if (error) throw error;
    }
  } else {
    const { error: delError } = await supabase.from("article_tags").delete().eq("article_id", id);
    if (delError) throw delError;
    if (tagIds.length > 0) {
      const { error } = await supabase.from("article_tags").insert(tagIds.map((tag_id) => ({ article_id: id, tag_id })));
      if (error) throw error;
    }
  }
}

export async function createEditorial(table: EditorialTable, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = editorialSchema.parse(formToObject(formData));
    const row = editorialRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const base = { ...row, status: "draft" as const, created_by: viewer.userId };
    const { data, error } =
      table === "articles"
        ? await supabase.from("articles").insert({ ...base, reading_minutes: articleMinutes(row) }).select("id").single()
        : await supabase.from("news_posts").insert(base).select("id").single();
    if (error) throw error;
    await syncEditorialTags(table, data.id, input.tag_ids);
    revalidateContent(table);
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo(`/app/content/${CONTENT_SEGMENTS[table]}/${result.data.id}`);
  return result;
}

export async function updateEditorial(table: EditorialTable, id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = editorialSchema.parse(formToObject(formData));
    const row = editorialRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } =
      table === "articles"
        ? await supabase.from("articles").update({ ...row, reading_minutes: articleMinutes(row) }).eq("id", id).select("id").maybeSingle()
        : await supabase.from("news_posts").update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    await syncEditorialTags(table, id, input.tag_ids);
    revalidateContent(table);
    return ok({ id });
  });
}

// ---------------------------------------------------------------------------
// Public projects
// ---------------------------------------------------------------------------

function showcaseProjectRow(input: ReturnType<typeof showcaseProjectSchema.parse>, userId: string) {
  return {
    slug: slugify(input.slug || input.title_en || input.title_ar || ""),
    title_en: input.title_en ?? "",
    title_ar: input.title_ar ?? "",
    summary_en: nul(input.summary_en),
    summary_ar: nul(input.summary_ar),
    body_en: clean(input.body_en),
    body_ar: clean(input.body_ar),
    practice: input.practice,
    client_display_name_en: nul(input.client_display_name_en),
    client_display_name_ar: nul(input.client_display_name_ar),
    year: nul(input.year),
    services_en: input.services_en,
    services_ar: input.services_ar,
    cover_path: nul(input.cover_path),
    cover_alt_en: nul(input.cover_alt_en),
    cover_alt_ar: nul(input.cover_alt_ar),
    seo_title_en: nul(input.seo_title_en),
    seo_title_ar: nul(input.seo_title_ar),
    seo_description_en: nul(input.seo_description_en),
    seo_description_ar: nul(input.seo_description_ar),
    language_status: input.language_status,
    position: input.position,
    internal_project_id: nul(input.internal_project_id),
    updated_by: userId,
  };
}

export async function createPublicProject(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = showcaseProjectSchema.parse(formToObject(formData));
    const row = showcaseProjectRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("public_projects").insert({ ...row, status: "draft", created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    revalidateContent("public_projects");
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo(`/app/content/projects/${result.data.id}`);
  return result;
}

export async function updatePublicProject(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = showcaseProjectSchema.parse(formToObject(formData));
    const row = showcaseProjectRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("public_projects").update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    revalidateContent("public_projects");
    return ok({ id });
  });
}

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

function impactJson(items: ImpactItem[]): Json {
  return items.map((i) => ({ label_en: i.label_en, label_ar: i.label_ar, value: i.value, verified: i.verified }));
}

function caseStudyRow(input: ReturnType<typeof caseStudySchema.parse>, userId: string) {
  return {
    slug: slugify(input.slug || input.title_en || input.title_ar || ""),
    title_en: input.title_en ?? "",
    title_ar: input.title_ar ?? "",
    summary_en: nul(input.summary_en),
    summary_ar: nul(input.summary_ar),
    challenge_en: clean(input.challenge_en),
    challenge_ar: clean(input.challenge_ar),
    solution_en: clean(input.solution_en),
    solution_ar: clean(input.solution_ar),
    implementation_en: clean(input.implementation_en),
    implementation_ar: clean(input.implementation_ar),
    outcome_en: clean(input.outcome_en),
    outcome_ar: clean(input.outcome_ar),
    impact: impactJson(input.impact),
    practice: input.practice,
    client_display_name_en: nul(input.client_display_name_en),
    client_display_name_ar: nul(input.client_display_name_ar),
    industry_en: nul(input.industry_en),
    industry_ar: nul(input.industry_ar),
    year: nul(input.year),
    cover_path: nul(input.cover_path),
    cover_alt_en: nul(input.cover_alt_en),
    cover_alt_ar: nul(input.cover_alt_ar),
    seo_title_en: nul(input.seo_title_en),
    seo_title_ar: nul(input.seo_title_ar),
    seo_description_en: nul(input.seo_description_en),
    seo_description_ar: nul(input.seo_description_ar),
    language_status: input.language_status,
    position: input.position,
    internal_project_id: nul(input.internal_project_id),
    updated_by: userId,
  };
}

export async function createCaseStudy(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = caseStudySchema.parse(formToObject(formData));
    const row = caseStudyRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("case_studies").insert({ ...row, status: "draft", created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    revalidateContent("case_studies");
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo(`/app/content/case-studies/${result.data.id}`);
  return result;
}

export async function updateCaseStudy(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = caseStudySchema.parse(formToObject(formData));
    const row = caseStudyRow(input, viewer.userId);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("case_studies").update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    revalidateContent("case_studies");
    return ok({ id });
  });
}

// ---------------------------------------------------------------------------
// Workflow (shared by all four tables). The database trigger is the authority
// for content.publish; the checks here only produce friendlier messages.
// ---------------------------------------------------------------------------

export async function changeContentStatus(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("content.write", "action");
    const input = workflowSchema.parse(formToObject(formData));
    const target = WORKFLOW_TARGET[input.action];
    if ((target === "published" || target === "scheduled") && !viewer.can("content.publish")) {
      return fail("Publishing requires the content.publish permission.", "FORBIDDEN");
    }
    const supabase = await createClient();
    const { data: current } = await supabase.from(input.table).select("id, status").eq("id", input.id).maybeSingle();
    if (!current) return fail("Not found.", "NOT_FOUND");
    if (!workflowActionsFor(current.status, input.table).includes(input.action)) {
      return fail("This action is not available in the current status.", "VALIDATION");
    }
    let scheduledFor: string | null | undefined;
    if (input.action === "schedule") {
      if (!isEditorial(input.table)) return fail("Only news and articles can be scheduled.", "VALIDATION");
      scheduledFor = input.scheduled_for ? localDateTimeToIso(input.scheduled_for) : null;
      if (!scheduledFor) return fail("Choose a date and time to publish.", "VALIDATION");
      if (new Date(scheduledFor).getTime() <= Date.now()) return fail("The scheduled time must be in the future.", "VALIDATION");
    }
    const patch: { status: Enums<"content_status">; updated_by: string } = { status: target, updated_by: viewer.userId };
    const withSchedule = scheduledFor !== undefined ? { ...patch, scheduled_for: scheduledFor } : patch;
    let error: { code?: string; message: string } | null = null;
    switch (input.table) {
      case "news_posts":
        ({ error } = await supabase.from("news_posts").update(withSchedule).eq("id", input.id).eq("status", current.status));
        break;
      case "articles":
        ({ error } = await supabase.from("articles").update(withSchedule).eq("id", input.id).eq("status", current.status));
        break;
      case "public_projects":
        ({ error } = await supabase.from("public_projects").update(patch).eq("id", input.id).eq("status", current.status));
        break;
      case "case_studies":
        ({ error } = await supabase.from("case_studies").update(patch).eq("id", input.id).eq("status", current.status));
        break;
    }
    if (error) throw error;
    revalidateContent(input.table);
    return ok(undefined);
  });
}

export async function deleteContent(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = deleteContentSchema.safeParse(formToObject(formData));
  const result = await runAction(async () => {
    await requirePermission("content.publish", "action");
    if (!parsed.success) throw parsed.error;
    const input = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase.from(input.table).delete().eq("id", input.id).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Not found.", "NOT_FOUND");
    revalidateContent(input.table);
    return ok(undefined);
  });
  if (result.ok && parsed.success) await redirectTo(`/app/content/${CONTENT_SEGMENTS[parsed.data.table]}`);
  return result;
}

// ---------------------------------------------------------------------------
// Images (public-content bucket)
// ---------------------------------------------------------------------------

export async function requestCoverUpload(kind: CoverKind, file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    await requirePermission("content.write", "action");
    if (!(COVER_KINDS as readonly string[]).includes(kind)) return fail("Invalid upload target.", "VALIDATION");
    const parsed = imageUploadSchema.parse(file);
    const path = `covers/${kind}/${randomUUID()}.${imageExtension(parsed.type)}`;
    const ticket = await signedUploadUrl("public-content", path);
    return ok(ticket);
  });
}

export async function requestAvatarUpload(file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    await requirePermission("content.write", "action");
    const parsed = imageUploadSchema.parse(file);
    const path = `authors/${randomUUID()}.${imageExtension(parsed.type)}`;
    const ticket = await signedUploadUrl("public-content", path);
    return ok(ticket);
  });
}

// ---------------------------------------------------------------------------
// Authors, categories, tags
// ---------------------------------------------------------------------------

function authorRow(input: ReturnType<typeof authorSchema.parse>) {
  return {
    name_en: input.name_en,
    name_ar: input.name_ar,
    title_en: nul(input.title_en),
    title_ar: nul(input.title_ar),
    bio_en: nul(input.bio_en),
    bio_ar: nul(input.bio_ar),
    avatar_path: nul(input.avatar_path),
    user_id: nul(input.user_id),
  };
}

export async function createAuthor(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const input = authorSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("authors").insert(authorRow(input)).select("id").single();
    if (error) throw error;
    revalidatePath("/[locale]/app/content/authors", "page");
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo("/app/content/authors");
  return result;
}

export async function updateAuthor(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("content.write", "action");
    const input = authorSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("authors").update(authorRow(input)).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    revalidatePath("/[locale]/app/content/authors", "page");
    revalidatePath("/[locale]/app/content/authors/[id]", "page");
    return ok({ id });
  });
}

export async function deleteAuthor(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const { id } = idSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/[locale]/app/content/authors", "page");
    return ok(undefined);
  });
  if (result.ok) await redirectTo("/app/content/authors");
  return result;
}

function categoryRow(input: ReturnType<typeof categorySchema.parse>) {
  return {
    kind: input.kind,
    slug: slugify(input.slug || input.name_en),
    name_en: input.name_en,
    name_ar: input.name_ar,
    position: input.position,
  };
}

export async function createCategory(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const input = categorySchema.parse(formToObject(formData));
    const row = categoryRow(input);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").insert(row).select("id").single();
    if (error) throw error;
    revalidatePath("/[locale]/app/content/categories", "page");
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo("/app/content/categories");
  return result;
}

export async function updateCategory(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("content.write", "action");
    const input = categorySchema.parse(formToObject(formData));
    const row = categoryRow(input);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    revalidatePath("/[locale]/app/content/categories", "page");
    revalidatePath("/[locale]/app/content/categories/[id]", "page");
    return ok({ id });
  });
}

export async function deleteCategory(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const { id } = idSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/[locale]/app/content/categories", "page");
    return ok(undefined);
  });
  if (result.ok) await redirectTo("/app/content/categories");
  return result;
}

function tagRow(input: ReturnType<typeof tagSchema.parse>) {
  return { slug: slugify(input.slug || input.name_en), name_en: input.name_en, name_ar: input.name_ar };
}

export async function createTag(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const input = tagSchema.parse(formToObject(formData));
    const row = tagRow(input);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("tags").insert(row).select("id").single();
    if (error) throw error;
    revalidatePath("/[locale]/app/content/tags", "page");
    return ok({ id: data.id });
  });
  if (result.ok) await redirectTo("/app/content/tags");
  return result;
}

export async function updateTag(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("content.write", "action");
    const input = tagSchema.parse(formToObject(formData));
    const row = tagRow(input);
    if (!row.slug) return fail("A slug is required.", "VALIDATION");
    const supabase = await createClient();
    const { data, error } = await supabase.from("tags").update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Not found.", "NOT_FOUND");
    revalidatePath("/[locale]/app/content/tags", "page");
    revalidatePath("/[locale]/app/content/tags/[id]", "page");
    return ok({ id });
  });
}

export async function deleteTag(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const result = await runAction(async () => {
    await requirePermission("content.write", "action");
    const { id } = idSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/[locale]/app/content/tags", "page");
    return ok(undefined);
  });
  if (result.ok) await redirectTo("/app/content/tags");
  return result;
}
