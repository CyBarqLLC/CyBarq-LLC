import { View, Text, Svg, Path, Polygon, Image as PdfImage, StyleSheet } from "@react-pdf/renderer";
import { PRIMARY_PATHS, PRIMARY_VIEWBOX, SYMBOL_PATHS, SYMBOL_VIEWBOX } from "@/components/brand/logo-paths";
import { computeStream } from "@/components/brand/stream-math";
import type { Locale } from "@/i18n/routing";
import { PAGE_GRID, PDF_COLORS, TYPE, alignStart, itemsEnd, labelText, labelTracking, rowDirection, sx, type PdfStyle } from "./theme";
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

/**
 * A caption in both languages. Bilingual documents never mix scripts inside a
 * single text run: English and Arabic always sit in their own `Text`.
 */
export type BiCaption = { en: string; ar: string };

const bi = StyleSheet.create({
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  arLabel: { fontSize: TYPE.label, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.5, textAlign: "right" },
  arBody: { fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.6, textAlign: "right" },
  arStack: { fontSize: TYPE.caption, color: PDF_COLORS.slate, lineHeight: 1.4, marginTop: 0.5 },
});

/**
 * Section caption of a bilingual document: the English small-caps label at the
 * start of the line and its Arabic counterpart at the end, so the two readings
 * share one line without the scripts ever meeting inside a run.
 */
export function BiSectionLabel({ label, marginBottom = 5 }: { label: BiCaption; marginBottom?: number }) {
  return (
    <View style={sx(bi.headingRow, { marginBottom })}>
      <Label locale="en">{label.en}</Label>
      <Text style={bi.arLabel}>{label.ar}</Text>
    </View>
  );
}

/** English over Arabic, for narrow cells where the two cannot share a line. */
export function BiStackedLabel({ label, align = "left" }: { label: BiCaption; align?: "left" | "right" }) {
  return (
    <View>
      <Label locale="en" align={align}>
        {label.en}
      </Label>
      <Text style={sx(bi.arStack, { textAlign: align })}>{label.ar}</Text>
    </View>
  );
}

export type MetaRow = { label: BiCaption; value: string };

const meta = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", paddingVertical: 4.5, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.fog, borderBottomStyle: "solid" },
  key: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  keyAr: { width: 62, fontSize: TYPE.label, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.4, textAlign: "right", paddingHorizontal: 3 },
  value: { width: 104, fontSize: TYPE.body, fontWeight: 500, lineHeight: 1.4, textAlign: "right" },
});

/**
 * Labelled key/value list separated by hairlines. Three columns — the English
 * caption, its Arabic reading, and the value, which is a number, a date or a
 * code and reads the same in both languages — so each entry stays one line and
 * the two readings line up down the block.
 */
