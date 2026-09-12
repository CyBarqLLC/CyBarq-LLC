import type * as React from "react";
import type { View } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";

/** Brand palette for documents. Mirrors src/styles/globals.css. */
export const PDF_COLORS = {
  graphite: "#0D0E13",
  slate: "#5A616B",
  grey: "#C6C8CB",
  fog: "#DADCDF",
  blue: "#74C3F2",
  ice: "#DCEFFA",
  surface: "#F5F6F7",
  white: "#FFFFFF",
} as const;

/** A4 in points. */
export const A4 = { width: 595.28, height: 841.89 } as const;
export const A4_LANDSCAPE = { width: 841.89, height: 595.28 } as const;

/**
 * The page grid shared by every document: margins, and the band reserved at
 * the bottom for the fixed footer so flowing content never runs into it.
 */
export const PAGE_GRID = {
  /** Side margin of portrait documents (invoice, quotation). */
  side: 48,
  /** Side margin of the landscape certificate. */
  sideWide: 56,
  top: 44,
  /** Distance from the page edge to the bottom of the footer. */
  footerBottom: 28,
  /** Height of the footer block (rule, gap, three columns). */
  /** Rule, three columns, and the one-line issuance statement above them. */
  footerHeight: 70,
} as const;

/** Page `paddingBottom` that keeps content clear of the footer. */
export const FOOTER_RESERVE = PAGE_GRID.footerBottom + PAGE_GRID.footerHeight + 10;

/**
 * Type scale in points, after the brand sheet: Light for display, Regular for
 * text, Medium for labels and emphasis.
 */
export const TYPE = {
  display: 34,
  headline: 22,
  title: 17,
  subhead: 12,
  body: 9.5,
  small: 7.5,
  label: 7,
  caption: 6.5,
  /** Small print: the closing statement, which must hold one line per language. */
  fine: 5.2,
} as const;

/** Single style object accepted by react-pdf (the array form removed). */
type Unarray<T> = T extends readonly unknown[] ? never : T;
export type PdfStyle = Unarray<NonNullable<React.ComponentProps<typeof View>["style"]>>;

/** Drops falsy entries so conditional styles can be written inline. */
export function sx(...styles: Array<PdfStyle | false | null | undefined>): PdfStyle[] {
  return styles.filter((s): s is PdfStyle => Boolean(s));
}

/** Text alignment helpers that mirror for Arabic pages. */
export function alignStart(locale: Locale): "left" | "right" {
  return locale === "ar" ? "right" : "left";
}
export function alignEnd(locale: Locale): "left" | "right" {
  return locale === "ar" ? "left" : "right";
}
export function rowDirection(locale: Locale): "row" | "row-reverse" {
  return locale === "ar" ? "row-reverse" : "row";
}
/** Flex `alignItems` value for the start / end side of the page. */
export function itemsStart(locale: Locale): "flex-start" | "flex-end" {
  return locale === "ar" ? "flex-end" : "flex-start";
}
export function itemsEnd(locale: Locale): "flex-start" | "flex-end" {
  return locale === "ar" ? "flex-start" : "flex-end";
}

/**
 * Small-caps style labels: uppercase with a little tracking in English only.
 * Arabic has no capitals and must never be letter spaced.
 */
export function labelText(text: string, locale: Locale): string {
  return locale === "ar" ? text : text.toUpperCase();
}
export function labelTracking(locale: Locale): number {
  return locale === "ar" ? 0 : 0.7;
}
