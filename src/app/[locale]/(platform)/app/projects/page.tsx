import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { label, PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { isPractice, isProjectStatus, searchTerm, PROJECT_STATUSES, PRACTICES } from "@/lib/validation/projects";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";
import { personName } from "@/components/platform/person";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects");
  const supabase = await createClient();

  const q = searchTerm(param(sp, "q"));
  const statusParam = param(sp, "status");
  const practiceParam = param(sp, "practice");
  const clientParam = param(sp, "client");
  const status = isProjectStatus(statusParam) ? statusParam : undefined;
  const practice = isPractice(practiceParam) ? practiceParam : undefined;
  const clientId = clientParam && /^[0-9a-f-]{36}$/i.test(clientParam) ? clientParam : undefined;
  const { page, pageSize, from, to } = pagination(sp);

  let query = supabase
    .from("projects")
    .select("id, code, name_en, name_ar, practice, status, end_date, client:clients(id, name_en, name_ar), manager:profiles!projects_manager_user_id_fkey(full_name, full_name_ar)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);
  if (status) query = query.eq("status", status);
  if (practice) query = query.eq("practice", practice);
  if (clientId) query = query.eq("client_id", clientId);
  if (q) query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%,code.ilike.%${q}%`);

  const [{ data: rows, count }, { data: clients }] = await Promise.all([
    query,
    supabase.from("clients").select("id, name_en, name_ar").order("name_en").limit(200),
  ]);

  type Row = NonNullable<typeof rows>[number];
  const projects: Row[] = rows ?? [];
  const filters = { q: q ?? undefined, status, practice, client: clientId };
  const active = Boolean(q || status || practice || clientId);

  const columns: Column<Row>[] = [
    { key: "name", header: t("columns.name"), primary: true, cell: (r) => (
      <span className="block">
        <span className="block font-medium text-graphite">{pick(r, "name", locale)}</span>
        <span className="block text-small text-slate">{r.code}</span>
      </span>
    ) },
    { key: "client", header: t("columns.client"), cell: (r) => (r.client ? pick(r.client, "name", locale) : <span className="text-slate">{t("fields.noClient")}</span>) },
    { key: "practice", header: t("columns.practice"), cell: (r) => label(PRACTICE_LABELS, r.practice, locale) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(PROJECT_STATUS_LABELS, r.status, locale)} /> },
    { key: "manager", header: t("columns.manager"), cell: (r) => personName(r.manager, locale, t("fields.noManager")) },
    { key: "end", header: t("columns.endDate"), cell: (r) => formatDate(r.end_date, locale) },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={viewer.can("projects.write") ? (
          <Button asChild>
            <Link href="/app/projects/new">{t("new")}</Link>
          </Button>
        ) : undefined}
      />
      <FilterBar action="/app/projects" active={active}>
        <FilterField label={t("filters.search")} htmlFor="q" className="sm:min-w-64">
          <Input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder={t("searchPlaceholder")} />
        </FilterField>
        <FilterField label={t("filters.status")} htmlFor="status">
          <NativeSelect id="status" name="status" defaultValue={status ?? ""}>
            <option value="">{t("filters.any")}</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{label(PROJECT_STATUS_LABELS, s, locale)}</option>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.practice")} htmlFor="practice">
          <NativeSelect id="practice" name="practice" defaultValue={practice ?? ""}>
            <option value="">{t("filters.any")}</option>
            {PRACTICES.map((p) => (
              <option key={p} value={p}>{label(PRACTICE_LABELS, p, locale)}</option>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.client")} htmlFor="client">
          <NativeSelect id="client" name="client" defaultValue={clientId ?? ""}>
            <option value="">{t("filters.any")}</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>{pick(c, "name", locale)}</option>
            ))}
          </NativeSelect>
        </FilterField>
      </FilterBar>
      <DataTable
        rows={projects}
        columns={columns}
        rowKey={(r) => r.id}
        rowHref={(r) => `/app/projects/${r.id}`}
        emptyTitle={t("empty.title")}
        emptyDescription={t("empty.description")}
        caption={t("title")}
      />
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/projects`, filters, p)} />
    </>
  );
}