export function MetaList({ rows }: { rows: MetaRow[] }) {
  return (
    <View>
      {rows.map((row, i) => (
        <View key={i} wrap={false} style={meta.row}>
          <View style={meta.key}>
            <Label locale="en">{row.label.en}</Label>
          </View>
          <Text style={meta.keyAr}>{row.label.ar}</Text>
          <Text style={meta.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Party block: bilingual caption, the name in both languages, then the postal details. */
export function PartyDetails({ label, name, nameAr, lines }: { label: BiCaption; name: string; nameAr?: string | null; lines: string[] }) {
  return (
    <View>
      <BiSectionLabel label={label} />
      <Text style={{ fontSize: TYPE.subhead, fontWeight: 500, lineHeight: 1.35 }}>{name}</Text>
      {nameAr ? <Text style={{ fontSize: TYPE.body, fontWeight: 500, color: PDF_COLORS.slate, lineHeight: 1.5, textAlign: "right" }}>{nameAr}</Text> : null}
      {lines.map((line, i) => (
        <Text key={i} style={sx(shared.body, { color: PDF_COLORS.slate })}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const table = StyleSheet.create({
  wrap: { marginTop: 18 },
  tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.fog, borderBottomStyle: "solid" },
  th: { paddingVertical: 4, borderBottomColor: PDF_COLORS.graphite },
  cIndex: { width: 20 },
  cDesc: { flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingHorizontal: 6 },
  cQty: { width: 48, paddingHorizontal: 4 },
  cPrice: { width: 88, paddingHorizontal: 4 },
  cAmount: { width: 98, paddingHorizontal: 4 },
  index: { fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.5, paddingTop: 0.5 },
  desc: { fontSize: TYPE.body, lineHeight: 1.5 },
  descAr: { fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.6, textAlign: "right", marginTop: 1 },
  figure: { fontSize: TYPE.body, lineHeight: 1.5, textAlign: "right" },
});

export type ItemsTableLabels = { description: BiCaption; quantity: BiCaption; unitPrice: BiCaption; amount: BiCaption };

/**
 * Items table: fixed column widths so figures line up without tabular
 * numerals, hairlines between rows, rows never split across pages and the
 * header row repeated when the table continues on a new page. Each heading
 * carries its Arabic reading underneath, and a line's Arabic wording sits
 * under the English one, set towards the right so the column stays readable
 * in both directions.
 */
export function ItemsTable({ items, labels, money, quantity }: { items: CommercialItem[]; labels: ItemsTableLabels; money: (n: number) => string; quantity: (n: number) => string }) {
  const head = (label: BiCaption, style: PdfStyle, align: "left" | "right") => (
    <View style={style}>
      <BiStackedLabel label={label} align={align} />
    </View>
  );
  return (
    <View style={table.wrap}>
      <View fixed style={sx(table.tr, table.th)}>
        {head({ en: "#", ar: "م" }, table.cIndex, "left")}
        {head(labels.description, table.cDesc, "left")}
        {head(labels.quantity, table.cQty, "right")}
        {head(labels.unitPrice, table.cPrice, "right")}
        {head(labels.amount, table.cAmount, "right")}
      </View>
      {items.map((item, i) => (
        <View key={i} wrap={false} style={table.tr}>
          <Text style={sx(table.cIndex, table.index)}>{String(i + 1)}</Text>
          <View style={table.cDesc}>
            <Text style={table.desc}>{item.description.en}</Text>
            {item.description.ar ? <Text style={table.descAr}>{item.description.ar}</Text> : null}
          </View>
          <Text style={sx(table.cQty, table.figure)}>{quantity(item.quantity)}</Text>
          <Text style={sx(table.cPrice, table.figure)}>{money(item.unitPrice)}</Text>
          <Text style={sx(table.cAmount, table.figure)}>{money(item.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

export type TotalRow = { label: BiCaption; value: string; emphasis?: "grand" | "strong" };

const totals = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  box: { width: 268 },
  row: { flexDirection: "row", alignItems: "baseline", paddingVertical: 3.5 },
  key: { flexGrow: 1, flexShrink: 1, flexBasis: 0, fontSize: TYPE.body, color: PDF_COLORS.slate, lineHeight: 1.5 },
  keyAr: { width: 86, fontSize: TYPE.small, color: PDF_COLORS.slate, lineHeight: 1.5, textAlign: "right", paddingHorizontal: 4 },
  value: { width: 98, fontSize: TYPE.body, lineHeight: 1.5, textAlign: "right" },
  strong: { fontWeight: 500, color: PDF_COLORS.graphite },
  grand: { borderTopWidth: 1, borderTopColor: PDF_COLORS.graphite, borderTopStyle: "solid", marginTop: 3, paddingTop: 7, paddingBottom: 6 },
  grandText: { fontSize: TYPE.subhead, fontWeight: 500, color: PDF_COLORS.graphite },
  grandAr: { fontSize: TYPE.body, fontWeight: 500, color: PDF_COLORS.graphite },
});

/**
 * Totals at the end side of the page: subtotal, tax, total, then payments.
 * Three columns — the English caption, its Arabic reading, and the figure —
 * so both readings line up down the page.
 */
export function TotalsBlock({ rows }: { rows: TotalRow[] }) {
  return (
    <View wrap={false} style={totals.wrap}>
      <View style={totals.box}>
        {rows.map((row, i) => {
          const strong = row.emphasis === "strong" && totals.strong;
          const grand = row.emphasis === "grand";
          return (
            <View key={i} style={sx(totals.row, grand && totals.grand)}>
              <Text style={sx(totals.key, strong, grand && totals.grandText)}>{row.label.en}</Text>
              <Text style={sx(totals.keyAr, strong, grand && totals.grandAr)}>{row.label.ar}</Text>
              <Text style={sx(totals.value, strong, grand && totals.grandText)}>{row.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Bilingual heading over a paragraph in each language. The Arabic paragraph is
 * set towards the right under the English one, which keeps both comfortable to
 * read without a second column.
 */
export function SectionBlock({ heading, text, marginTop = 16 }: { heading: BiCaption; text: { en: string; ar: string | null }; marginTop?: number }) {
  const long = text.en.length + (text.ar?.length ?? 0) > 700;
  return (
    <View wrap={long} style={{ marginTop }}>
      <BiSectionLabel label={heading} marginBottom={4} />
      {text.en ? <Text style={shared.body}>{text.en}</Text> : null}
      {text.ar ? <Text style={sx(bi.arBody, { color: PDF_COLORS.graphite, marginTop: text.en ? 3 : 0 })}>{text.ar}</Text> : null}
    </View>
  );
}

const QR_SIZE = 38;

const footer = StyleSheet.create({
  wrap: { position: "absolute", bottom: PAGE_GRID.footerBottom },
  issuance: { justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 },
  /* The English sentence sets more type in the same words, so it takes the
     wider half; Arabic finishes well inside the rest. */
  issuanceEn: { width: "54%", fontSize: TYPE.fine, color: PDF_COLORS.slate, lineHeight: 1.4 },
  issuanceAr: { width: "44%", fontSize: TYPE.fine, color: PDF_COLORS.slate, lineHeight: 1.7, textAlign: "right" },
  row: { justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 },
  contact: { width: "27%" },
  legal: { width: "41%", paddingHorizontal: 8 },
  site: { fontSize: TYPE.small, fontWeight: 500, color: PDF_COLORS.graphite, lineHeight: 1.45 },
  legalName: { fontSize: TYPE.small, fontWeight: 500, color: PDF_COLORS.graphite, lineHeight: 1.45 },
  /* The page label is drawn after the page has been laid out, so its box must
     be given a size: an empty box measures zero in a centred row and is never
     painted. Its whole branch is also written with plain style objects and
     spacer views rather than shared styles and margins — with either of those
     in the chain the late text is laid out but never reaches the page. */
  qrCol: { width: QR_SIZE + 10, alignItems: "center" },
  /* The page's quietest piece of colour: a hairline of CyBarq Blue around the code. */
  qrFrame: { borderWidth: 0.75, borderColor: PDF_COLORS.blue, borderStyle: "solid", borderRadius: 2, padding: 3 },
  qr: { width: QR_SIZE, height: QR_SIZE },
  caption: { fontSize: TYPE.caption, color: PDF_COLORS.slate, marginTop: 3, lineHeight: 1.2, textAlign: "center" },
});

/**
 * Fixed page footer: a hairline, then website and emails at the start, the
 * legal block in the middle and the framed website QR at the end, with the
 * closing statement in small print above the rule. Mirrored for Arabic.
 */
export function DocumentFooter({ locale, data, inset }: { locale: Locale; data: DocumentFooterData; inset: number }) {
  const dir = rowDirection(locale);
  const start = alignStart(locale);
  return (
    <View fixed style={sx(footer.wrap, { left: inset, right: inset })}>
      {/* The electronic-issuance statement belongs with the footer, not with
          the flowing text: it must sit at the foot of the page whether the
          document fills it or ends halfway. Both readings share one line
          across the footer's width, each in its own run and each on a single
          line — which is what sets the size of this small print. */}
      {data.issuance ? (
        <View style={sx(footer.issuance, { flexDirection: dir })}>
          <Text style={footer.issuanceEn}>{data.issuance.en}</Text>
          <Text style={footer.issuanceAr}>{data.issuance.ar}</Text>
        </View>
      ) : null}
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
        <View style={footer.qrCol}>
          <View style={footer.qrFrame}>
            <PdfImage src={data.websiteQrDataUrl} style={footer.qr} />
          </View>
          <Text style={footer.caption}>{data.website}</Text>
        </View>
      </View>
    </View>
  );
}
