import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { ENGAGEMENT_STATUS_LABELS, ENGAGEMENT_TYPE_LABELS, label } from "@/lib/labels";
import { ENGAGEMENT_STATUSES, ENGAGEMENT_TYPES } from "@/lib/validation/security";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { aggregateSeverity, SeveritySummary } from "@/components/security/severity-summary";

type Row = {
  id: string;
  code: string;
  title: string;
  type: Enums<"engagement_type">;
  status: Enums<"engagement_status">;
  start_date: string | null;
  end_date: string | null;
  client: { name_en: string; name_ar: string | null } | null;
  lead: { full_name: string; full_name_ar: string | null } | null;
};

function isStatus(v: string | undefined): v is Enums<"engagement_status"> {
  return !!v && (ENGAGEMENT_STATUSES as readonly string[]).includes(v);
}
function isType(v: string | undefined): v is Enums<"engagement_type"> {
  return !!v && (ENGAGEMENT_TYPES as readonly string[]).includes(v);
}

export default async function SecurityListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("security");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const status = param(sp, "status");
  const type = param(sp, "type");
  const q = param(sp, "q")?.trim() ?? "";
  const { page, pageSize, from, to } = pagination(sp);
  const supabase = await createClient();

  let query = supabase
    .from("security_engagements")
    .select("id, code, title, type, status, start_date, end_date, client:clients(name_en, name_ar), lead:profiles!security_engagements_lead_user_id_fkey(full_name, full_name_ar)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (isStatus(status)) query = query.eq("status", status);
  if (isType(type)) query = query.eq("type", type);
  if (q) {
    const term = q.replace(/[%_,()]/g, " ").trim();
    if (term) query = query.or(`code.ilike.%${term}%,title.ilike.%${term}%`);
  }
  const { data, count } = await query;
  const rows: Row[] = data ?? [];

  const ids = rows.map((r) => r.id);
  const { data: findingRows } = ids.length > 0 ? await supabase.from("findings").select("engagement_id, severity, status").in("engagement_id", ids) : { data: [] };
  const severity = aggregateSeverity(findingRows ?? []);

  const base = `/${locale}/app/security`;
  const columns: Column<Row>[] = [
    { key: "code", header: t("list.columns.code"), primary: true, cell: (r) => <span className="font-medium">{r.code}</span> },
    { key: "title", header: t("list.columns.title"), cell: (r) => <span className="line-clamp-2">{r.title}</span> },
    { key: "client", header: t("list.columns.client"), cell: (r) => (r.client ? pick(r.client, "name", locale) : <span className="text-slate">{tc("none")}</span>) },
    { key: "type", header: t("list.columns.type"), cell: (r) => label(ENGAGEMENT_TYPE_LABELS, r.type, locale) },
    { key: "status", header: t("list.columns.status"), cell: (r) => <Status value={r.status} label={label(ENGAGEMENT_STATUS_LABELS, r.status, locale)} /> },
    { key: "findings", header: t("list.columns.findings"), cell: (r) => <SeveritySummary counts={severity.get(r.id)} locale={locale} emptyLabel={t("list.noFindings")} /> },
    {
      key: "dates",
      header: t("list.columns.dates"),
      cell: (r) => (
        <span className="whitespace-nowrap text-small">
          {formatDate(r.start_date, locale) || "…"} → {formatDate(r.end_date, locale) || "…"}
        </span>
      ),
    },
    { key: "lead", header: t("list.columns.lead"), cell: (r) => (r.lead ? (locale === "ar" ? r.lead.full_name_ar || r.lead.full_name : r.lead.full_name) : <span className="text-slate">{tc("none")}</span>) },
  ];

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          viewer.can("security.write") ? (
            <Button asChild>
              <Link href="/app/security/new"><Plus aria-hidden /> {t("new")}</Link>
            </Button>
          ) : null
        }
      />
      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <Input type="search" name="q" defaultValue={q} placeholder={t("list.search")} aria-label={tc("search")} />
        <NativeSelect name="status" defaultValue={isStatus(status) ? status : ""} aria-label={t("list.columns.status")} className="sm:w-48">
          <option value="">{t("list.allStatuses")}</option>
          {ENGAGEMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{label(ENGAGEMENT_STATUS_LABELS, s, locale)}</option>
          ))}
        </NativeSelect>
        <NativeSelect name="type" defaultValue={isType(type) ? type : ""} aria-label={t("list.columns.type")} className="sm:w-56">
          <option value="">{t("list.allTypes")}</option>
          {ENGAGEMENT_TYPES.map((v) => (
            <option key={v} value={v}>{label(ENGAGEMENT_TYPE_LABELS, v, locale)}</option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">{tc("filter")}</Button>
      </form>
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowHref={(r) => `${base}/${r.id}`}
        emptyTitle={t("list.empty")}
        emptyDescription={t("list.emptyDescription")}
        caption={t("title")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={count ?? 0}
        hrefFor={(p) => withPage(base, { status, type, q }, p)}
        labels={{ previous: tc("pagination.previous"), next: tc("pagination.next"), summary: (f, tt, total) => tc("pagination.summary", { from: f, to: tt, total }) }}
      />
    </div>
  );
}
