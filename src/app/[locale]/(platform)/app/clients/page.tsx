import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { formatDate } from "@/lib/utils/format";
import { searchTerm } from "@/lib/validation/projects";
import { isClientStatus, CLIENT_STATUSES } from "@/lib/validation/clients";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.clients");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.clients");
  const supabase = await createClient();

  const q = searchTerm(param(sp, "q"));
  const statusParam = param(sp, "status");
  const status = isClientStatus(statusParam) ? statusParam : undefined;
  const { page, pageSize, from, to } = pagination(sp);

  let query = supabase
    .from("clients")
    .select("id, name_en, name_ar, status, country, city, primary_contact_name, primary_contact_email, updated_at", { count: "exact" })
    .order("name_en")
    .range(from, to);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%,legal_name.ilike.%${q}%`);
  const { data: rows, count } = await query;
  type Row = NonNullable<typeof rows>[number];
  const clients: Row[] = rows ?? [];
  const filters = { q, status };

  const columns: Column<Row>[] = [
    { key: "name", header: t("columns.name"), primary: true, cell: (c) => (
      <span className="block">
        <span className="block font-medium text-graphite">{pick(c, "name", locale)}</span>
        {locale === "ar" && c.name_ar ? <span className="block text-small text-slate" dir="ltr">{c.name_en}</span> : null}
      </span>
    ) },
    { key: "status", header: t("columns.status"), cell: (c) => <Status value={c.status} label={t(`statuses.${c.status}`)} /> },
    { key: "contact", header: t("columns.contact"), cell: (c) => (
      <span className="block">
        <span className="block">{c.primary_contact_name ?? ""}</span>
        {c.primary_contact_email ? <span className="block text-small text-slate" dir="ltr">{c.primary_contact_email}</span> : null}
      </span>
    ) },
    { key: "country", header: t("columns.country"), cell: (c) => [c.city, c.country].filter(Boolean).join(", ") },
    { key: "updated", header: t("columns.updated"), cell: (c) => formatDate(c.updated_at, locale) },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={viewer.can("clients.write") ? (
          <Button asChild>
            <Link href="/app/clients/new">{t("new")}</Link>
          </Button>
        ) : undefined}
      />
      <FilterBar action="/app/clients" active={Boolean(q || status)}>
        <FilterField label={t("filters.search")} htmlFor="q" className="sm:min-w-64">
          <Input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder={t("searchPlaceholder")} />
        </FilterField>
        <FilterField label={t("filters.status")} htmlFor="status">
          <NativeSelect id="status" name="status" defaultValue={status ?? ""}>
            <option value="">{t("filters.any")}</option>
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`statuses.${s}`)}</option>
            ))}
          </NativeSelect>
        </FilterField>
      </FilterBar>
      <DataTable rows={clients} columns={columns} rowKey={(c) => c.id} rowHref={(c) => `/${locale}/app/clients/${c.id}`} emptyTitle={t("empty.title")} emptyDescription={t("empty.description")} caption={t("title")} />
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/clients`, filters, p)} />
    </>
  );
}
