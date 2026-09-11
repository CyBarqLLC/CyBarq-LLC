import { View, Text, Svg, Path, Polygon, Image as PdfImage, StyleSheet } from "@react-pdf/renderer";
import { PRIMARY_PATHS, PRIMARY_VIEWBOX, SYMBOL_PATHS, SYMBOL_VIEWBOX } from "@/components/brand/logo-paths";
import { computeStream } from "@/components/brand/stream-math";
import type { Locale } from "@/i18n/routing";
import { PAGE_GRID, PDF_COLORS, TYPE, alignEnd, alignStart, itemsEnd, labelText, labelTracking, rowDirection, sx, type PdfStyle } from "./theme";
import type { CommercialItem, DocumentFooterData } from "./types";

/* Aspect ratios from the master view boxes. */
const PRIMARY_RATIO = 32.176 / 132.676;
const SYMBOL_RATIO = 32.176 / 31.301;

/** Primary logo (symbol + wordmark) as vector paths. */
export function BrandLogo({ width = 104, color = PDF_COLORS.graphite }: { width?: number; color?: string }) {
  return (
    <Svg viewBox={PRIMARY_VIEWBOX} width={width} height={width * PRIMARY_RATIO}>
      {PRIMARY_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

/** Symbol alone: page signature and marks. */
export function BrandSymbol({ size = 10, color = PDF_COLORS.graphite }: { size?: number; color?: string }) {
  return (
    <Svg viewBox={SYMBOL_VIEWBOX} width={size / SYMBOL_RATIO} height={size}>
      {SYMBOL_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

const f = (v: number) => (Math.round(v * 100) / 100).toString();

/**
 * A thin Stream: the Flux Field as a quiet line. Kept light (under 200
 * blades) so documents stay small and render fast.
 */
export function StreamLine({ width, height = 30, ink = PDF_COLORS.graphite, accent = PDF_COLORS.blue }: { width: number; height?: number; ink?: string; accent?: string }) {
  const step = Math.max(10, Math.ceil(Math.sqrt((width * height) / 150)));
  const blades = computeStream(width, height, step, { spread: 0.3, amp: 0.12, freq: 3.4, alpha: 0.75, share: 0.05, floor: 0, fadeIn: 1.6, fadeRight: true, fadeOut: 2.5 }, 0).slice(0, 200);
  return (
    <Svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {blades.map((b, i) => {
        const p = b.points;
        return <Polygon key={i} points={`${f(p[0])},${f(p[1])} ${f(p[2])},${f(p[3])} ${f(p[4])},${f(p[5])}`} fill={b.accent ? accent : ink} fillOpacity={Math.round(b.alpha * 100) / 100} />;
      })}
    </Svg>
  );
}

const MARKS = [
  { points: "1,1 15.2,15.2 11.15,22.97", pos: { top: true, left: true } },
  { points: "23,1 8.8,15.2 1.03,11.15", pos: { top: true, left: false } },
  { points: "1,23 15.2,8.8 22.97,12.85", pos: { top: false, left: true } },
  { points: "23,23 8.8,8.8 12.85,1.03", pos: { top: false, left: false } },
] as const;

/** Corner marks: the four blades of the symbol opened to the corners of the page. */
export function CornerMarks({ inset = 28, size = 14, color = PDF_COLORS.graphite }: { inset?: number; size?: number; color?: string }) {
  return (
    <>
      {MARKS.map((m, i) => (
        <View
          key={i}
          fixed
          style={{
            position: "absolute",
            ...(m.pos.top ? { top: inset } : { bottom: inset }),
            ...(m.pos.left ? { left: inset } : { right: inset }),
          }}
        >
          <Svg viewBox="0 0 24 24" width={size} height={size}>
            <Polygon points={m.points} fill={color} />
          </Svg>
        </View>
      ))}
    </>
  );
}

/** 1pt Fog rule. */
export function Rule({ color = PDF_COLORS.fog, marginTop = 0, marginBottom = 0 }: { color?: string; marginTop?: number; marginBottom?: number }) {
  return <View style={{ borderBottomWidth: 1, borderBottomColor: color, borderBottomStyle: "solid", marginTop, marginBottom }} />;
}

/**
 * The page's one accent: a hairline with a short CyBarq Blue segment at the
 * start side.
 */
export function AccentRule({ locale, marginTop = 0, marginBottom = 0 }: { locale: Locale; marginTop?: number; marginBottom?: number }) {
  return (
    <View style={{ flexDirection: rowDirection(locale), alignItems: "center", marginTop, marginBottom }}>
      <View style={{ width: 28, height: 1.5, backgroundColor: PDF_COLORS.blue }} />
      <View style={{ flexGrow: 1, height: 1, backgroundColor: PDF_COLORS.fog }} />
    </View>
  );
}

const shared = StyleSheet.create({
  label: { fontSize: TYPE.label, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.4 },
  small: { fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.45 },
  body: { fontSize: TYPE.body, color: PDF_COLORS.graphite, lineHeight: 1.5 },
});

/** Small-caps style label: uppercase and tracked in English, plain in Arabic. */
export function Label({ locale, children, align, marginBottom = 0, color = PDF_COLORS.slate }: { locale: Locale; children: string; align?: "left" | "right" | "center"; marginBottom?: number; color?: string }) {
  return <Text style={sx(shared.label, { textAlign: align ?? alignStart(locale), letterSpacing: labelTracking(locale), marginBottom, color })}>{labelText(children, locale)}</Text>;
}

/** Outlined status label (DRAFT, VOID, REVOKED): a quiet stamp, never a watermark. */
export function StatusStamp({ locale, children }: { locale: Locale; children: string }) {
  return (
    <View style={{ alignSelf: itemsEnd(locale), borderWidth: 1, borderColor: PDF_COLORS.slate, borderStyle: "solid", borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2.5, marginTop: 6 }}>
      <Text style={{ fontSize: TYPE.small, fontWeight: 500, color: PDF_COLORS.slate, letterSpacing: labelTracking(locale), lineHeight: 1.2 }}>{labelText(children, locale)}</Text>
    </View>
  );
}

export type MetaRow = { label: string; value: string };

const meta = StyleSheet.create({
  row: { justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 3.5, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.fog, borderBottomStyle: "solid" },
  key: { width: 88, fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.5, paddingTop: 0.5 },
  value: { flexGrow: 1, flexShrink: 1, flexBasis: 0, fontSize: TYPE.body, fontWeight: 500, lineHeight: 1.5 },
});

/** Labelled key/value list separated by hairlines; keys at the start, values at the end. */
export function MetaList({ locale, rows }: { locale: Locale; rows: MetaRow[] }) {
  const dir = rowDirection(locale);
  return (
    <View>
      {rows.map((row, i) => (
        <View key={i} wrap={false} style={sx(meta.row, { flexDirection: dir })}>
          <Text style={sx(meta.key, { textAlign: alignStart(locale) })}>{row.label}</Text>
          <Text style={sx(meta.value, { textAlign: alignEnd(locale) })}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Party block: label, name and address lines. */
export function PartyDetails({ locale, label, name, lines }: { locale: Locale; label: string; name: string; lines: string[] }) {
  const align = alignStart(locale);
  return (
    <View>
      <Label locale={locale} marginBottom={5}>
        {label}
      </Label>
      <Text style={{ fontSize: TYPE.subhead, fontWeight: 500, lineHeight: 1.35, textAlign: align }}>{name}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={sx(shared.body, { color: PDF_COLORS.slate, textAlign: align })}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const table = StyleSheet.create({
  wrap: { marginTop: 22 },
  tr: { alignItems: "flex-start", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.fog, borderBottomStyle: "solid" },
  th: { paddingVertical: 5, borderBottomColor: PDF_COLORS.graphite },
  cIndex: { width: 22, fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.5, paddingTop: 0.5 },
  cDesc: { flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingHorizontal: 6, fontSize: TYPE.body, lineHeight: 1.5 },
  cQty: { width: 52, paddingHorizontal: 4, fontSize: TYPE.body, lineHeight: 1.5 },
  cPrice: { width: 92, paddingHorizontal: 4, fontSize: TYPE.body, lineHeight: 1.5 },
  cAmount: { width: 104, paddingHorizontal: 4, fontSize: TYPE.body, lineHeight: 1.5 },
});

export type ItemsTableLabels = { description: string; quantity: string; unitPrice: string; amount: string };

/**
 * Items table: fixed column widths so figures line up without tabular
 * numerals, hairlines between rows, rows never split across pages and the
 * header row repeated when the table continues on a new page.
 */
export function ItemsTable({ locale, items, labels, money, quantity }: { locale: Locale; items: CommercialItem[]; labels: ItemsTableLabels; money: (n: number) => string; quantity: (n: number) => string }) {
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  const end = alignEnd(locale);
  const head = (text: string, style: PdfStyle, align: "left" | "right") => (
    <Text style={sx(style, shared.label, { textAlign: align, letterSpacing: labelTracking(locale), paddingTop: 0 })}>{labelText(text, locale)}</Text>
  );
  return (
    <View style={table.wrap}>
      <View fixed style={sx(table.tr, table.th, { flexDirection: dir })}>
        {head("#", table.cIndex, start)}
        {head(labels.description, table.cDesc, start)}
        {head(labels.quantity, table.cQty, end)}
        {head(labels.unitPrice, table.cPrice, end)}
        {head(labels.amount, table.cAmount, end)}
      </View>
      {items.map((item, i) => (
        <View key={i} wrap={false} style={sx(table.tr, { flexDirection: dir })}>
          <Text style={sx(table.cIndex, { textAlign: start })}>{String(i + 1)}</Text>
          <Text style={sx(table.cDesc, { textAlign: start })}>{item.description}</Text>
          <Text style={sx(table.cQty, { textAlign: end })}>{quantity(item.quantity)}</Text>
          <Text style={sx(table.cPrice, { textAlign: end })}>{money(item.unitPrice)}</Text>
          <Text style={sx(table.cAmount, { textAlign: end })}>{money(item.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

export type TotalRow = { label: string; value: string; emphasis?: "grand" | "strong" };

const totals = StyleSheet.create({
  wrap: { marginTop: 4 },
  box: { width: 252 },
  row: { justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 4 },
  key: { fontSize: TYPE.body, color: PDF_COLORS.slate, lineHeight: 1.5 },
  value: { fontSize: TYPE.body, lineHeight: 1.5 },
  strong: { fontWeight: 500, color: PDF_COLORS.graphite },
  grand: { borderTopWidth: 1, borderTopColor: PDF_COLORS.graphite, borderTopStyle: "solid", marginTop: 3, paddingTop: 7, paddingBottom: 6 },
  grandText: { fontSize: TYPE.subhead, fontWeight: 500, color: PDF_COLORS.graphite },
});

/** Totals aligned to the end side of the page: subtotal, tax, total, then payments. */
export function TotalsBlock({ locale, rows }: { locale: Locale; rows: TotalRow[] }) {
  const dir = rowDirection(locale);
  return (
    <View wrap={false} style={sx(totals.wrap, { flexDirection: dir, justifyContent: "flex-end" })}>
      <View style={totals.box}>
        {rows.map((row, i) => (
          <View key={i} style={sx(totals.row, { flexDirection: dir }, row.emphasis === "grand" && totals.grand)}>
            <Text style={sx(totals.key, row.emphasis === "strong" && totals.strong, row.emphasis === "grand" && totals.grandText, { textAlign: alignStart(locale) })}>{row.label}</Text>
            <Text style={sx(totals.value, row.emphasis === "strong" && totals.strong, row.emphasis === "grand" && totals.grandText, { textAlign: alignEnd(locale) })}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Small heading over a paragraph; short blocks stay on one page. */
export function SectionBlock({ locale, heading, text, marginTop = 20 }: { locale: Locale; heading: string; text: string; marginTop?: number }) {
  return (
    <View wrap={text.length > 700} style={{ marginTop }}>
      <Label locale={locale} marginBottom={4}>
        {heading}
      </Label>
      <Text style={sx(shared.body, { textAlign: alignStart(locale) })}>{text}</Text>
    </View>
  );
}

const PAGE_LABEL: Record<Locale, (page: number, total: number) => string> = {
  en: (page, total) => `Page ${page} of ${total}`,
  ar: (page, total) => `صفحة ${page} من ${total}`,
};

const QR_SIZE = 44;

const footer = StyleSheet.create({
  wrap: { position: "absolute", bottom: PAGE_GRID.footerBottom },
  row: { justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 },
  contact: { width: "30%" },
  legal: { width: "38%", paddingHorizontal: 8 },
  site: { fontSize: TYPE.small, fontWeight: 500, color: PDF_COLORS.graphite, lineHeight: 1.45 },
  legalName: { fontSize: TYPE.small, fontWeight: 500, color: PDF_COLORS.graphite, lineHeight: 1.45 },
  end: { alignItems: "flex-start" },
  signatureCol: { height: QR_SIZE, justifyContent: "flex-end", marginHorizontal: 10 },
  signature: { alignItems: "center" },
  pageNo: { fontSize: TYPE.small, color: PDF_COLORS.graphite, marginHorizontal: 4, lineHeight: 1.2 },
  qrCol: { width: QR_SIZE, alignItems: "center" },
  qr: { width: QR_SIZE, height: QR_SIZE },
  caption: { fontSize: TYPE.caption, color: PDF_COLORS.slate, marginTop: 3, lineHeight: 1.2, textAlign: "center" },
});

/**
 * Fixed page footer: a hairline, then website and emails at the start, the
 * legal line in the middle, and the website QR with the page signature
 * (symbol and page number) at the end. Mirrored for Arabic.
 */
export function DocumentFooter({ locale, data, inset }: { locale: Locale; data: DocumentFooterData; inset: number }) {
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  return (
    <View fixed style={sx(footer.wrap, { left: inset, right: inset })}>
      <Rule />
      <View style={sx(footer.row, { flexDirection: dir })}>
        <View style={footer.contact}>
          <Text style={sx(footer.site, { textAlign: start })}>{data.website}</Text>
          {data.emails.map((email, i) => (
            <Text key={i} style={sx(shared.small, { textAlign: start })}>
              {email}
            </Text>
          ))}
        </View>
        <View style={footer.legal}>
          {data.legalLines.map((line, i) => (
            <Text key={i} style={sx(i === 0 ? footer.legalName : shared.small, { textAlign: start })}>
              {line}
            </Text>
          ))}
        </View>
        <View style={sx(footer.end, { flexDirection: dir })}>
          <View style={footer.signatureCol}>
            <View style={sx(footer.signature, { flexDirection: dir })}>
              <BrandSymbol size={8} />
              <Text style={footer.pageNo} render={({ pageNumber, totalPages }) => PAGE_LABEL[locale](pageNumber, totalPages)} />
            </View>
          </View>
          <View style={footer.qrCol}>
            <PdfImage src={data.websiteQrDataUrl} style={footer.qr} />
            <Text style={footer.caption}>{data.website}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
