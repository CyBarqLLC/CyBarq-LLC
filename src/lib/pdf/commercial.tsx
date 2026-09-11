import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils/format";
import { company } from "@/content/site/company";
import { PDF_FONT_FAMILY } from "./fonts";
import { A4, PDF_COLORS, alignEnd, alignStart, rowDirection, sx } from "./theme";
import { BrandLogo, DocumentFooter, Rule } from "./primitives";
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
  from: "From",
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
  from: "من",
};

const STRINGS: Record<Locale, Record<keyof typeof EN, string>> = { en: EN, ar: AR };

const PAGE_PADDING_X = 44;
const CONTENT_WIDTH = A4.width - PAGE_PADDING_X * 2;

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9.5,
    fontWeight: 400,
    color: PDF_COLORS.graphite,
    paddingTop: 44,
    paddingHorizontal: PAGE_PADDING_X,
    paddingBottom: 112,
    lineHeight: 1.45,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  docTitle: { fontSize: 22, fontWeight: 300, lineHeight: 1.1 },
  docNumber: { fontSize: 10, fontWeight: 500, marginTop: 4 },
  stamp: { fontSize: 8, fontWeight: 500, color: PDF_COLORS.slate, marginTop: 2, letterSpacing: 1 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 22 },
  metaCol: { width: "48%" },
  label: { fontSize: 7.5, fontWeight: 500, color: PDF_COLORS.slate, letterSpacing: 0.6, marginBottom: 3 },
  partyName: { fontSize: 11, fontWeight: 500 },
  partyLine: { fontSize: 9, color: PDF_COLORS.slate },
  kvRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  kvKey: { fontSize: 8.5, color: PDF_COLORS.slate },
  kvVal: { fontSize: 9, fontWeight: 500 },
  title: { fontSize: 12, fontWeight: 500, marginTop: 20 },
  table: { marginTop: 14 },
  tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.fog, borderBottomStyle: "solid" },
  th: { fontSize: 7.5, fontWeight: 500, color: PDF_COLORS.slate, letterSpacing: 0.4 },
  cDesc: { flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingHorizontal: 4 },
  cQty: { width: 58, paddingHorizontal: 4 },
  cPrice: { width: 92, paddingHorizontal: 4 },
  cAmount: { width: 100, paddingHorizontal: 4 },
  totals: { flexDirection: "row", marginTop: 10 },
  totalsBox: { width: 250 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalKey: { fontSize: 9, color: PDF_COLORS.slate },
  totalVal: { fontSize: 9.5 },
  grand: { borderTopWidth: 1, borderTopColor: PDF_COLORS.graphite, borderTopStyle: "solid", marginTop: 3, paddingTop: 6 },
  grandText: { fontSize: 11.5, fontWeight: 500 },
  block: { marginTop: 18 },
  blockText: { fontSize: 9, color: PDF_COLORS.graphite },
});

function KeyValue({ k, v, locale }: { k: string; v: string; locale: Locale }) {
  return (
    <View style={sx(s.kvRow, { flexDirection: rowDirection(locale) })}>
      <Text style={sx(s.kvKey, { textAlign: alignStart(locale) })}>{k}</Text>
      <Text style={sx(s.kvVal, { textAlign: alignEnd(locale) })}>{v}</Text>
    </View>
  );
}

