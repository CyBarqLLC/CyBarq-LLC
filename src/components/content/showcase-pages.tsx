import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDateTime, formatNumber } from "@/lib/utils/format";
import { CONTENT_STATUS_LABELS, PRACTICE_LABELS, label } from "@/lib/labels";
import { CONTENT_SEGMENTS, CONTENT_STATUSES, type ShowcaseTable } from "@/lib/validation/content";
import { createCaseStudy, createPublicProject, updateCaseStudy, updatePublicProject } from "@/lib/actions/content";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ShowcaseProjectForm } from "./showcase-project-form";
import { CaseStudyForm } from "./case-study-form";
import { WorkflowActions } from "./workflow-actions";
import { contentPublicBase, isContentStatus, loadInternalProjects, parseImpact } from "./data";

type ListRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  status: Enums<"content_status">;
  practice: Enums<"practice">;
  year: number | null;
  position: number;
  published_at: string | null;
  updated_at: string;
};

export async function ShowcaseListPage({ table, searchParams }: { table: ShowcaseTable; searchParams: Promise<SearchParams> }) {
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
    .select("id, slug, title_en, title_ar, status, practice, year, position, published_at, updated_at", { count: "exact" })
    .order("position", { ascending: true })
    .order("updated_at", { ascending: false })
    .range(from, to);
  if (isContentStatus(status)) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%_,()]/g, " ").trim();
    if (term) query = query.or(`title_en.ilike.%${term}%,title_ar.ilike.%${term}%,slug.ilike.%${term}%`);
  }
  const { data, count } = await query;
  const rows: ListRow[] = data ?? [];
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
    { key: "practice", header: t("list.columns.practice"), cell: (r) => label(PRACTICE_LABELS, r.practice, locale) },
    { key: "year", header: t("list.columns.year"), cell: (r) => (r.year ? formatNumber(r.year, locale) : <span className="text-slate">{tc("none")}</span>) },
    { key: "position", header: t("list.columns.position"), cell: (r) => formatNumber(r.position, locale), align: "end" },
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
          {CONTENT_STATUSES.filter((s) => s !== "scheduled").map((s) => (
            <option key={s} value={s}>{label(CONTENT_STATUS_LABELS, s, locale)}</option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">{tc("filter")}</Button>
      </form>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `${base}/${r.id}`} emptyTitle={t("list.empty")} emptyDescription={t("list.emptyDescription")} caption={t(`sections.${table}`)} />
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

function Crumbs({ table, title }: { table: ShowcaseTable; title: string }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Link href="/app/content" className="hover:text-azure">{title}</Link>
      <span aria-hidden>/</span>
      <SectionLink table={table} />
    </span>
  );
}

async function SectionLink({ table }: { table: ShowcaseTable }) {
  const t = await getTranslations("content");
  return <Link href={`/app/content/${CONTENT_SEGMENTS[table]}`} className="hover:text-azure">{t(`sections.${table}`)}</Link>;
}

export async function ShowcaseNewPage({ table }: { table: ShowcaseTable }) {
  await requirePermission("content.write");
  const t = await getTranslations("content");
  const supabase = await createClient();
  const internalProjects = await loadInternalProjects(supabase);
  const publicBase = contentPublicBase();
  return (
    <div>
      <PageHeader eyebrow={<Crumbs table={table} title={t("title")} />} title={t(`new.${table}`)} description={t("form.newHint")} />
      {table === "public_projects" ? (
        <ShowcaseProjectForm action={createPublicProject} defaults={{}} internalProjects={internalProjects} publicBase={publicBase} mode="create" />
      ) : (
        <CaseStudyForm action={createCaseStudy} defaults={{}} impactItems={[]} internalProjects={internalProjects} publicBase={publicBase} mode="create" />
      )}
    </div>
  );
}

export async function ShowcaseEditPage({ table, params }: { table: ShowcaseTable; params: Promise<{ id: string }> }) {
  const viewer = await requirePermission("content.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("content");
  const { id } = await params;
  const supabase = await createClient();
  const segment = CONTENT_SEGMENTS[table];
  const canWrite = viewer.can("content.write");
  const publicBase = contentPublicBase();
  const internalProjects = canWrite ? await loadInternalProjects(supabase) : [];

  let form: ReactNode;
  let header: { title: string; status: Enums<"content_status">; slug: string; published_at: string | null };

  if (table === "public_projects") {
    const { data: row } = await supabase.from("public_projects").select("*").eq("id", id).maybeSingle();
    if (!row) notFound();
    header = { title: pick(row, "title", locale) || row.slug, status: row.status, slug: row.slug, published_at: row.published_at };
    form = canWrite ? <ShowcaseProjectForm action={updatePublicProject.bind(null, id)} defaults={row} internalProjects={internalProjects} publicBase={publicBase} mode="edit" /> : null;
  } else {
    const { data: row } = await supabase.from("case_studies").select("*").eq("id", id).maybeSingle();
    if (!row) notFound();
    header = { title: pick(row, "title", locale) || row.slug, status: row.status, slug: row.slug, published_at: row.published_at };
    form = canWrite ? (
      <CaseStudyForm action={updateCaseStudy.bind(null, id)} defaults={row} impactItems={parseImpact(row.impact)} internalProjects={internalProjects} publicBase={publicBase} mode="edit" />
    ) : null;
  }

  return (
    <div>
      <PageHeader
        eyebrow={<Crumbs table={table} title={t("title")} />}
        title={header.title}
        actions={<Status value={header.status} label={label(CONTENT_STATUS_LABELS, header.status, locale)} />}
      />
      <div className="grid gap-8 xl:grid-cols-[1fr_20rem] xl:items-start">
        <div className="min-w-0">{form ?? <p className="border border-fog bg-white p-5 text-small text-slate">{t("readOnly")}</p>}</div>
        <div className="xl:sticky xl:top-20">
          {canWrite ? (
            <WorkflowActions
              table={table}
              id={id}
              status={header.status}
              scheduledFor={null}
              publishedAt={header.published_at}
              canPublish={viewer.can("content.publish")}
              publicHref={`/${locale}/${segment}/${header.slug}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
