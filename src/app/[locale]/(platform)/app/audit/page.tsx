import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { formatDateTime } from "@/lib/utils/format";
import { searchTerm } from "@/lib/validation/projects";
import type { Json } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.audit");
  return { title: t("title"), robots: { index: false, follow: false } };
}

const ENTITY_TYPES = ["user", "role", "project", "client_user", "invoice", "quote", "certificate", "finding", "security_engagement", "news_posts", "articles", "public_projects", "case_studies", "project_documents", "employee_documents", "engagement_reports", "finding_evidence"] as const;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Compact `key: value` rendering of the metadata object with a full JSON fallback. */
function MetadataCell({ value, label }: { value: Json; label: string }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return null;
  const summary = entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(", ");
  return (
    <details className="max-w-sm">
      <summary className="cursor-pointer truncate text-small text-slate" title={label}>{summary}</summary>
      <pre className="mt-2 max-h-48 overflow-auto bg-surface p-2 text-label leading-relaxed" dir="ltr">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePermission("audit.read");
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.audit");
  const supabase = await createClient();

  const action = searchTerm(param(sp, "action"), 60);
  const entityParam = param(sp, "entity");
  const entity = entityParam && (ENTITY_TYPES as readonly string[]).includes(entityParam) ? entityParam : undefined;
  const actor = searchTerm(param(sp, "actor"), 120);
  const fromParam = param(sp, "from");
  const toParam = param(sp, "to");
  const fromDate = fromParam && DATE.test(fromParam) ? fromParam : undefined;
  const toDate = toParam && DATE.test(toParam) ? toParam : undefined;
  const { page, pageSize, from, to } = pagination(sp);

  let query = supabase
    .from("audit_logs")
    .select("id, actor_email, action, entity_type, entity_id, metadata, ip, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (action) query = query.ilike("action", `${action}%`);
  if (entity) query = query.eq("entity_type", entity);
  if (actor) query = query.ilike("actor_email", `%${actor}%`);
  if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
  if (toDate) query = query.lte("created_at", `${toDate}T23:59:59.999Z`);

  const { data: rows, count } = await query;
  type Row = NonNullable<typeof rows>[number];
  const entries: Row[] = rows ?? [];
  const filters = { action, entity, actor, from: fromDate, to: toDate };
  const active = Boolean(action || entity || actor || fromDate || toDate);

  const columns: Column<Row>[] = [
    { key: "when", header: t("columns.when"), cell: (r) => <time dateTime={r.created_at} className="whitespace-nowrap">{formatDateTime(r.created_at, locale)}</time> },
    { key: "action", header: t("columns.action"), primary: true, cell: (r) => <span className="font-mono text-small">{r.action}</span> },
    { key: "actor", header: t("columns.actor"), cell: (r) => r.actor_email ?? <span className="text-slate">{t("system")}</span> },
    { key: "entity", header: t("columns.entity"), cell: (r) => (
      <span className="block">
        <span className="block">{r.entity_type}</span>
        {r.entity_id ? <span className="block truncate font-mono text-label text-slate" dir="ltr">{r.entity_id}</span> : null}
      </span>
    ) },
    { key: "details", header: t("columns.details"), cell: (r) => <MetadataCell value={r.metadata} label={t("showDetails")} /> },
    { key: "ip", header: t("columns.ip"), cell: (r) => <span className="font-mono text-label" dir="ltr">{r.ip ?? ""}</span> },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <FilterBar action="/app/audit" active={active}>
        <FilterField label={t("filters.action")} htmlFor="action">
          <Input id="action" name="action" defaultValue={action ?? ""} placeholder="invoice." dir="ltr" />
        </FilterField>
        <FilterField label={t("filters.entity")} htmlFor="entity">
          <NativeSelect id="entity" name="entity" defaultValue={entity ?? ""}>
            <option value="">{t("filters.any")}</option>
            {ENTITY_TYPES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.actor")} htmlFor="actor">
          <Input id="actor" name="actor" type="search" defaultValue={actor ?? ""} dir="ltr" />
        </FilterField>
        <FilterField label={t("filters.from")} htmlFor="from">
          <Input id="from" name="from" type="date" defaultValue={fromDate ?? ""} />
        </FilterField>
        <FilterField label={t("filters.to")} htmlFor="to">
          <Input id="to" name="to" type="date" defaultValue={toDate ?? ""} />
        </FilterField>
      </FilterBar>
      <DataTable rows={entries} columns={columns} rowKey={(r) => String(r.id)} emptyTitle={t("empty.title")} emptyDescription={t("empty.description")} caption={t("title")} />
      <ListPagination page={page} pageSize={pageSize} total={count ?? 0} hrefFor={(p) => withPage(`/${locale}/app/audit`, filters, p)} />
    </>
  );
}
