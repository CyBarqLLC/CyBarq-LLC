import { Document, Page, View, Text, Image as PdfImage, StyleSheet } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { company } from "@/content/site/company";
import { CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";
import { PDF_FONT_FAMILY } from "./fonts";
import { PDF_COLORS, alignEnd, alignStart, rowDirection, sx } from "./theme";
import { BrandLogo, BrandSymbol, CornerMarks } from "./primitives";
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
  issued: "Issued on",
  number: "Certificate no.",
  verify: "Verify this certificate at",
  revoked: "REVOKED",
  draft: "DRAFT",
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
  issued: "تاريخ الإصدار",
  number: "رقم الشهادة",
  verify: "للتحقق من هذه الشهادة",
  revoked: "ملغاة",
  draft: "مسودة",
};

const STRINGS: Record<Locale, Record<keyof typeof EN, string>> = { en: EN, ar: AR };

const PAD = 56;

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 11,
    fontWeight: 400,
    color: PDF_COLORS.graphite,
    paddingTop: 48,
    paddingHorizontal: PAD,
    paddingBottom: 44,
    lineHeight: 1.4,
  },
  top: { alignItems: "center" },
  body: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  type: { fontSize: 9.5, fontWeight: 500, letterSpacing: 2.5, color: PDF_COLORS.slate, textAlign: "center", marginTop: 26 },
  certify: { fontSize: 12, color: PDF_COLORS.slate, textAlign: "center", marginTop: 26 },
  name: { fontSize: 38, fontWeight: 300, lineHeight: 1.15, textAlign: "center", marginTop: 6 },
  lead: { fontSize: 12, color: PDF_COLORS.slate, textAlign: "center", marginTop: 16 },
  title: { fontSize: 18, fontWeight: 500, textAlign: "center", marginTop: 4, maxWidth: 620 },
  sub: { fontSize: 13, textAlign: "center", marginTop: 4, maxWidth: 620 },
  desc: { fontSize: 10, color: PDF_COLORS.slate, textAlign: "center", marginTop: 12, maxWidth: 560, lineHeight: 1.5 },
  facts: { fontSize: 10.5, textAlign: "center", marginTop: 14, color: PDF_COLORS.graphite },
  bottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 },
  col: { width: "32%" },
  small: { fontSize: 8, color: PDF_COLORS.slate, lineHeight: 1.45 },
  smallStrong: { fontSize: 9, fontWeight: 500, color: PDF_COLORS.graphite },
  signLine: { borderTopWidth: 1, borderTopColor: PDF_COLORS.graphite, borderTopStyle: "solid", width: 180, paddingTop: 5 },
  qr: { width: 58, height: 58 },
  stamp: { position: "absolute", top: 46, fontSize: 8, fontWeight: 500, letterSpacing: 2, color: PDF_COLORS.slate },
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

/** Certificate: landscape A4, generous whitespace, corner marks as the only decoration. */
export function CertificateDocument({ data }: { data: CertificateDocumentData }) {
  const locale = data.language;
  const t = STRINGS[locale];
  const rtl = locale === "ar";
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  const end = alignEnd(locale);
  const typeLabel = label(CERTIFICATE_TYPE_LABELS, data.type, locale);
  const lead = leadFor(data.type, t);
  const mainLine = data.type === "experience" ? data.roleTitle ?? data.title : data.programName ?? data.title;
  const showTitleSeparately = mainLine !== data.title;
  const periodText = data.startDate && data.endDate
    ? fill(t.period, { start: formatDate(data.startDate, locale, "long"), end: formatDate(data.endDate, locale, "long") })
    : data.startDate
      ? fill(t.since, { start: formatDate(data.startDate, locale, "long") })
      : "";
  const hoursText = data.hours ? fill(t.hours, { hours: formatNumber(data.hours, locale, Number.isInteger(data.hours) ? 0 : 1) }) : "";
  const facts = [periodText, hoursText].filter(Boolean).join("  ·  ");
  const stamp = data.status === "revoked" ? t.revoked : data.status === "draft" ? t.draft : null;

  return (
    <Document title={`${typeLabel} ${data.certificateNo ?? ""}`.trim()} author={company.legalName.en} creator="CyBarq Platform" producer="CyBarq Platform">
      <Page size="A4" orientation="landscape" style={s.page}>
        <CornerMarks inset={26} size={14} />
        {stamp ? <Text style={sx(s.stamp, rtl ? { left: PAD } : { right: PAD })}>{stamp}</Text> : null}

        <View style={s.top}>
          <BrandLogo width={124} />
          <Text style={s.type}>{rtl ? typeLabel : typeLabel.toUpperCase()}</Text>
        </View>

        <View style={s.body}>
          <Text style={s.certify}>{t.certify}</Text>
          <Text style={s.name}>{data.recipientName}</Text>
          {lead ? <Text style={s.lead}>{lead}</Text> : null}
          <Text style={s.title}>{mainLine}</Text>
          {showTitleSeparately ? <Text style={s.sub}>{data.title}</Text> : null}
          {data.description ? <Text style={s.desc}>{data.description}</Text> : null}
          {facts ? <Text style={s.facts}>{facts}</Text> : null}
        </View>

        <View style={sx(s.bottom, { flexDirection: dir })}>
          {/* Issue details */}
          <View style={s.col}>
            <Text style={sx(s.small, { textAlign: start })}>{t.issued}</Text>
            <Text style={sx(s.smallStrong, { textAlign: start })}>{data.issueDate ? formatDate(data.issueDate, locale, "long") : ""}</Text>
            <View style={sx({ flexDirection: dir, alignItems: "center", marginTop: 6 })}>
              <BrandSymbol size={9} />
              <Text style={sx(s.small, { marginHorizontal: 4, textAlign: start })}>{`${t.number} ${data.certificateNo ?? ""}`.trim()}</Text>
            </View>
          </View>

          {/* Signatory */}
          <View style={sx(s.col, { alignItems: "center" })}>
            {data.signatoryName ? (
              <View style={s.signLine}>
                <Text style={sx(s.smallStrong, { textAlign: "center" })}>{data.signatoryName}</Text>
                {data.signatoryTitle ? <Text style={sx(s.small, { textAlign: "center" })}>{data.signatoryTitle}</Text> : null}
                <Text style={sx(s.small, { textAlign: "center" })}>{company.legalName[locale]}</Text>
              </View>
            ) : (
              <View style={s.signLine}>
                <Text style={sx(s.small, { textAlign: "center" })}>{company.legalName[locale]}</Text>
                <Text style={sx(s.small, { textAlign: "center" })}>{company.city[locale]}</Text>
              </View>
            )}
          </View>

          {/* Verification */}
          <View style={sx(s.col, { alignItems: rtl ? "flex-start" : "flex-end" })}>
            <PdfImage src={data.qrDataUrl} style={s.qr} />
            <Text style={sx(s.small, { marginTop: 4, textAlign: end })}>{t.verify}</Text>
            <Text style={sx(s.small, { textAlign: end, color: PDF_COLORS.graphite })}>{data.verificationUrl}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
