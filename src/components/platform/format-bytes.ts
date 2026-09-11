import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/utils/format";

/** Human readable file size with Western numerals. */
export function formatBytes(bytes: number | null | undefined, locale: Locale): string {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${formatNumber(bytes, locale)} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, locale, 0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${formatNumber(bytes / (1024 * 1024), locale, 1)} MB`;
  return `${formatNumber(bytes / (1024 * 1024 * 1024), locale, 2)} GB`;
}
