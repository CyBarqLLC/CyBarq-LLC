import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { INVOICE_STATUS_LABELS, QUOTE_STATUS_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { KpiCard, Section } from "@/components/finance/detail-blocks";
import { clientLabel, clientNames, markOverdueInvoices, todayIso, type InvoiceListRow, type QuoteListRow } from "./_lib/data";

const OPEN_STATUSES = ["issued", "sent", "partially_paid", "overdue"] as const;

export default async function FinanceIndexPage() {
  const viewer = await requirePermission("finance.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();

  await markOverdueInvoices(supabase);

  const today = todayIso();
  const monthStart = `${today.slice(0, 7)}-01`;

  const [{ data: open }, { count: overdueCount }, { count: draftInvoices }, { count: draftQuotes }, { data: paid }, { data: recentInvoices }, { data: recentQuotes }] = await Promise.all([
    supabase.from("invoices").select("total, amount_paid, currency").in("status", [...OPEN_STATUSES]),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("payments").select("amount, invoice_id").gte("paid_at", monthStart).lte("paid_at", today),
    supabase.from("invoices").select("id, number, client_id, status, title_en, title_ar, total, amount_paid, currency, issue_date, due_date, updated_at").order("updated_at", { ascending: false }).limit(6),
    supabase.from("quotes").select("id, number, client_id, status, title_en, title_ar, total, currency, issue_date, valid_until, updated_at").order("updated_at", { ascending: false }).limit(6),
  ]);

  // Outstanding per currency.
  const outstanding = new Map<string, number>();
  for (const row of open ?? []) {
    const balance = Number(row.total) - Number(row.amount_paid);
    if (balance > 0) outstanding.set(row.currency, (outstanding.get(row.currency) ?? 0) + balance);
  }

  // Paid this month per currency (currency comes from the invoice).
  const paidInvoiceIds = [...new Set((paid ?? []).map((p) => p.invoice_id))];
  const { data: paidInvoices } = paidInvoiceIds.length > 0 ? await supabase.from("invoices").select("id, currency").in("id", paidInvoiceIds) : { data: [] as { id: string; currency: string }[] };
  const currencyOf = new Map<string, string>((paidInvoices ?? []).map((i) => [i.id, i.currency] as [string, string]));
  const paidThisMonth = new Map<string, number>();
  for (const p of paid ?? []) {
    const cur = currencyOf.get(p.invoice_id) ?? "JOD";
    paidThisMonth.set(cur, (paidThisMonth.get(cur) ?? 0) + Number(p.amount));
  }

  const invoices: InvoiceListRow[] = recentInvoices ?? [];
  const quotes: QuoteListRow[] = recentQuotes ?? [];
  const names = await clientNames(supabase, [...invoices.map((i) => i.client_id), ...quotes.map((q) => q.client_id)]);

  const moneyList = (map: Map<string, number>) =>
    map.size === 0 ? <span className="text-slate">{t("noCurrency")}</span> : (
      <span className="flex flex-col">
        {[...map.entries()].map(([cur, amount]) => (
          <span key={cur}>{formatMoney(amount, cur, locale)}</span>
        ))}
      </span>
    );

  const invoiceColumns: Column<InvoiceListRow>[] = [
    { key: "number", header: t("columns.number"), primary: true, cell: (r) => r.number ?? t("invoices.draftLabel") },
    { key: "client", header: t("columns.client"), cell: (r) => clientLabel(names, r.client_id, locale) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(INVOICE_STATUS_LABELS, r.status, locale)} /> },
    { key: "total", header: t("columns.total"), align: "end", cell: (r) => <span className="tabular-nums">{formatMoney(r.total, r.currency, locale)}</span> },
    { key: "due", header: t("columns.dueDate"), cell: (r) => formatDate(r.due_date, locale) },
  ];
  const quoteColumns: Column<QuoteListRow>[] = [
    { key: "number", header: t("columns.number"), primary: true, cell: (r) => r.number ?? t("quotes.draftLabel") },
    { key: "client", header: t("columns.client"), cell: (r) => clientLabel(names, r.client_id, locale) },
    { key: "status", header: t("columns.status"), cell: (r) => <Status value={r.status} label={label(QUOTE_STATUS_LABELS, r.status, locale)} /> },
    { key: "total", header: t("columns.total"), align: "end", cell: (r) => <span className="tabular-nums">{formatMoney(r.total, r.currency, locale)}</span> },
    { key: "title", header: t("columns.title"), cell: (r) => pick(r, "title", locale) },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          viewer.can("finance.write") ? (
            <>
              <Button asChild variant="outline">
                <Link href="/app/finance/quotes/new">{t("quotes.new")}</Link>
              </Button>
              <Button asChild>
                <Link href="/app/finance/invoices/new">{t("invoices.new")}</Link>
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t("kpi.outstanding")} value={moneyList(outstanding)} hint={t("kpi.outstandingHint")} />
        <KpiCard label={t("kpi.overdue")} value={overdueCount ?? 0} />
        <KpiCard label={t("kpi.drafts")} value={(draftInvoices ?? 0) + (draftQuotes ?? 0)} />
        <KpiCard label={t("kpi.paidThisMonth")} value={moneyList(paidThisMonth)} />
      </div>

      <Section
        title={t("recentInvoices")}
        actions={
          <Button asChild variant="link">
            <Link href="/app/finance/invoices">{t("viewAll")}</Link>
          </Button>
        }
      >
        <DataTable rows={invoices} columns={invoiceColumns} rowKey={(r) => r.id} rowHref={(r) => `/${locale}/app/finance/invoices/${r.id}`} emptyTitle={t("invoices.empty")} emptyDescription={t("invoices.emptyDescription")} />
      </Section>

      <Section
        title={t("recentQuotes")}
        actions={
          <Button asChild variant="link">
            <Link href="/app/finance/quotes">{t("viewAll")}</Link>
          </Button>
        }
      >
        <DataTable rows={quotes} columns={quoteColumns} rowKey={(r) => r.id} rowHref={(r) => `/${locale}/app/finance/quotes/${r.id}`} emptyTitle={t("quotes.empty")} emptyDescription={t("quotes.emptyDescription")} />
      </Section>
    </div>
  );
}
