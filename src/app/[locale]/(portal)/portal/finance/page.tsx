import { getLocale, getTranslations } from "next-intl/server";
import { FileText } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { INVOICE_STATUS_LABELS, QUOTE_STATUS_LABELS, label } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";
import { Card, CardContent } from "@/components/ui/card";

type QuoteRow = {
  id: string;
  number: string | null;
  status: Enums<"quote_status">;
  issue_date: string | null;
  valid_until: string | null;
  total: number;
  currency: string;
  title_en: string | null;
  title_ar: string | null;
};
type InvoiceRow = {
  id: string;
  number: string | null;
  status: Enums<"invoice_status">;
  issue_date: string | null;
  due_date: string | null;
  total: number;
  amount_paid: number;
  currency: string;
  title_en: string | null;
  title_ar: string | null;
};

export default async function PortalFinancePage() {
  await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  const [{ data: quotes }, { data: invoices }] = await Promise.all([
    supabase.from("quotes").select("id, number, status, issue_date, valid_until, total, currency, title_en, title_ar").in("status", ["sent", "accepted", "declined", "expired"]).order("issue_date", { ascending: false }),
    supabase.from("invoices").select("id, number, status, issue_date, due_date, total, amount_paid, currency, title_en, title_ar").in("status", ["issued", "sent", "partially_paid", "paid", "overdue"]).order("issue_date", { ascending: false }),
  ]);
  const quoteRows: QuoteRow[] = quotes ?? [];
  const invoiceRows: InvoiceRow[] = invoices ?? [];
  const hasSentQuote = quoteRows.some((q) => q.status === "sent");

  const pdfLink = (href: string) => (
    <a href={href} className="relative z-10 inline-flex items-center gap-1 text-small text-azure hover:underline" rel="noopener">
      <FileText className="size-4" aria-hidden /> {t("finance.pdf")}
    </a>
  );

  const quoteColumns: Column<QuoteRow>[] = [
    { key: "number", header: t("finance.columns.number"), primary: true, cell: (r) => <span className="font-medium" dir="ltr">{r.number ?? ""}</span> },
    { key: "title", header: t("finance.columns.title"), cell: (r) => pick(r, "title", locale) },
    { key: "status", header: tc("status"), cell: (r) => <Status value={r.status} label={label(QUOTE_STATUS_LABELS, r.status, locale)} /> },
    { key: "issued", header: t("finance.columns.issued"), cell: (r) => formatDate(r.issue_date, locale) },
    { key: "valid", header: t("finance.columns.validUntil"), cell: (r) => formatDate(r.valid_until, locale) },
    { key: "total", header: t("finance.columns.total"), align: "end", cell: (r) => <span dir="ltr">{formatMoney(r.total, r.currency, locale)}</span> },
    { key: "pdf", header: t("finance.pdf"), cell: (r) => pdfLink(`/api/documents/quotes/${r.id}`) },
  ];

  const invoiceColumns: Column<InvoiceRow>[] = [
    { key: "number", header: t("finance.columns.number"), primary: true, cell: (r) => <span className="font-medium" dir="ltr">{r.number ?? ""}</span> },
    { key: "title", header: t("finance.columns.title"), cell: (r) => pick(r, "title", locale) },
    { key: "status", header: tc("status"), cell: (r) => <Status value={r.status} label={label(INVOICE_STATUS_LABELS, r.status, locale)} /> },
    { key: "issued", header: t("finance.columns.issued"), cell: (r) => formatDate(r.issue_date, locale) },
    { key: "due", header: t("finance.columns.due"), cell: (r) => formatDate(r.due_date, locale) },
    { key: "total", header: t("finance.columns.total"), align: "end", cell: (r) => <span dir="ltr">{formatMoney(r.total, r.currency, locale)}</span> },
    { key: "balance", header: t("finance.columns.balance"), align: "end", cell: (r) => <span dir="ltr" className={r.total - r.amount_paid > 0 ? "font-medium" : "text-slate"}>{formatMoney(Math.max(0, r.total - r.amount_paid), r.currency, locale)}</span> },
    { key: "pdf", header: t("finance.pdf"), cell: (r) => pdfLink(`/api/documents/invoices/${r.id}`) },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={t("finance.title")} description={t("finance.description")} className="pb-0" />
      <section className="flex flex-col gap-4">
        <h2 className="text-h3">{t("finance.quotes")}</h2>
        <DataTable rows={quoteRows} columns={quoteColumns} rowKey={(r) => r.id} emptyTitle={t("finance.noQuotes")} caption={t("finance.quotes")} />
        {hasSentQuote ? (
          <Card>
            <CardContent className="text-small text-slate">{t("finance.quoteInstructions")}</CardContent>
          </Card>
        ) : null}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-h3">{t("finance.invoices")}</h2>
        <DataTable rows={invoiceRows} columns={invoiceColumns} rowKey={(r) => r.id} emptyTitle={t("finance.noInvoices")} caption={t("finance.invoices")} />
        <p className="text-small text-slate">{t("finance.paymentInstructions")}</p>
      </section>
    </div>
  );
}
