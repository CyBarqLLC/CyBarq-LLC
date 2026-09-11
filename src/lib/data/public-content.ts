import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/lib/supabase/database.types";
import { publicUrl } from "@/lib/storage";
import type { Locale } from "@/i18n/routing";

/**
 * Read helpers for the public website. Every query uses the anonymous client
 * (no cookies, cacheable), filters on published rows explicitly (RLS enforces
 * the same) and lists its columns (anon holds column level grants on
 * public_projects and case_studies, so `select *` is refused there).
 *
 * List helpers never throw: a missing or unreachable database yields an empty
 * list and a server side log line, so the site still renders.
 */

type ProjectRow = Tables<"public_projects">;
type CaseStudyRow = Tables<"case_studies">;
type NewsRow = Tables<"news_posts">;
type ArticleRow = Tables<"articles">;
type AuthorRow = Tables<"authors">;
type CategoryRow = Tables<"categories">;

export type ProjectListItem = Pick<ProjectRow, "id" | "slug" | "title_en" | "title_ar" | "summary_en" | "summary_ar" | "practice" | "client_display_name_en" | "client_display_name_ar" | "year" | "cover_path" | "cover_alt_en" | "cover_alt_ar" | "published_at">;
export type ProjectDetail = ProjectListItem & Pick<ProjectRow, "body_en" | "body_ar" | "services_en" | "services_ar" | "seo_title_en" | "seo_title_ar" | "seo_description_en" | "seo_description_ar" | "updated_at">;

export type CaseStudyListItem = Pick<CaseStudyRow, "id" | "slug" | "title_en" | "title_ar" | "summary_en" | "summary_ar" | "practice" | "client_display_name_en" | "client_display_name_ar" | "industry_en" | "industry_ar" | "year" | "cover_path" | "cover_alt_en" | "cover_alt_ar" | "published_at">;
export type CaseStudyDetail = CaseStudyListItem & Pick<CaseStudyRow, "challenge_en" | "challenge_ar" | "solution_en" | "solution_ar" | "implementation_en" | "implementation_ar" | "outcome_en" | "outcome_ar" | "impact" | "seo_title_en" | "seo_title_ar" | "seo_description_en" | "seo_description_ar" | "updated_at">;

export type AuthorSummary = Pick<AuthorRow, "id" | "name_en" | "name_ar" | "title_en" | "title_ar" | "avatar_path">;
export type CategorySummary = Pick<CategoryRow, "id" | "slug" | "name_en" | "name_ar">;

type PostListRow = Pick<NewsRow, "id" | "slug" | "title_en" | "title_ar" | "excerpt_en" | "excerpt_ar" | "author_id" | "category_id" | "cover_path" | "cover_alt_en" | "cover_alt_ar" | "published_at">;
export type PostListItem = PostListRow & { author: AuthorSummary | null; category: CategorySummary | null };
export type NewsDetail = PostListItem & Pick<NewsRow, "body_en" | "body_ar" | "seo_title_en" | "seo_title_ar" | "seo_description_en" | "seo_description_ar" | "updated_at">;
export type ArticleListItem = PostListItem & Pick<ArticleRow, "reading_minutes">;
export type ArticleDetail = ArticleListItem & Pick<ArticleRow, "body_en" | "body_ar" | "seo_title_en" | "seo_title_ar" | "seo_description_en" | "seo_description_ar" | "updated_at">;

export type ImpactItem = { label_en: string; label_ar: string; value: string; verified: boolean };

