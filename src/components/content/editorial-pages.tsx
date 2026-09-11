import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDateTime } from "@/lib/utils/format";
import { CONTENT_STATUS_LABELS, label } from "@/lib/labels";
import { CONTENT_SEGMENTS, CONTENT_STATUSES, type EditorialTable } from "@/lib/validation/content";
import { createEditorial, updateEditorial } from "@/lib/actions/content";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { EditorialForm } from "./editorial-form";
import { WorkflowActions } from "./workflow-actions";
import { contentPublicBase, isContentStatus, loadEditorialOptions, loadSelectedTagIds } from "./data";

type ListRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  status: Enums<"content_status">;
  language_status: Enums<"language_status">;
  author_id: string | null;
  category_id: string | null;
  published_at: string | null;
  updated_at: string;
};

/** Shared list for news and articles. */
export async function EditorialListPage({ table, searchParams }: { table: EditorialTable; searchParams: Promise<SearchParams> }) {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const status = param(sp, "status");
  const q = param(sp, "q")?.trim() ?? "";
  const { page, pageSize, from, to } = pagination(sp);
  const segment = CONTENT_SEGMENTS[table];
  const supabase = await createClient();

  let query = supabase
    .from(table)
    .select("id, slug, title_en, title_ar, status, language_status, author_id, category_id, published_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);
  if (isContentStatus(status)) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%_,()]/g, " ").trim();
    if (term) query = query.or(`title_en.ilike.%${term}%,title_ar.ilike.%${term}%,slug.ilike.%${term}%`);
  }
  const { data, count } = await query;
  const rows: ListRow[] = data ?? [];

  const authorIds = [...new Set(rows.flatMap((r) => (r.author_id ? [r.author_id] : [])))];
  const categoryIds = [...new Set(rows.flatMap((r) => (r.category_id ? [r.category_id] : [])))];
  const [{ data: authors }, { data: categories }] = await Promise.all([
    authorIds.length > 0 ? supabase.from("authors").select("id, name_en, name_ar").in("id", authorIds) : Promise.resolve({ data: [] as { id: string; name_en: string; name_ar: string }[] }),
    categoryIds.length > 0 ? supabase.from("categories").select("id, name_en, name_ar").in("id", categoryIds) : Promise.resolve({ data: [] as { id: string; name_en: string; name_ar: string }[] }),
  ]);
  const authorName = new Map((authors ?? []).map((a) => [a.id, pick(a, "name", locale)]));
  const categoryName = new Map((categories ?? []).map((c) => [c.id, pick(c, "name", locale)]));

  const base = `/${locale}/app/content/${segment}`;
  const columns: Column<ListRow>[] = [
    {
      key: "title",
      header: t("list.columns.title"),
      primary: true,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium">{pick(r, "title", locale) || r.slug}</span>
          <span className="text-small text-slate" dir="ltr">/{r.slug}</span>
        </span>
      ),
    },
    { key: "status", header: t("list.columns.status"), cell: (r) => <Status value={r.status} label={label(CONTENT_STATUS_LABELS, r.status, locale)} /> },
    { key: "language", header: t("list.columns.language"), cell: (r) => t(`form.languageStatuses.${r.language_status}`) },
    { key: "author", header: t("list.columns.author"), cell: (r) => (r.author_id ? authorName.get(r.author_id) ?? "" : <span className="text-slate">{tc("none")}</span>) },
    { key: "category", header: t("list.columns.category"), cell: (r) => (r.category_id ? categoryName.get(r.category_id) ?? "" : <span className="text-slate">{tc("none")}</span>) },
    { key: "published", header: t("list.columns.published"), cell: (r) => (r.published_at ? formatDateTime(r.published_at, locale) : <span className="text-slate">{tc("none")}</span>) },
    { key: "updated", header: t("list.columns.updated"), cell: (r) => formatDateTime(r.updated_at, locale) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={<Link href="/app/content" className="hover:text-azure">{t("title")}</Link>}
        title={t(`sections.${table}`)}
        description={t(`descriptions.${table}`)}
        actions={
          viewer.can("content.write") ? (
            <Button asChild>
              <Link href={`/app/content/${segment}/new`}><Plus aria-hidden /> {t(`new.${table}`)}</Link>
            </Button>
          ) : null
        }
      />
      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input type="search" name="q" defaultValue={q} placeholder={t("list.search")} aria-label={tc("search")} />
        <NativeSelect name="status" defaultValue={isContentStatus(status) ? status : ""} aria-label={t("list.columns.status")} className="sm:w-48">
          <option value="">{t("list.allStatuses")}</option>
          {CONTENT_STATUSES.map((s) => (
            <option key={s} value={s}>{label(CONTENT_STATUS_LABELS, s, locale)}</option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">{tc("filter")}</Button>
      </form>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/app/content/${segment}/${r.id}`} emptyTitle={t("list.empty")} emptyDescription={t("list.emptyDescription")} caption={t(`sections.${table}`)} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={count ?? 0}
        hrefFor={(p) => withPage(base, { status, q }, p)}
        labels={{ previous: tc("pagination.previous"), next: tc("pagination.next"), summary: (f, tt, total) => tc("pagination.summary", { from: f, to: tt, total }) }}
      />
    </div>
  );
}

export async function EditorialNewPage({ table }: { table: EditorialTable }) {
  await requirePermission("content.write");
  const t = await getTranslations("content");
  const supabase = await createClient();
  const options = await loadEditorialOptions(supabase, table);
  const segment = CONTENT_SEGMENTS[table];
  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/content" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/content/${segment}`} className="hover:text-azure">{t(`sections.${table}`)}</Link>
          </span>
        }
        title={t(`new.${table}`)}
        description={t("form.newHint")}
      />
      <EditorialForm table={table} action={createEditorial.bind(null, table)} defaults={{}} selectedTagIds={[]} publicBase={contentPublicBase()} mode="create" {...options} />
    </div>
  );
}

export async function EditorialEditPage({ table, params }: { table: EditorialTable; params: Promise<{ id: string }> }) {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const { id } = await params;
  const supabase = await createClient();
  const segment = CONTENT_SEGMENTS[table];
  const [{ data: row }, options, selectedTagIds] = await Promise.all([
    supabase.from(table).select("*").eq("id", id).maybeSingle(),
    loadEditorialOptions(supabase, table),
    loadSelectedTagIds(supabase, table, id),
  ]);
  if (!row) notFound();
  const canWrite = viewer.can("content.write");

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/content" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/content/${segment}`} className="hover:text-azure">{t(`sections.${table}`)}</Link>
          </span>
        }
        title={pick(row, "title", locale) || row.slug}
        actions={<Status value={row.status} label={label(CONTENT_STATUS_LABELS, row.status, locale)} />}
      />
      <div className="grid gap-8 xl:grid-cols-[1fr_20rem] xl:items-start">
        <div className="min-w-0">
          {canWrite ? (
            <EditorialForm table={table} action={updateEditorial.bind(null, table, id)} defaults={row} selectedTagIds={selectedTagIds} publicBase={contentPublicBase()} mode="edit" {...options} />
          ) : (
            <p className="border border-fog bg-white p-5 text-small text-slate">{t("readOnly")}</p>
          )}
        </div>
        <div className="xl:sticky xl:top-20">
          {canWrite ? (
            <WorkflowActions
              table={table}
              id={id}
              status={row.status}
              scheduledFor={row.scheduled_for}
              publishedAt={row.published_at}
              canPublish={viewer.can("content.publish")}
              publicHref={`/${locale}/${segment}/${row.slug}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
