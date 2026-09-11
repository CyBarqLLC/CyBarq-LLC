import { Document, Page, View, Text, Image as PdfImage, StyleSheet } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { company } from "@/content/site/company";
import { CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";
import { PDF_FONT_FAMILY } from "./fonts";
import { FOOTER_RESERVE, PAGE_GRID, PDF_COLORS, TYPE, alignEnd, alignStart, itemsEnd, itemsStart, labelText, labelTracking, rowDirection, sx } from "./theme";
import { AccentRule, BrandLogo, DocumentFooter, Label, StatusStamp } from "./primitives";
import type { CertificateDocumentData } from "./types";

const EN = {
  certify: "This is to certify that",
  completed: "has successfully completed",
  attended: "has completed",
  worked: "has worked with CyBarq Technology LLC as",
  awarded: "is recognised for",
  period: "From {start} to {end}",
  since: "Since {start}",
  hours: "{hours} hours",
  programme: "Programme",
  role: "Role",
  periodLabel: "Period",
  hoursLabel: "Duration",
  issued: "Issued on",
  issuedBy: "Issued by",
  number: "Certificate no.",
  verify: "Verify this certificate",
  revoked: "Revoked",
  draft: "Draft",
};

const AR: Record<keyof typeof EN, string> = {
  certify: "نشهد بأن",
  completed: "قد أتمّ بنجاح",
  attended: "قد أكمل",
  worked: "قد عمل لدى شركة سايبرق للتكنولوجيا بصفة",
  awarded: "تقديراً لـ",
  period: "من {start} إلى {end}",
  since: "منذ {start}",
  hours: "{hours} ساعة",
  programme: "البرنامج",
  role: "الدور الوظيفي",
  periodLabel: "الفترة",
  hoursLabel: "المدة",
  issued: "تاريخ الإصدار",
  issuedBy: "صادرة عن",
  number: "رقم الشهادة",
  verify: "للتحقق من هذه الشهادة",
  revoked: "ملغاة",
  draft: "مسودة",
};

const STRINGS: Record<Locale, Record<keyof typeof EN, string>> = { en: EN, ar: AR };

const PAD = PAGE_GRID.sideWide;
const TEXT_WIDTH = 600;

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: TYPE.body,
    fontWeight: 400,
    color: PDF_COLORS.graphite,
    paddingTop: PAGE_GRID.top + 4,
    paddingHorizontal: PAD,
    paddingBottom: FOOTER_RESERVE,
    lineHeight: 1.4,
  },
  header: { justifyContent: "space-between", alignItems: "flex-start" },
  headerEnd: { paddingTop: 2 },
  number: { fontSize: TYPE.body, fontWeight: 500, lineHeight: 1.4 },
  body: { flexGrow: 1, paddingTop: 12 },
  type: { fontSize: 8.5, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.4 },
  certify: { fontSize: 11, color: PDF_COLORS.slate, marginTop: 18, lineHeight: 1.4 },
  name: { fontSize: 32, fontWeight: 300, lineHeight: 1.15, marginTop: 4 },
  lead: { fontSize: 11, color: PDF_COLORS.slate, marginTop: 10, lineHeight: 1.4 },
  main: { fontSize: TYPE.title, fontWeight: 500, lineHeight: 1.3, marginTop: 2, maxWidth: TEXT_WIDTH },
  sub: { fontSize: TYPE.subhead, lineHeight: 1.35, marginTop: 2, maxWidth: TEXT_WIDTH },
  desc: { fontSize: TYPE.body, color: PDF_COLORS.slate, lineHeight: 1.5, marginTop: 8, maxWidth: TEXT_WIDTH },
  facts: { marginTop: 16, width: 380 },
  factRow: { alignItems: "flex-start", paddingVertical: 2.5 },
  factKey: { width: 104, fontSize: TYPE.label, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.5, paddingTop: 2 },
  factValue: { flexGrow: 1, flexShrink: 1, flexBasis: 0, fontSize: TYPE.body + 0.5, lineHeight: 1.5 },
  bottom: { justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 },
  issuer: { width: "42%" },
  signLine: { borderTopWidth: 1, borderTopColor: PDF_COLORS.graphite, borderTopStyle: "solid", width: 170, paddingTop: 5 },
  strong: { fontSize: TYPE.body, fontWeight: 500, lineHeight: 1.45 },
  small: { fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.45 },
  verify: { alignItems: "flex-end" },
  verifyText: { justifyContent: "flex-end", marginHorizontal: 10, maxWidth: 260 },
  url: { fontSize: TYPE.small, color: PDF_COLORS.graphite, lineHeight: 1.45 },
  qr: { width: 56, height: 56 },
});

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
}

function leadFor(type: Enums<"certificate_type">, t: Record<keyof typeof EN, string>): string {
  switch (type) {
    case "training":
      return t.completed;
    case "internship":
      return t.attended;
    case "experience":
      return t.worked;
    case "appreciation":
      return t.awarded;
    default:
      return "";
  }
}