const PROJECT_LIST = "id, slug, title_en, title_ar, summary_en, summary_ar, practice, client_display_name_en, client_display_name_ar, year, cover_path, cover_alt_en, cover_alt_ar, published_at" as const;
const PROJECT_DETAIL = `${PROJECT_LIST}, body_en, body_ar, services_en, services_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, updated_at` as const;
const CASE_LIST = "id, slug, title_en, title_ar, summary_en, summary_ar, practice, client_display_name_en, client_display_name_ar, industry_en, industry_ar, year, cover_path, cover_alt_en, cover_alt_ar, published_at" as const;
const CASE_DETAIL = `${CASE_LIST}, challenge_en, challenge_ar, solution_en, solution_ar, implementation_en, implementation_ar, outcome_en, outcome_ar, impact, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, updated_at` as const;
const POST_LIST = "id, slug, title_en, title_ar, excerpt_en, excerpt_ar, author_id, category_id, cover_path, cover_alt_en, cover_alt_ar, published_at" as const;
const POST_DETAIL = `${POST_LIST}, body_en, body_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, updated_at` as const;
const ARTICLE_LIST = `${POST_LIST}, reading_minutes` as const;
const ARTICLE_DETAIL = `${POST_DETAIL}, reading_minutes` as const;
const AUTHOR_COLS = "id, name_en, name_ar, title_en, title_ar, avatar_path" as const;
const CATEGORY_COLS = "id, slug, name_en, name_ar" as const;

function now(): string {
  return new Date().toISOString();
}

