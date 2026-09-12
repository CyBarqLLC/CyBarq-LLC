import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { currencyName, formatDate, formatMoney, formatNumber } from "@/lib/utils/format";
import { company } from "@/content/site/company";
import { PDF_FONT_FAMILY } from "./fonts";
import { FOOTER_RESERVE, PAGE_GRID, PDF_COLORS, TYPE } from "./theme";
import {
  AccentRule,
  BiSectionLabel,
  BrandLogo,
  DocumentFooter,
  IssuanceNote,
  ItemsTable,
  MetaList,
  PartyDetails,
  SectionBlock,
  StatusStamp,
  TotalsBlock,
  type BiCaption,
  type MetaRow,
  type TotalRow,
} from "./primitives";
import type { CommercialDocumentData } from "./types";

/**
 * Every caption of the document in both languages. Invoices and quotations are
 * issued as one bilingual file: English leads, Arabic follows, and no text run
 * ever mixes the two scripts.
 */
const T = {
  invoice: { en: "Invoice", ar: "فاتورة" },
  quote: { en: "Quotation", ar: "عرض سعر" },
  draft: { en: "Draft", ar: "مسودة" },
  void: { en: "Void", ar: "ملغاة" },
  billTo: { en: "Bill to", ar: "الفاتورة إلى" },
  preparedFor: { en: "Prepared for", ar: "مقدّم إلى" },
  number: { en: "Number", ar: "الرقم" },
  issueDate: { en: "Issue date", ar: "تاريخ الإصدار" },
  dueDate: { en: "Due date", ar: "تاريخ الاستحقاق" },
  validUntil: { en: "Valid until", ar: "صالح حتى" },
  currency: { en: "Currency", ar: "العملة" },
  project: { en: "Project", ar: "المشروع" },
  subject: { en: "Subject", ar: "الموضوع" },
  description: { en: "Description", ar: "البيان" },
  quantity: { en: "Qty", ar: "الكمية" },
  unitPrice: { en: "Unit price", ar: "سعر الوحدة" },
  amount: { en: "Amount", ar: "المبلغ" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  tax: { en: "Tax", ar: "الضريبة" },
  total: { en: "Total", ar: "الإجمالي" },
  paid: { en: "Paid", ar: "المدفوع" },
  balance: { en: "Balance due", ar: "الرصيد المستحق" },
  notes: { en: "Notes", ar: "ملاحظات" },
  terms: { en: "Terms", ar: "الشروط" },
  taxNumber: { en: "Tax number", ar: "الرقم الضريبي" },
  replaces: { en: "Replaces", ar: "تحل محل" },
  fromQuote: { en: "Quote ref.", ar: "مرجع عرض السعر" },
  voidReason: { en: "Void reason", ar: "سبب الإلغاء" },
} satisfies Record<string, BiCaption>;

/**
 * The closing statement: the document comes from the company's system, so no
 * signature or stamp is needed. The Arabic sentence names the Jordan
 * registered company, the English one the legal name used in correspondence.
 */
const ISSUANCE: Record<"invoice" | "quote", { en: string; ar: string }> = {
  invoice: {
    en: `This invoice was issued electronically by ${company.legalName.en} and is valid without a signature or a stamp.`,
    ar: `صدرت هذه الفاتورة إلكترونياً عن شركة ${company.jordanLegalName}، وهي معتمدة دون توقيع أو ختم.`,
  },
  quote: {
    en: `This quotation was issued electronically by ${company.legalName.en} and is valid without a signature or a stamp.`,
    ar: `صدر عرض السعر هذا إلكترونياً عن شركة ${company.jordanLegalName}، وهو معتمد دون توقيع أو ختم.`,
  },
};

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: TYPE.body,
    fontWeight: 400,
    color: PDF_COLORS.graphite,
    paddingTop: PAGE_GRID.top,
    paddingHorizontal: PAGE_GRID.side,
    paddingBottom: FOOTER_RESERVE,
    lineHeight: 1.45,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headEnd: { alignItems: "flex-end" },
  docTitle: { fontSize: TYPE.headline, fontWeight: 300, lineHeight: 1.15, textAlign: "right" },
  docTitleAr: { fontSize: TYPE.subhead, fontWeight: 400, color: PDF_COLORS.slate, lineHeight: 1.3, textAlign: "right" },
  docNumber: { fontSize: TYPE.body, fontWeight: 500, color: PDF_COLORS.graphite, marginTop: 4, lineHeight: 1.4, textAlign: "right" },
  meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 22 },
  party: { width: "50%", paddingTop: 2 },
  metaList: { width: "46%" },
  subject: { marginTop: 18 },
  subjectText: { fontSize: TYPE.subhead, fontWeight: 500, lineHeight: 1.35 },
  subjectAr: { fontSize: TYPE.body, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.5, textAlign: "right", marginTop: 2 },
});

