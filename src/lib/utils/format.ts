import type { Locale } from "@/i18n/routing";
import { BUSINESS_TIME_ZONE, isDateOnly } from "@/lib/time";

/** Western numerals in both languages, per the brand rules. */
const NUMERAL_LOCALE: Record<Locale, string> = { en: "en-GB", ar: "ar-JO-u-nu-latn" };

const cache = new Map<string, Intl.DateTimeFormat>();

/** CLDR's British English writes "Sept"; the house style is the three letter "Sep". */
function tidy(text: string, locale: Locale): string {
  return locale === "en" ? text.replace(/\bSept\b/, "Sep") : text;
}

function formatter(locale: Locale, key: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const id = `${locale}|${key}`;
  let f = cache.get(id);
  if (!f) {
    f = new Intl.DateTimeFormat(NUMERAL_LOCALE[locale], options);
    cache.set(id, f);
  }
  return f;
}

type DateStyle = "short" | "long" | "numeric";

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  // 11 Sep 2026 / 11 أيلول 2026
  short: { day: "numeric", month: "short", year: "numeric" },
  // 11 September 2026 / 11 أيلول 2026
  long: { day: "numeric", month: "long", year: "numeric" },
  // 11/09/2026 (tables that need fixed width)
  numeric: { day: "2-digit", month: "2-digit", year: "numeric" },
};

/**
 * Formats a calendar date or an instant as a date.
 * - `YYYY-MM-DD` values are calendar dates: shown exactly as stored.
 * - Timestamps are instants: shown as the calendar date in Amman.
 */
export function formatDate(value: string | Date | null | undefined, locale: Locale, style: DateStyle = "short"): string {
  if (!value) return "";
  if (isDateOnly(value)) {
    const d = new Date(`${value}T00:00:00Z`);
    return tidy(formatter(locale, `d:${style}:utc`, { ...DATE_OPTIONS[style], timeZone: "UTC" }).format(d), locale);
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return tidy(formatter(locale, `d:${style}:biz`, { ...DATE_OPTIONS[style], timeZone: BUSINESS_TIME_ZONE }).format(d), locale);
}

/** Formats an instant with its time of day, in Amman time (11 Sep 2026, 14:05). */
export function formatDateTime(value: string | Date | null | undefined, locale: Locale): string {
  if (!value) return "";
  if (isDateOnly(value)) return formatDate(value, locale);
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return tidy(
    formatter(locale, "dt:biz", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: BUSINESS_TIME_ZONE,
    }).format(d),
    locale,
  );
}

/** Time of day only, in Amman time (14:05). */
export function formatTime(value: string | Date | null | undefined, locale: Locale): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return formatter(locale, "t:biz", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: BUSINESS_TIME_ZONE }).format(d);
}

const relativeCache = new Map<Locale, Intl.RelativeTimeFormat>();

/** "3 hours ago" / "قبل 3 ساعات" for recent instants; falls back to a date after a week. */
export function formatRelative(value: string | Date | null | undefined, locale: Locale, now: Date = new Date()): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const seconds = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  let rtf = relativeCache.get(locale);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(NUMERAL_LOCALE[locale], { numeric: "auto" });
    relativeCache.set(locale, rtf);
  }
  if (abs < 45) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86_400) return rtf.format(Math.round(seconds / 86_400), "day");
  return formatDate(d, locale);
}

const CURRENCY_NAMES: Record<string, { en: string; ar: string }> = {
  JOD: { en: "Jordanian dinar", ar: "دينار أردني" },
  USD: { en: "US dollar", ar: "دولار أمريكي" },
  EUR: { en: "Euro", ar: "يورو" },
  SAR: { en: "Saudi riyal", ar: "ريال سعودي" },
  AED: { en: "UAE dirham", ar: "درهم إماراتي" },
};

/** Human name of a currency (for selects and document headers). */
export function currencyName(code: string, locale: Locale): string {
  return CURRENCY_NAMES[code]?.[locale] ?? code;
}

export function formatMoney(amount: number | string | null | undefined, currency: string, locale: Locale): string {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  const fraction = currency === "JOD" ? 3 : 2;
  try {
    return new Intl.NumberFormat(NUMERAL_LOCALE[locale], { style: "currency", currency, currencyDisplay: locale === "ar" ? "symbol" : "code", minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(n);
  } catch {
    return `${n.toFixed(fraction)} ${currency}`;
  }
}

export function formatNumber(n: number | string | null | undefined, locale: Locale, digits = 0): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat(NUMERAL_LOCALE[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

const BYTE_UNITS: Record<Locale, string[]> = {
  en: ["bytes", "KB", "MB", "GB"],
  ar: ["بايت", "ك.ب", "م.ب", "غ.ب"],
};

/** File size in human units, localized (2.4 MB / 2.4 م.ب). */
export function formatBytes(bytes: number | null | undefined, locale: Locale): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return "";
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < 3) {
    v /= 1024;
    u++;
  }
  const digits = u === 0 || v >= 10 ? 0 : 1;
  return `${formatNumber(v, locale, digits)} ${BYTE_UNITS[locale][u]}`;
}

/** The readable part of a stored file name (`<uuid>-report.pdf` -> `report.pdf`). */
export function displayFileName(path: string | null | undefined): string {
  if (!path) return "";
  const base = path.split("/").pop() ?? path;
  return base.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
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