async function safeList<T>(label: string, fn: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  try {
    const { data, error } = await fn();
    if (error) {
      console.error(`[public-content] ${label}:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error(`[public-content] ${label}:`, e);
    return [];
  }
}

async function safeOne<T>(label: string, fn: () => PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>): Promise<T | null> {
  try {
    const { data, error } = await fn();
    if (error) {
      if (error.code !== "PGRST116") console.error(`[public-content] ${label}:`, error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error(`[public-content] ${label}:`, e);
    return null;
  }
}

/** Resolves author and category rows for a set of posts (two small queries, fully typed). */
async function attachRelations<T extends PostListRow>(rows: T[]): Promise<Array<T & { author: AuthorSummary | null; category: CategorySummary | null }>> {
  if (rows.length === 0) return [];
  const supabase = createPublicClient();
  const authorIds = [...new Set(rows.map((r) => r.author_id).filter((v): v is string => typeof v === "string"))];
  const categoryIds = [...new Set(rows.map((r) => r.category_id).filter((v): v is string => typeof v === "string"))];
  const [authors, categories] = await Promise.all([
    authorIds.length ? safeList<AuthorSummary>("authors", () => supabase.from("authors").select(AUTHOR_COLS).in("id", authorIds)) : Promise.resolve([] as AuthorSummary[]),
    categoryIds.length ? safeList<CategorySummary>("categories", () => supabase.from("categories").select(CATEGORY_COLS).in("id", categoryIds)) : Promise.resolve([] as CategorySummary[]),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  return rows.map((r) => ({
    ...r,
    author: r.author_id ? (authorMap.get(r.author_id) ?? null) : null,
    category: r.category_id ? (categoryMap.get(r.category_id) ?? null) : null,
  }));
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function listProjects(limit?: number): Promise<ProjectListItem[]> {
  const supabase = createPublicClient();
  return safeList<ProjectListItem>("projects", () => {
    let q = supabase.from("public_projects").select(PROJECT_LIST).eq("status", "published").order("position", { ascending: true }).order("published_at", { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  });
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const supabase = createPublicClient();
  return safeOne<ProjectDetail>("project", () => supabase.from("public_projects").select(PROJECT_DETAIL).eq("status", "published").eq("slug", slug).maybeSingle());
}

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

export async function listCaseStudies(limit?: number): Promise<CaseStudyListItem[]> {
  const supabase = createPublicClient();
  return safeList<CaseStudyListItem>("case_studies", () => {
    let q = supabase.from("case_studies").select(CASE_LIST).eq("status", "published").order("position", { ascending: true }).order("published_at", { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  });
}

export async function getCaseStudy(slug: string): Promise<CaseStudyDetail | null> {
  const supabase = createPublicClient();
  return safeOne<CaseStudyDetail>("case_study", () => supabase.from("case_studies").select(CASE_DETAIL).eq("status", "published").eq("slug", slug).maybeSingle());
}

/** Parses the `impact` JSON column defensively: [{ label_en, label_ar, value, verified }]. */
export function parseImpact(value: Json): ImpactItem[] {
  if (!Array.isArray(value)) return [];
  const out: ImpactItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, Json | undefined>;
    const label_en = typeof o.label_en === "string" ? o.label_en : "";
    const label_ar = typeof o.label_ar === "string" ? o.label_ar : "";
    const rawValue = o.value;
    const val = typeof rawValue === "string" ? rawValue : typeof rawValue === "number" ? String(rawValue) : "";
    if (!label_en && !label_ar && !val) continue;
    out.push({ label_en, label_ar, value: val, verified: o.verified === true });
  }
  return out;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export async function listNews(limit?: number): Promise<PostListItem[]> {
  const supabase = createPublicClient();
  const rows = await safeList<PostListRow>("news", () => {
    let q = supabase.from("news_posts").select(POST_LIST).eq("status", "published").lte("published_at", now()).order("published_at", { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  });
  return attachRelations(rows);
}

export async function getNewsPost(slug: string): Promise<NewsDetail | null> {
  const supabase = createPublicClient();
  const row = await safeOne<Omit<NewsDetail, "author" | "category">>("news_post", () =>
    supabase.from("news_posts").select(POST_DETAIL).eq("status", "published").lte("published_at", now()).eq("slug", slug).maybeSingle(),
  );
  if (!row) return null;
  const [withRelations] = await attachRelations([row]);
  return withRelations ?? null;
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export async function listArticles(limit?: number): Promise<ArticleListItem[]> {
  const supabase = createPublicClient();
  const rows = await safeList<PostListRow & Pick<ArticleRow, "reading_minutes">>("articles", () => {
    let q = supabase.from("articles").select(ARTICLE_LIST).eq("status", "published").lte("published_at", now()).order("published_at", { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  });
  return attachRelations(rows);
}

export async function getArticle(slug: string): Promise<ArticleDetail | null> {
  const supabase = createPublicClient();
  const row = await safeOne<Omit<ArticleDetail, "author" | "category">>("article", () =>
    supabase.from("articles").select(ARTICLE_DETAIL).eq("status", "published").lte("published_at", now()).eq("slug", slug).maybeSingle(),
  );
  if (!row) return null;
  const [withRelations] = await attachRelations([row]);
  return withRelations ?? null;
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

export type PublishedSlug = { slug: string; updated_at: string };

/** Slugs of every published item per content type, for the sitemap. Never throws. */
export async function listPublishedSlugs(): Promise<{ projects: PublishedSlug[]; caseStudies: PublishedSlug[]; news: PublishedSlug[]; articles: PublishedSlug[] }> {
  const supabase = createPublicClient();
  const cols = "slug, updated_at" as const;
  const [projects, caseStudies, news, articles] = await Promise.all([
    safeList<PublishedSlug>("sitemap:projects", () => supabase.from("public_projects").select(cols).eq("status", "published")),
    safeList<PublishedSlug>("sitemap:case_studies", () => supabase.from("case_studies").select(cols).eq("status", "published")),
    safeList<PublishedSlug>("sitemap:news", () => supabase.from("news_posts").select(cols).eq("status", "published").lte("published_at", now())),
    safeList<PublishedSlug>("sitemap:articles", () => supabase.from("articles").select(cols).eq("status", "published").lte("published_at", now())),
  ]);
  return { projects, caseStudies, news, articles };
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------

/** Public URL of a CMS cover image, or null when the row has none. */
export function coverUrl(path: string | null | undefined): string | null {
  return path ? publicUrl("public-content", path) : null;
}

/** Cover image descriptor for cards and Open Graph. */
export function coverImage(row: { cover_path: string | null; cover_alt_en: string | null; cover_alt_ar: string | null }, locale: Locale): { src: string; alt: string } | null {
  const src = coverUrl(row.cover_path);
  if (!src) return null;
  const alt = (locale === "ar" ? row.cover_alt_ar : row.cover_alt_en) ?? row.cover_alt_en ?? row.cover_alt_ar ?? "";
  return { src, alt };
}
