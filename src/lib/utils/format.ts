import type { Locale } from "@/i18n/routing";

/** Western numerals in both languages, per the brand rules. */
const NUMERAL_LOCALE: Record<Locale, string> = { en: "en-GB", ar: "ar-JO-u-nu-latn" };

export function formatDate(value: string | Date | null | undefined, locale: Locale, style: "short" | "long" = "short"): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(NUMERAL_LOCALE[locale], style === "short"
    ? { day: "2-digit", month: "2-digit", year: "numeric" }
    : { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined, locale: Locale): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(NUMERAL_LOCALE[locale], { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function formatMoney(amount: number | string | null | undefined, currency: string, locale: Locale): string {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  const fraction = currency === "JOD" ? 3 : 2;
  try {
    return new Intl.NumberFormat(NUMERAL_LOCALE[locale], { style: "currency", currency, minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(n);
  } catch {
    return `${n.toFixed(fraction)} ${currency}`;
  }
}

export function formatNumber(n: number | string | null | undefined, locale: Locale, digits = 0): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat(NUMERAL_LOCALE[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
