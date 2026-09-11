import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";
import { currencyName, formatDate, formatMoney, formatNumber } from "@/lib/utils/format";
import { company } from "@/content/site/company";
import { PDF_FONT_FAMILY } from "./fonts";
import { FOOTER_RESERVE, PAGE_GRID, PDF_COLORS, TYPE, alignEnd, alignStart, itemsEnd, rowDirection, sx } from "./theme";
import { AccentRule, BrandLogo, DocumentFooter, ItemsTable, Label, MetaList, PartyDetails, SectionBlock, StatusStamp, TotalsBlock, type MetaRow, type TotalRow } from "./primitives";
import type { CommercialDocumentData } from "./types";

const EN = {
  invoice: "Invoice",
  quote: "Quotation",
  draft: "Draft",
  void: "Void",
  billTo: "Bill to",
  preparedFor: "Prepared for",
  number: "Number",
  issueDate: "Issue date",
  dueDate: "Due date",
  validUntil: "Valid until",
  currency: "Currency",
  project: "Project",
  subject: "Subject",
  description: "Description",
  quantity: "Qty",
  unitPrice: "Unit price",
  amount: "Amount",
  subtotal: "Subtotal",
  tax: "Tax",
  total: "Total",
  paid: "Paid",
  balance: "Balance due",
  notes: "Notes",
  terms: "Terms",
  taxNumber: "Tax number",
  replaces: "Replaces",
  fromQuote: "Quote reference",
  voidReason: "Void reason",
};

const AR: Record<keyof typeof EN, string> = {
  invoice: "فاتورة",
  quote: "عرض سعر",
  draft: "مسودة",
  void: "ملغاة",
  billTo: "الفاتورة إلى",
  preparedFor: "مقدّم إلى",
  number: "الرقم",
  issueDate: "تاريخ الإصدار",
  dueDate: "تاريخ الاستحقاق",
  validUntil: "صالح حتى",
  currency: "العملة",
  project: "المشروع",
  subject: "الموضوع",
  description: "البيان",
  quantity: "الكمية",
  unitPrice: "سعر الوحدة",
  amount: "المبلغ",
  subtotal: "المجموع الفرعي",
  tax: "الضريبة",
  total: "الإجمالي",
  paid: "المدفوع",
  balance: "الرصيد المستحق",
  notes: "ملاحظات",
  terms: "الشروط",
  taxNumber: "الرقم الضريبي",
  replaces: "تحل محل",
  fromQuote: "مرجع عرض السعر",
  voidReason: "سبب الإلغاء",
};

const STRINGS: Record<Locale, Record<keyof typeof EN, string>> = { en: EN, ar: AR };

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
  header: { justifyContent: "space-between", alignItems: "flex-start" },
  docTitle: { fontSize: TYPE.headline, fontWeight: 300, lineHeight: 1.15 },
  docNumber: { fontSize: TYPE.body, fontWeight: 500, color: PDF_COLORS.graphite, marginTop: 3, lineHeight: 1.4 },
  meta: { justifyContent: "space-between", alignItems: "flex-start", marginTop: 26 },
  party: { width: "50%", paddingTop: 2 },
  metaList: { width: "42%" },
  subject: { marginTop: 22 },
  subjectText: { fontSize: TYPE.subhead, fontWeight: 500, lineHeight: 1.35 },
});

