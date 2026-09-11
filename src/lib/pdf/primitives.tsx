import { View, Text, Svg, Path, Polygon, StyleSheet } from "@react-pdf/renderer";
import { PRIMARY_PATHS, PRIMARY_VIEWBOX, SYMBOL_PATHS, SYMBOL_VIEWBOX } from "@/components/brand/logo-paths";
import { computeStream } from "@/components/brand/stream-math";
import { company } from "@/content/site/company";
import type { Locale } from "@/i18n/routing";
import { PDF_COLORS, alignStart, rowDirection, sx } from "./theme";

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

const footer = StyleSheet.create({
  wrap: { position: "absolute", left: 44, right: 44, bottom: 26 },
  line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  corporate: { fontSize: 7.5, color: PDF_COLORS.slate, lineHeight: 1.4 },
  legal: { fontSize: 6.5, color: PDF_COLORS.grey, marginTop: 2 },
  signature: { flexDirection: "row", alignItems: "center" },
  pageNo: { fontSize: 7.5, color: PDF_COLORS.graphite, marginHorizontal: 4 },
});

/**
 * Document footer: a Stream line, corporate details, optional small print
 * with the Jordan legal name, and the page signature (symbol + page number).
 */
export function DocumentFooter({ locale, contentWidth, legalSmallPrint = false }: { locale: Locale; contentWidth: number; legalSmallPrint?: boolean }) {
  const rtl = locale === "ar";
  const corporate = `${company.legalName.en} | ${company.legalName.ar}  ·  ${company.city[locale]}  ·  ${company.emails.general}  ·  ${company.domain}`;
  return (
    <View fixed style={footer.wrap}>
      <StreamLine width={contentWidth} height={22} />
      <Rule marginTop={6} />
      <View style={sx(footer.line, rtl && { flexDirection: "row-reverse" })}>
        <View style={{ maxWidth: contentWidth - 60 }}>
          <Text style={sx(footer.corporate, { textAlign: alignStart(locale) })}>{corporate}</Text>
          {legalSmallPrint ? (
            <Text style={sx(footer.legal, { textAlign: alignStart(locale) })}>
              {rtl ? `الاسم القانوني المسجل في الأردن: ${company.jordanLegalName}` : `Registered in Jordan as ${company.jordanLegalName}`}
            </Text>
          ) : null}
        </View>
        <View style={sx(footer.signature, { flexDirection: rowDirection(locale) })}>
          <BrandSymbol size={9} />
          <Text style={footer.pageNo} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </View>
    </View>
  );
}