/**
 * Invoice and quotation template. One bilingual layout: the page reads
 * left to right with English leading, and every caption, party name, line item
 * and paragraph carries its Arabic reading alongside. Figures, dates and
 * document numbers are written once — they read the same in both languages.
 */
export function CommercialDocument({ data }: { data: CommercialDocumentData }) {
  const isInvoice = data.kind === "invoice";
  const isVoid = data.status === "void";
  const isDraft = !data.number;
  const docName = isInvoice ? T.invoice : T.quote;
  const number = data.number ?? T.draft.en;
  const money = (n: number) => formatMoney(n, data.currency, "en");
  const plain = (n: number) => formatNumber(n, "en", Number.isInteger(n) ? 0 : 2);
  const date = (v: string) => formatDate(v, "en", "long");
  const balance = Math.max(0, data.total - (data.amountPaid ?? 0));

  const partyLines = [data.client.legalName, data.client.address, [data.client.city, data.client.country].filter(Boolean).join(", ")].filter((v): v is string => Boolean(v && v.trim()));
  if (data.client.taxNumber) partyLines.push(`${T.taxNumber.en} · ${data.client.taxNumber}`);

  const metaRows: MetaRow[] = [{ label: T.number, value: number }];
  if (data.issueDate) metaRows.push({ label: T.issueDate, value: date(data.issueDate) });
  if (isInvoice && data.dueDate) metaRows.push({ label: T.dueDate, value: date(data.dueDate) });
  if (!isInvoice && data.validUntil) metaRows.push({ label: T.validUntil, value: date(data.validUntil) });
  /* Code with its English name; the name is dropped when it is the code itself. */
  const currencyLabel = currencyName(data.currency, "en");
  metaRows.push({ label: T.currency, value: currencyLabel === data.currency ? data.currency : `${data.currency} · ${currencyLabel}` });
  if (data.quoteNumber) metaRows.push({ label: T.fromQuote, value: data.quoteNumber });
  if (data.replacesNumber) metaRows.push({ label: T.replaces, value: data.replacesNumber });
  if (data.projectCode) metaRows.push({ label: T.project, value: data.projectCode });

  const totalRows: TotalRow[] = [
    { label: T.subtotal, value: money(data.subtotal) },
    { label: { en: `${T.tax.en} (${plain(data.taxRate)}%)`, ar: T.tax.ar }, value: money(data.taxAmount) },
    { label: T.total, value: money(data.total), emphasis: "grand" },
  ];
  if (isInvoice && data.number) {
    totalRows.push({ label: T.paid, value: money(data.amountPaid ?? 0) });
    totalRows.push({ label: T.balance, value: money(balance), emphasis: "strong" });
  }

  return (
    <Document title={`${docName.en} ${number}`} author={company.legalName.en} creator="CyBarq Platform" producer="CyBarq Platform">
      <Page size="A4" style={s.page}>
        {/* Header: logo at the start, document type and number at the end */}
        <View style={s.header}>
          <BrandLogo width={96} />
          <View style={s.headEnd}>
            <Text style={s.docTitle}>{docName.en}</Text>
            <Text style={s.docTitleAr}>{docName.ar}</Text>
            {data.number ? <Text style={s.docNumber}>{data.number}</Text> : null}
            {isVoid ? <StatusStamp locale="en">{T.void.en}</StatusStamp> : isDraft ? <StatusStamp locale="en">{T.draft.en}</StatusStamp> : null}
          </View>
        </View>
        <AccentRule locale="en" marginTop={18} />

        {/* Party and document details */}
        <View style={s.meta}>
          <View style={s.party}>
            <PartyDetails label={isInvoice ? T.billTo : T.preparedFor} name={data.client.name.en} nameAr={data.client.name.ar} lines={partyLines} />
          </View>
          <View style={s.metaList}>
            <MetaList rows={metaRows} />
          </View>
        </View>

        {data.title ? (
          <View style={s.subject}>
            <BiSectionLabel label={T.subject} marginBottom={3} />
            <Text style={s.subjectText}>{data.title.en}</Text>
            {data.title.ar ? <Text style={s.subjectAr}>{data.title.ar}</Text> : null}
          </View>
        ) : null}

        <ItemsTable items={data.items} labels={{ description: T.description, quantity: T.quantity, unitPrice: T.unitPrice, amount: T.amount }} money={money} quantity={plain} />
        <TotalsBlock rows={totalRows} />

        {data.voidReason ? <SectionBlock heading={T.voidReason} text={{ en: data.voidReason, ar: null }} marginTop={18} /> : null}
        {data.notes ? <SectionBlock heading={T.notes} text={data.notes} marginTop={18} /> : null}
        {data.terms ? <SectionBlock heading={T.terms} text={data.terms} /> : null}

        <IssuanceNote en={ISSUANCE[data.kind].en} ar={ISSUANCE[data.kind].ar} />

        <DocumentFooter locale="en" data={data.footer} inset={PAGE_GRID.side} />
      </Page>
    </Document>
  );
}
