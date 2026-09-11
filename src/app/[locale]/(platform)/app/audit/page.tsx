import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { formatDateTime } from "@/lib/utils/format";
import { searchTerm } from "@/lib/validation/projects";
import type { Json } from "@/lib/supabase/database.types";
import { AUDIT_ACTION_LABELS, auditActionLabel, auditEntityHref, auditEntityLabel, isAuditAction, type AuditAction, type AuditLinkContext } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterBar, FilterField } from "@/components/platform/filter-bar";
import { ListPagination } from "@/components/platform/list-pagination";
import { AuditDetails } from "@/components/platform/audit-details";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.audit");
  return { title: t("title"), robots: { index: false, follow: false } };
}

const ENTITY_TYPES = ["user", "client_user", "role", "project", "invoice", "quote", "certificate", "security_engagement", "finding", "engagement_report", "news_posts", "articles", "public_projects", "case_studies", "project_document", "employee_document", "engagement_reports", "finding_evidence"] as const;

/** Action groups offered by the filter: the prefix of the action key and the message key of its name. */
const ACTION_GROUPS = [
  { prefix: "user", key: "accounts" },
  { prefix: "client_user", key: "portalUsers" },
  { prefix: "role", key: "roles" },
  { prefix: "permission", key: "permissions" },
  { prefix: "project", key: "projects" },
  { prefix: "task", key: "tasks" },
  { prefix: "invoice", key: "invoices" },
  { prefix: "payment", key: "payments" },
  { prefix: "quote", key: "quotes" },
  { prefix: "certificate", key: "certificates" },
  { prefix: "engagement", key: "engagements" },
  { prefix: "finding", key: "findings" },
  { prefix: "report", key: "reports" },
  { prefix: "document", key: "documents" },
  { prefix: "file", key: "files" },
  { prefix: "hr_document", key: "hrDocuments" },
  { prefix: "portal", key: "portal" },
  { prefix: "content", key: "content" },
] as const;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parent ids some entries carry, so documents and findings can link to the page they belong to. */
function linkContext(meta: Json): AuditLinkContext {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const id = (key: string) => {
    const v = meta[key];
    return typeof v === "string" ? v : null;
  };
  return { engagementId: id("engagement_id"), projectId: id("project_id"), employeeUserId: id("employee_user_id") };
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePermission("audit.read");
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.audit");
  const supabase = await createClient();

  // `action` is either a full known action ("invoice.issued") or a group prefix ("invoice.").
  const actionParam = searchTerm(param(sp, "action"), 60);
  const actionGroup = actionParam && actionParam.endsWith(".") && ACTION_GROUPS.some((g) => `${g.prefix}.` === actionParam) ? actionParam : undefined;
  const actionExact = actionParam && isAuditAction(actionParam) ? actionParam : undefined;
  const action = actionExact ?? actionGroup;
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
  if (actionExact) query = query.eq("action", actionExact);
  else if (actionGroup) query = query.like("action", `${actionGroup}%`);
  if (entity) query = query.eq("entity_type", entity);
  if (actor) query = query.ilike("actor_email", `%${actor}%`);
  if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
  if (toDate) query = query.lte("created_at", `${toDate}T23:59:59.999Z`);

  const { data: rows, count } = await query;
  type Row = NonNullable<typeof rows>[number];
  const entries: Row[] = rows ?? [];
  const filters = { action, entity, actor, from: fromDate, to: toDate };
  const active = Boolean(action || entity || actor || fromDate || toDate);

  const allActions: AuditAction[] = Object.keys(AUDIT_ACTION_LABELS).filter(isAuditAction);
  const actionsByGroup = ACTION_GROUPS.map((g) => ({ ...g, actions: allActions.filter((a) => a.startsWith(`${g.prefix}.`)) }));

  const columns: Column<Row>[] = [
    { key: "when", header: t("columns.when"), cell: (r) => <time dateTime={r.created_at} className="whitespace-nowrap tabular-nums text-slate">{formatDateTime(r.created_at, locale)}</time> },
    { key: "action", header: t("columns.action"), primary: true, cell: (r) => <span className="font-medium text-graphite">{auditActionLabel(r.action, locale)}</span> },
    { key: "entity", header: t("columns.entity"), cell: (r) => {
      const noun = auditEntityLabel(r.entity_type, locale);
      const href = auditEntityHref(r.entity_type, r.entity_id, linkContext(r.metadata));
      return href ? (
        <Link href={href} className="text-azure hover:underline" title={r.entity_id ?? undefined}>{noun}</Link>
      ) : (
        <span title={r.entity_id ?? undefined}>{noun}</span>
      );
    } },
    { key: "actor", header: t("columns.actor"), cell: (r) => (r.actor_email ? <span dir="ltr" className="break-all">{r.actor_email}</span> : <span className="text-slate">{t("system")}</span>) },
    { key: "details", header: t("columns.details"), cell: (r) => <AuditDetails value={r.metadata} entityType={r.entity_type} locale={locale} /> },
    { key: "ip", header: t("columns.ip"), cell: (r) => <span className="text-label text-slate tabular-nums" dir="ltr">{r.ip ?? ""}</span> },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <FilterBar action="/app/audit" active={active}>
        <FilterField label={t("filters.action")} htmlFor="action" className="sm:min-w-56">
          <NativeSelect id="action" name="action" defaultValue={action ?? ""}>
            <option value="">{t("filters.any")}</option>
            {actionsByGroup.map((g) => (
              <optgroup key={g.prefix} label={t(`groups.${g.key}`)}>
                <option value={`${g.prefix}.`}>{t("filters.allIn", { group: t(`groups.${g.key}`) })}</option>
                {g.actions.map((a) => (
                  <option key={a} value={a}>{auditActionLabel(a, locale)}</option>
                ))}
              </optgroup>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.entity")} htmlFor="entity">
          <NativeSelect id="entity" name="entity" defaultValue={entity ?? ""}>
            <option value="">{t("filters.any")}</option>
            {ENTITY_TYPES.map((e) => (
              <option key={e} value={e}>{auditEntityLabel(e, locale)}</option>
            ))}
          </NativeSelect>
        </FilterField>
        <FilterField label={t("filters.actor")} htmlFor="actor">
          <Input id="actor" name="actor" type="search" defaultValue={actor ?? ""} placeholder={t("filters.actorPlaceholder")} dir="ltr" />
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
