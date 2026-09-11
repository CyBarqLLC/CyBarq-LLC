import "server-only";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";
import { publicUrl } from "@/lib/storage";
import { CATEGORY_KIND_FOR_TABLE, CONTENT_STATUSES, impactItemSchema, type EditorialTable, type ImpactItem } from "@/lib/validation/content";
import type { AuthorOption, CategoryOption, TagOption } from "./editorial-form";
import type { InternalProjectOption } from "./showcase-project-form";
import type { EmployeeOption } from "./taxonomy-forms";

/** Base URL of the public-content bucket, with a trailing slash. */
export function contentPublicBase(): string {
  return publicUrl("public-content", "");
}

export async function loadEditorialOptions(supabase: SupabaseServerClient, table: EditorialTable): Promise<{ authors: AuthorOption[]; categories: CategoryOption[]; tags: TagOption[] }> {
  const [{ data: authors }, { data: categories }, { data: tags }] = await Promise.all([
    supabase.from("authors").select("id, name_en, name_ar").order("name_en"),
    supabase.from("categories").select("id, name_en, name_ar").eq("kind", CATEGORY_KIND_FOR_TABLE[table]).order("position"),
    supabase.from("tags").select("id, name_en, name_ar").order("name_en"),
  ]);
  return { authors: authors ?? [], categories: categories ?? [], tags: tags ?? [] };
}

export async function loadSelectedTagIds(supabase: SupabaseServerClient, table: EditorialTable, id: string): Promise<string[]> {
  if (table === "news_posts") {
    const { data } = await supabase.from("news_tags").select("tag_id").eq("news_id", id);
    return (data ?? []).map((r) => r.tag_id);
  }
  const { data } = await supabase.from("article_tags").select("tag_id").eq("article_id", id);
  return (data ?? []).map((r) => r.tag_id);
}

/** Internal projects the editor may reference (RLS scoped). Editor only; never exposed publicly. */
export async function loadInternalProjects(supabase: SupabaseServerClient): Promise<InternalProjectOption[]> {
  const { data } = await supabase.from("projects").select("id, code, name_en, name_ar").order("code");
  return data ?? [];
}

export async function loadEmployeeOptions(supabase: SupabaseServerClient): Promise<EmployeeOption[]> {
  const { data } = await supabase.from("employee_directory").select("user_id, full_name, full_name_ar").order("full_name");
  return (data ?? []).flatMap((e) => (e.user_id && e.full_name ? [{ user_id: e.user_id, full_name: e.full_name, full_name_ar: e.full_name_ar }] : []));
}

/** Parses the jsonb impact column defensively; malformed rows become an empty list. */
export function parseImpact(value: unknown): ImpactItem[] {
  if (!Array.isArray(value)) return [];
  const out: ImpactItem[] = [];
  for (const item of value) {
    const parsed = impactItemSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export type StatusCounts = Record<Enums<"content_status">, number> & { total: number };

export function countByStatus(rows: { status: Enums<"content_status"> }[]): StatusCounts {
  const counts: StatusCounts = { draft: 0, review: 0, scheduled: 0, published: 0, archived: 0, total: rows.length };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export function isContentStatus(value: string | undefined): value is Enums<"content_status"> {
  return !!value && (CONTENT_STATUSES as readonly string[]).includes(value);
}
