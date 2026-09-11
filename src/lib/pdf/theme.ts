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