/** Invoice and quotation template. One layout, mirrored for Arabic. */
export function CommercialDocument({ data }: { data: CommercialDocumentData }) {
  const locale = data.language;
  const t = STRINGS[locale];
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  const end = alignEnd(locale);
  const isInvoice = data.kind === "invoice";
  const isVoid = data.status === "void";
  const isDraft = !data.number;
  const docName = isInvoice ? t.invoice : t.quote;
  const number = data.number ?? t.draft;
  const money = (n: number) => formatMoney(n, data.currency, locale);
  const plain = (n: number) => formatNumber(n, locale, Number.isInteger(n) ? 0 : 2);
  const balance = Math.max(0, data.total - (data.amountPaid ?? 0));

  const partyLines = [data.client.legalName, data.client.address, [data.client.city, data.client.country].filter(Boolean).join(", ")].filter((v): v is string => Boolean(v && v.trim()));
  if (data.client.taxNumber) partyLines.push(`${t.taxNumber}: ${data.client.taxNumber}`);

  const metaRows: MetaRow[] = [{ label: t.number, value: number }];
  if (data.issueDate) metaRows.push({ label: t.issueDate, value: formatDate(data.issueDate, locale, "long") });
  if (isInvoice && data.dueDate) metaRows.push({ label: t.dueDate, value: formatDate(data.dueDate, locale, "long") });
  if (!isInvoice && data.validUntil) metaRows.push({ label: t.validUntil, value: formatDate(data.validUntil, locale, "long") });
  const currencyLabel = currencyName(data.currency, locale);
  metaRows.push({ label: t.currency, value: currencyLabel === data.currency ? data.currency : `${data.currency} · ${currencyLabel}` });
  if (data.quoteNumber) metaRows.push({ label: t.fromQuote, value: data.quoteNumber });
  if (data.replacesNumber) metaRows.push({ label: t.replaces, value: data.replacesNumber });
  if (data.projectCode) metaRows.push({ label: t.project, value: data.projectCode });

  const totalRows: TotalRow[] = [
    { label: t.subtotal, value: money(data.subtotal) },
    { label: `${t.tax} (${plain(data.taxRate)}%)`, value: money(data.taxAmount) },
    { label: t.total, value: money(data.total), emphasis: "grand" },
  ];
  if (isInvoice && data.number) {
    totalRows.push({ label: t.paid, value: money(data.amountPaid ?? 0) });
    totalRows.push({ label: t.balance, value: money(balance), emphasis: "strong" });
  }

  return (
    <Document title={`${docName} ${number}`} author={company.legalName.en} creator="CyBarq Platform" producer="CyBarq Platform">
      <Page size="A4" style={s.page}>
        {/* Header: logo at the start, document type and number at the end */}
        <View style={sx(s.header, { flexDirection: dir })}>
          <BrandLogo width={96} />
          <View style={{ alignItems: itemsEnd(locale) }}>
            <Text style={sx(s.docTitle, { textAlign: end })}>{docName}</Text>
            {data.number ? <Text style={sx(s.docNumber, { textAlign: end })}>{data.number}</Text> : null}
            {isVoid ? <StatusStamp locale={locale}>{t.void}</StatusStamp> : isDraft ? <StatusStamp locale={locale}>{t.draft}</StatusStamp> : null}
          </View>
        </View>
        <AccentRule locale={locale} marginTop={18} />

        {/* Party and document details */}
        <View style={sx(s.meta, { flexDirection: dir })}>
          <View style={s.party}>
            <PartyDetails locale={locale} label={isInvoice ? t.billTo : t.preparedFor} name={data.client.name} lines={partyLines} />
          </View>
          <View style={s.metaList}>
            <MetaList locale={locale} rows={metaRows} />
          </View>
        </View>

        {data.title ? (
          <View style={s.subject}>
            <Label locale={locale} marginBottom={3}>
              {t.subject}
            </Label>
            <Text style={sx(s.subjectText, { textAlign: start })}>{data.title}</Text>
          </View>
        ) : null}

        <ItemsTable locale={locale} items={data.items} labels={{ description: t.description, quantity: t.quantity, unitPrice: t.unitPrice, amount: t.amount }} money={money} quantity={plain} />
        <TotalsBlock locale={locale} rows={totalRows} />

        {data.voidReason ? <SectionBlock locale={locale} heading={t.voidReason} text={data.voidReason} marginTop={24} /> : null}
        {data.notes ? <SectionBlock locale={locale} heading={t.notes} text={data.notes} marginTop={24} /> : null}
        {data.terms ? <SectionBlock locale={locale} heading={t.terms} text={data.terms} /> : null}

        <DocumentFooter locale={locale} data={data.footer} inset={PAGE_GRID.side} />
      </Page>
    </Document>
  );
}
