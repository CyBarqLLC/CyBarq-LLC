import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, param, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { INVOICE_STATUS_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Status } from "@/components/ui/status";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { INVOICE_STATUSES, clientLabel, clientNames, clientOptions, listInvoices, markOverdueInvoices, type InvoiceListRow } from "../_lib/data";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const viewer = await requirePermission("finance.read");
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const [t, tc] = await Promise.all([getTranslations("finance"), getTranslations("common")]);
  const supabase = await createClient();

  await markOverdueInvoices(supabase);

  const status = param(sp, "status");
  const client = param(sp, "client");
  const q = param(sp, "q")?.trim();
  const { page, pageSize, from, to } = pagination(sp);

  const [{ rows, total }, clients] = await Promise.all([listInvoices(supabase, { status, client, q, from, to }), clientOptions(supabase, locale)]);
  const names = await clientNames(supabase, rows.map((r) => r.client_id));

  const columns: Column<InvoiceListRow>[] = [
    { key: "number", header: t("columns.number"), primary: true, cell: (r) => r.number ?? t("invoices.draftLabel") },
    { key: "client", header: t("columns.client"), cell: (r) => clientLabel(names, r.client_id, locale) },
    { key: "title", header: t("columns.title"), cell: (r) => pick(r, "title", locale) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(INVOICE_STATUS_LABELS, r.status, locale)} /> },
    { key: "total", header: t("columns.total"), align: "end", cell: (r) => <span className="tabular-nums">{formatMoney(r.total, r.currency, locale)}</span> },
    { key: "balance", header: t("columns.balance"), align: "end", cell: (r) => <span className="tabular-nums">{r.status === "void" ? "" : formatMoney(Math.max(0, Number(r.total) - Number(r.amount_paid)), r.currency, locale)}</span> },
    { key: "due", header: t("columns.dueDate"), cell: (r) => formatDate(r.due_date, locale) },
  ];

  const basePath = `/${locale}/app/finance/invoices`;

  return (
    <div>
      <PageHeader
        title={t("invoices.title")}
        description={t("invoices.description")}
        eyebrow={<Link href="/app/finance" className="hover:text-azure">{t("title")}</Link>}
        actions={
          viewer.can("finance.write") ? (
            <Button asChild>
              <Link href="/app/finance/invoices/new">{t("invoices.new")}</Link>
            </Button>
          ) : null
        }
      />
      <FinanceFilters
        basePath="/app/finance/invoices"
        search={q}
        status={status}
        client={client}
        statuses={INVOICE_STATUSES.map((s) => ({ value: s, label: label(INVOICE_STATUS_LABELS, s, locale) }))}
        clients={clients.map((c) => ({ value: c.id, label: c.name }))}
        labels={{
          status: t("filters.status"),
          client: t("filters.client"),
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
          allStatuses: t("filters.allStatuses"),
          allClients: t("filters.allClients"),
        }}
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowHref={(r) => `${basePath}/${r.id}`}
        emptyTitle={t("invoices.empty")}
        emptyDescription={t("invoices.emptyDescription")}
        caption={t("invoices.title")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        hrefFor={(p) => withPage(basePath, { status, client, q }, p)}
        labels={{ previous: tc("pagination.previous"), next: tc("pagination.next"), summary: (f, tt, n) => tc("pagination.summary", { from: f, to: tt, total: n }) }}
      />
    </div>
  );
}
