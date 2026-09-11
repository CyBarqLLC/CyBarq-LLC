import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireAnyPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { CERTIFICATE_STATUS_LABELS, CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Status } from "@/components/ui/status";
import { CertificateFilters } from "@/components/certificates/certificate-filters";
import { CERTIFICATE_TYPES } from "@/lib/validation/certificates";
import { CERTIFICATE_STATUSES, listCertificates, type CertificateListRow } from "./_lib/data";

export default async function CertificatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requireAnyPermission(["certificates.read", "certificates.issue"]);
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const [t, tc] = await Promise.all([getTranslations("certificates"), getTranslations("common")]);
  const supabase = await createClient();

  const type = param(sp, "type");
  const status = param(sp, "status");
  const q = param(sp, "q")?.trim();
  const { page, pageSize, from, to } = pagination(sp);
  const { rows, total } = await listCertificates(supabase, { type, status, q, from, to });

  const columns: Column<CertificateListRow>[] = [
    { key: "number", header: t("columns.number"), primary: true, cell: (r) => r.certificate_no ?? t("draftLabel") },
    { key: "recipient", header: t("columns.recipient"), cell: (r) => pick(r, "recipient_name", locale) },
    { key: "type", header: t("columns.type"), cell: (r) => label(CERTIFICATE_TYPE_LABELS, r.type, locale) },
    { key: "title", header: t("columns.title"), cell: (r) => pick(r, "title", locale) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(CERTIFICATE_STATUS_LABELS, r.status, locale)} /> },
    { key: "issued", header: t("columns.issueDate"), cell: (r) => formatDate(r.issue_date, locale) },
    { key: "updated", header: t("columns.updated"), cell: (r) => formatDate(r.updated_at, locale) },
  ];

  const basePath = `/${locale}/app/certificates`;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          viewer.can("certificates.issue") ? (
            <Button asChild>
              <Link href="/app/certificates/new">{t("new")}</Link>
            </Button>
          ) : null
        }
      />
      <CertificateFilters
        basePath="/app/certificates"
        search={q}
        type={type}
        status={status}
        types={CERTIFICATE_TYPES.map((v) => ({ value: v, label: label(CERTIFICATE_TYPE_LABELS, v, locale) }))}
        statuses={CERTIFICATE_STATUSES.map((v) => ({ value: v, label: label(CERTIFICATE_STATUS_LABELS, v, locale) }))}
        labels={{
          type: t("filters.type"),
          status: t("filters.status"),
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
          allTypes: t("filters.allTypes"),
          allStatuses: t("filters.allStatuses"),
        }}
      />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `${basePath}/${r.id}`} emptyTitle={t("empty")} emptyDescription={t("emptyDescription")} caption={t("title")} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        hrefFor={(p) => withPage(basePath, { type, status, q }, p)}
        labels={{ previous: tc("pagination.previous"), next: tc("pagination.next"), summary: (f, tt, n) => tc("pagination.summary", { from: f, to: tt, total: n }) }}
      />
    </div>
  );
}
