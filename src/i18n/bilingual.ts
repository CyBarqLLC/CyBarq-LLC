import type { Locale } from "./routing";

/**
 * Picks the localized value from a pair of columns (`title_en` / `title_ar`),
 * falling back to the other language when one is empty so nothing renders blank.
 */
export function pick<T extends Record<string, unknown>>(row: T, key: string, locale: Locale): string {
  const primary = row[`${key}_${locale}`];
  const fallback = row[`${key}_${locale === "ar" ? "en" : "ar"}`];
  if (typeof primary === "string" && primary.trim() !== "") return primary;
  if (typeof fallback === "string") return fallback;
  return "";
}

export type Bilingual = { en: string; ar: string };

export function t(value: Bilingual, locale: Locale): string {
  return value[locale] || value.en;
}