/** Invoice and quotation template. One layout, mirrored for Arabic. */
export function CommercialDocument({ data }: { data: CommercialDocumentData }) {
  const locale = data.language;
  const t = STRINGS[locale];
  const rtl = locale === "ar";
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  const end = alignEnd(locale);
  const isInvoice = data.kind === "invoice";
  const docName = isInvoice ? t.invoice : t.quote;
  const number = data.number ?? t.draft;
  const money = (n: number) => formatMoney(n, data.currency, locale);
  const stamp = data.status === "void" ? t.void : data.number ? null : t.draft;
  const balance = Math.max(0, data.total - (data.amountPaid ?? 0));
  const partyLines = [data.client.legalName, data.client.address, [data.client.city, data.client.country].filter(Boolean).join(", ")].filter((v): v is string => Boolean(v && v.trim()));

  return (
    <Document title={`${docName} ${number}`} author={company.legalName.en} creator="CyBarq Platform" producer="CyBarq Platform">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={sx(s.header, { flexDirection: dir })}>
          <BrandLogo width={104} />
          <View style={{ alignItems: rtl ? "flex-start" : "flex-end" }}>
            <Text style={sx(s.docTitle, { textAlign: end })}>{docName}</Text>
            <Text style={sx(s.docNumber, { textAlign: end })}>{number}</Text>
            {stamp ? <Text style={sx(s.stamp, { textAlign: end })}>{stamp.toUpperCase()}</Text> : null}
          </View>
        </View>
        <Rule marginTop={16} />

        {/* Parties and meta */}
        <View style={sx(s.meta, { flexDirection: dir })}>
          <View style={s.metaCol}>
            <Text style={sx(s.label, { textAlign: start })}>{isInvoice ? t.billTo : t.preparedFor}</Text>
            <Text style={sx(s.partyName, { textAlign: start })}>{data.client.name}</Text>
            {partyLines.map((line, i) => (
              <Text key={i} style={sx(s.partyLine, { textAlign: start })}>{line}</Text>
            ))}
            {data.client.taxNumber ? <Text style={sx(s.partyLine, { textAlign: start })}>{`${t.taxNumber}: ${data.client.taxNumber}`}</Text> : null}
          </View>
          <View style={s.metaCol}>
            <KeyValue k={t.number} v={number} locale={locale} />
            {data.issueDate ? <KeyValue k={t.issueDate} v={formatDate(data.issueDate, locale, "long")} locale={locale} /> : null}
            {isInvoice && data.dueDate ? <KeyValue k={t.dueDate} v={formatDate(data.dueDate, locale, "long")} locale={locale} /> : null}
            {!isInvoice && data.validUntil ? <KeyValue k={t.validUntil} v={formatDate(data.validUntil, locale, "long")} locale={locale} /> : null}
            <KeyValue k={t.currency} v={data.currency} locale={locale} />
            {data.quoteNumber ? <KeyValue k={t.fromQuote} v={data.quoteNumber} locale={locale} /> : null}
            {data.replacesNumber ? <KeyValue k={t.replaces} v={data.replacesNumber} locale={locale} /> : null}
          </View>
        </View>

        {data.title ? <Text style={sx(s.title, { textAlign: start })}>{data.title}</Text> : null}

        {/* Items */}
        <View style={s.table}>
          <View style={sx(s.tr, { flexDirection: dir, borderBottomColor: PDF_COLORS.graphite })}>
            <Text style={sx(s.th, s.cDesc, { textAlign: start })}>{t.description}</Text>
            <Text style={sx(s.th, s.cQty, { textAlign: end })}>{t.quantity}</Text>
            <Text style={sx(s.th, s.cPrice, { textAlign: end })}>{t.unitPrice}</Text>
            <Text style={sx(s.th, s.cAmount, { textAlign: end })}>{t.amount}</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} wrap={false} style={sx(s.tr, { flexDirection: dir })}>
              <Text style={sx(s.cDesc, { textAlign: start })}>{item.description}</Text>
              <Text style={sx(s.cQty, { textAlign: end })}>{formatNumber(item.quantity, locale, Number.isInteger(item.quantity) ? 0 : 2)}</Text>
              <Text style={sx(s.cPrice, { textAlign: end })}>{money(item.unitPrice)}</Text>
              <Text style={sx(s.cAmount, { textAlign: end })}>{money(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View wrap={false} style={sx(s.totals, { justifyContent: rtl ? "flex-start" : "flex-end" })}>
          <View style={s.totalsBox}>
            <View style={sx(s.totalRow, { flexDirection: dir })}>
              <Text style={sx(s.totalKey, { textAlign: start })}>{t.subtotal}</Text>
              <Text style={sx(s.totalVal, { textAlign: end })}>{money(data.subtotal)}</Text>
            </View>
            <View style={sx(s.totalRow, { flexDirection: dir })}>
              <Text style={sx(s.totalKey, { textAlign: start })}>{`${t.tax} (${formatNumber(data.taxRate, locale, Number.isInteger(data.taxRate) ? 0 : 2)}%)`}</Text>
              <Text style={sx(s.totalVal, { textAlign: end })}>{money(data.taxAmount)}</Text>
            </View>
            <View style={sx(s.totalRow, s.grand, { flexDirection: dir })}>
              <Text style={sx(s.grandText, { textAlign: start })}>{t.total}</Text>
              <Text style={sx(s.grandText, { textAlign: end })}>{money(data.total)}</Text>
            </View>
            {isInvoice && data.number ? (
              <>
                <View style={sx(s.totalRow, { flexDirection: dir })}>
                  <Text style={sx(s.totalKey, { textAlign: start })}>{t.paid}</Text>
                  <Text style={sx(s.totalVal, { textAlign: end })}>{money(data.amountPaid ?? 0)}</Text>
                </View>
                <View style={sx(s.totalRow, { flexDirection: dir })}>
                  <Text style={sx(s.totalKey, { textAlign: start, fontWeight: 500 })}>{t.balance}</Text>
                  <Text style={sx(s.totalVal, { textAlign: end, fontWeight: 500 })}>{money(balance)}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {data.voidReason ? (
          <View style={s.block}>
            <Text style={sx(s.label, { textAlign: start })}>{t.voidReason}</Text>
            <Text style={sx(s.blockText, { textAlign: start })}>{data.voidReason}</Text>
          </View>
        ) : null}
        {data.notes ? (
          <View style={s.block}>
            <Text style={sx(s.label, { textAlign: start })}>{t.notes}</Text>
            <Text style={sx(s.blockText, { textAlign: start })}>{data.notes}</Text>
          </View>
        ) : null}
        {data.terms ? (
          <View style={s.block}>
            <Text style={sx(s.label, { textAlign: start })}>{t.terms}</Text>
            <Text style={sx(s.blockText, { textAlign: start })}>{data.terms}</Text>
          </View>
        ) : null}

        <DocumentFooter locale={locale} contentWidth={CONTENT_WIDTH} legalSmallPrint />
      </Page>
    </Document>
  );
}