/** Certificate: landscape A4, start aligned, generous whitespace. */
export function CertificateDocument({ data }: { data: CertificateDocumentData }) {
  const locale = data.language;
  const t = STRINGS[locale];
  const rtl = locale === "ar";
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  const end = alignEnd(locale);
  /* Capped-width blocks sit at the start side; in Arabic that is the right edge. */
  const endSelf = rtl && { alignSelf: "flex-end" as const };
  const typeLabel = label(CERTIFICATE_TYPE_LABELS, data.type, locale);
  const lead = leadFor(data.type, t);
  const mainLine = data.type === "experience" ? (data.roleTitle ?? data.title) : (data.programName ?? data.title);
  const showTitleSeparately = mainLine !== data.title;
  const periodText = data.startDate && data.endDate
    ? fill(t.period, { start: formatDate(data.startDate, locale, "long"), end: formatDate(data.endDate, locale, "long") })
    : data.startDate
      ? fill(t.since, { start: formatDate(data.startDate, locale, "long") })
      : "";
  const hoursText = data.hours ? fill(t.hours, { hours: formatNumber(data.hours, locale, Number.isInteger(data.hours) ? 0 : 1) }) : "";
  const stamp = data.status === "revoked" ? t.revoked : data.status === "draft" ? t.draft : null;

  const facts: Array<{ label: string; value: string }> = [];
  if (data.programName && data.programName !== mainLine) facts.push({ label: t.programme, value: data.programName });
  if (data.roleTitle && data.roleTitle !== mainLine) facts.push({ label: t.role, value: data.roleTitle });
  if (periodText) facts.push({ label: t.periodLabel, value: periodText });
  if (hoursText) facts.push({ label: t.hoursLabel, value: hoursText });
  if (data.issueDate) facts.push({ label: t.issued, value: formatDate(data.issueDate, locale, "long") });

  return (
    <Document title={`${typeLabel} ${data.certificateNo ?? ""}`.trim()} author={company.legalName.en} creator="CyBarq Platform" producer="CyBarq Platform">
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header: logo at the start, certificate number and status at the end */}
        <View style={sx(s.header, { flexDirection: dir })}>
          <BrandLogo width={112} />
          <View style={sx(s.headerEnd, { alignItems: itemsEnd(locale) })}>
            {data.certificateNo ? (
              <>
                <Label locale={locale} align={end} marginBottom={2}>
                  {t.number}
                </Label>
                <Text style={sx(s.number, { textAlign: end })}>{data.certificateNo}</Text>
              </>
            ) : null}
            {stamp ? <StatusStamp locale={locale}>{stamp}</StatusStamp> : null}
          </View>
        </View>
        <AccentRule locale={locale} marginTop={18} />

        {/* Statement */}
        <View style={s.body}>
          <Text style={sx(s.type, { textAlign: start, letterSpacing: rtl ? 0 : 1.2 })}>{labelText(typeLabel, locale)}</Text>
          <Text style={sx(s.certify, { textAlign: start })}>{t.certify}</Text>
          <Text style={sx(s.name, { textAlign: start })}>{data.recipientName}</Text>
          {lead ? <Text style={sx(s.lead, { textAlign: start })}>{lead}</Text> : null}
          <Text style={sx(s.main, endSelf, { textAlign: start })}>{mainLine}</Text>
          {showTitleSeparately ? <Text style={sx(s.sub, endSelf, { textAlign: start })}>{data.title}</Text> : null}
          {data.description ? <Text style={sx(s.desc, endSelf, { textAlign: start })}>{data.description}</Text> : null}

          {facts.length ? (
            <View style={sx(s.facts, endSelf)}>
              {facts.map((fact, i) => (
                <View key={i} style={sx(s.factRow, { flexDirection: dir })}>
                  <Text style={sx(s.factKey, { textAlign: start, letterSpacing: labelTracking(locale) })}>{labelText(fact.label, locale)}</Text>
                  <Text style={sx(s.factValue, { textAlign: start })}>{fact.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Issuer or signatory at the start, verification at the end */}
        <View style={sx(s.bottom, { flexDirection: dir })}>
          <View style={sx(s.issuer, { alignItems: itemsStart(locale) })}>
            {data.signatoryName ? (
              <View style={s.signLine}>
                <Text style={sx(s.strong, { textAlign: start })}>{data.signatoryName}</Text>
                {data.signatoryTitle ? <Text style={sx(s.small, { textAlign: start })}>{data.signatoryTitle}</Text> : null}
                <Text style={sx(s.small, { textAlign: start })}>{company.legalName[locale]}</Text>
              </View>
            ) : (
              <View>
                <Label locale={locale} marginBottom={3}>
                  {t.issuedBy}
                </Label>
                <Text style={sx(s.strong, { textAlign: start })}>{company.legalName[locale]}</Text>
                <Text style={sx(s.small, { textAlign: start })}>{company.city[locale]}</Text>
              </View>
            )}
          </View>

          <View style={sx(s.verify, { flexDirection: dir })}>
            <View style={s.verifyText}>
              <Label locale={locale} align={end} marginBottom={3}>
                {t.verify}
              </Label>
              <Text style={sx(s.url, { textAlign: end })}>{data.verificationUrl}</Text>
            </View>
            <PdfImage src={data.qrDataUrl} style={s.qr} />
          </View>
        </View>

        <DocumentFooter locale={locale} data={data.footer} inset={PAD} />
      </Page>
    </Document>
  );
}
