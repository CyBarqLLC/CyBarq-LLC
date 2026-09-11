import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils/format";
import { INVOICE_STATUS_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DocumentItems } from "@/components/finance/document-items";
import { DetailList, ImmutableNotice, Section } from "@/components/finance/detail-blocks";
import { HistoryList } from "@/components/finance/history-list";
import { InvoiceActions } from "@/components/finance/invoice-actions";
import { PaymentRemove } from "@/components/finance/payment-remove";
import { documentHistory, invoiceItems, todayIso } from "../../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

type PaymentRow = { id: string; amount: number; paid_at: string; method: string; reference: string | null; notes: string | null };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const viewer = await requirePermission("finance.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();


  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();

  const [items, { data: client }, { data: project }, { data: payments }, { data: replaced }, { data: replacedBy }, { data: quote }, history] = await Promise.all([
    invoiceItems(supabase, invoice.id),
    supabase.from("clients").select("id, name_en, name_ar").eq("id", invoice.client_id).maybeSingle(),
    invoice.project_id ? supabase.from("projects").select("id, code, name_en, name_ar").eq("id", invoice.project_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("payments").select("id, amount, paid_at, method, reference, notes").eq("invoice_id", invoice.id).order("paid_at", { ascending: false }),
    invoice.replaces_invoice_id ? supabase.from("invoices").select("id, number").eq("id", invoice.replaces_invoice_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("invoices").select("id, number").eq("replaces_invoice_id", invoice.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    invoice.quote_id ? supabase.from("quotes").select("id, number").eq("id", invoice.quote_id).maybeSingle() : Promise.resolve({ data: null }),
    documentHistory(supabase, "invoice", invoice.id, viewer.can("audit.read")),
  ]);

  const title = invoice.number ?? t("invoices.draftLabel");
  const isDraft = invoice.status === "draft";
  const paymentRows: PaymentRow[] = payments ?? [];

  const paymentColumns: Column<PaymentRow>[] = [
    { key: "date", header: t("payment.paidAt"), primary: true, cell: (r) => formatDate(r.paid_at, locale, "long") },
    { key: "amount", header: t("payment.amount"), align: "end", cell: (r) => <span className="tabular-nums">{formatMoney(r.amount, invoice.currency, locale)}</span> },
    { key: "method", header: t("payment.method"), cell: (r) => t(`payment.methods.${r.method}`) },
    { key: "reference", header: t("payment.reference"), cell: (r) => r.reference ?? "" },
    { key: "notes", header: t("payment.notes"), cell: (r) => r.notes ?? "" },
    ...(viewer.can("finance.issue") && invoice.status !== "void"
      ? [{ key: "actions", header: <span className="sr-only">{t("payment.actions")}</span>, align: "end" as const, cell: (r: PaymentRow) => <PaymentRemove paymentId={r.id} /> }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={title}
        description={pick(invoice, "title", locale) || undefined}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/finance/invoices" className="hover:text-azure">{t("invoices.title")}</Link>
            <Status value={invoice.status} label={label(INVOICE_STATUS_LABELS, invoice.status, locale)} />
          </span>
        }
        actions={
          <InvoiceActions
            invoice={{
              id: invoice.id,
              status: invoice.status,
              updated_at: invoice.updated_at,
              due_date: invoice.due_date,
              total: Number(invoice.total),
              amount_paid: Number(invoice.amount_paid),
              itemCount: items.length,
            }}
            canWrite={viewer.can("finance.write")}
            canIssue={viewer.can("finance.issue")}
            today={todayIso()}
          />
        }
      />

      {!isDraft ? <ImmutableNotice title={t("immutable.title")} body={t("immutable.invoice")} /> : null}

      <Section title={t("detail.overview")}>
        <DetailList
          items={[
            { label: t("detail.client"), value: client ? <Link href={`/app/clients/${client.id}`} className="text-azure hover:underline">{pick(client, "name", locale)}</Link> : null },
            { label: t("detail.project"), value: project ? <Link href={`/app/projects/${project.id}`} className="text-azure hover:underline">{`${project.code} · ${pick(project, "name", locale)}`}</Link> : null },
            { label: t("detail.issueDate"), value: formatDate(invoice.issue_date, locale, "long") },
            { label: t("detail.dueDate"), value: formatDate(invoice.due_date, locale, "long") },
            { label: t("detail.currency"), value: invoice.currency },
            { label: t("detail.language"), value: t(`languages.${invoice.language}`) },
            { label: t("detail.fromQuote"), value: quote ? <Link href={`/app/finance/quotes/${quote.id}`} className="text-azure hover:underline">{quote.number ?? t("quotes.draftLabel")}</Link> : null },
            { label: t("detail.replaces"), value: replaced ? <Link href={`/app/finance/invoices/${replaced.id}`} className="text-azure hover:underline">{replaced.number ?? t("invoices.draftLabel")}</Link> : null },
            { label: t("detail.replacedBy"), value: replacedBy ? <Link href={`/app/finance/invoices/${replacedBy.id}`} className="text-azure hover:underline">{replacedBy.number ?? t("invoices.draftLabel")}</Link> : null },
            { label: t("detail.voidedAt"), value: invoice.voided_at ? formatDateTime(invoice.voided_at, locale) : null },
            { label: t("detail.voidReason"), value: invoice.void_reason },
            { label: t("detail.created"), value: formatDateTime(invoice.created_at, locale) },
          ]}
        />
      </Section>

      <Section title={t("detail.items")}>
        <DocumentItems
          items={items}
          currency={invoice.currency}
          totals={{ subtotal: invoice.subtotal, tax_rate: invoice.tax_rate, tax_amount: invoice.tax_amount, total: invoice.total, amount_paid: invoice.amount_paid }}
          showPaid={!isDraft}
        />
      </Section>

      {!isDraft ? (
        <Section title={t("payment.title")}>
          <DataTable rows={paymentRows} columns={paymentColumns} rowKey={(r) => r.id} emptyTitle={t("payment.empty")} caption={t("payment.title")} />
        </Section>
      ) : null}

      {pick(invoice, "notes", locale) || pick(invoice, "terms", locale) ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {pick(invoice, "notes", locale) ? (
            <Section title={t("detail.notes")}>
              <p className="whitespace-pre-line text-body">{pick(invoice, "notes", locale)}</p>
            </Section>
          ) : null}
          {pick(invoice, "terms", locale) ? (
            <Section title={t("detail.terms")}>
              <p className="whitespace-pre-line text-body">{pick(invoice, "terms", locale)}</p>
            </Section>
          ) : null}
        </div>
      ) : null}

      {viewer.can("audit.read") ? (
        <Section title={t("history.title")}>
          <HistoryList rows={history} locale={locale} emptyLabel={t("history.empty")} actorLabel={t("history.actor")} statusLabel={(s) => (s in INVOICE_STATUS_LABELS ? label(INVOICE_STATUS_LABELS, s as keyof typeof INVOICE_STATUS_LABELS, locale) : s)} />
        </Section>
      ) : null}
    </div>
  );
}
