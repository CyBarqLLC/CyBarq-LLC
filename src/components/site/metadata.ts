import type { Metadata } from "next";
import { isLocale, defaultLocale, type Locale } from "@/i18n/routing";

type PageMetadataArgs = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/services/cybersecurity". "/" for the home page. */
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  image?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
  /** Use the title as is, without the "| CyBarq" template from the layout (home page). */
  absoluteTitle?: boolean;
};

function localized(locale: string, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Metadata for a public page: localized title and description, canonical and
 * hreflang alternates (en, ar, x-default) and Open Graph. URLs are relative;
 * `metadataBase` in the locale layout resolves them.
 */
export function pageMetadata({ locale, path, title, description, type = "website", image, publishedTime, modifiedTime, noIndex, absoluteTitle }: PageMetadataArgs): Metadata {
  const canonical = localized(locale, path);
  const base = {
    title,
    description,
    url: canonical,
    locale: locale === "ar" ? "ar_JO" : "en_US",
    images: image ? [{ url: image }] : undefined,
  };
  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? { ...base, type: "article", publishedTime: publishedTime ?? undefined, modifiedTime: modifiedTime ?? undefined }
      : { ...base, type: "website" };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        en: localized("en", path),
        ar: localized("ar", path),
        "x-default": localized("en", path),
      },
    },
    openGraph,
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

/** Narrows a route param to a supported locale (the locale layout has already 404ed on unknown values). */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Absolute site URL for JSON-LD and the sitemap. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cybarq.com").replace(/\/$/, "");
}

export function absoluteUrl(locale: Locale, path: string): string {
  return `${siteUrl()}${localized(locale, path)}`;
}
