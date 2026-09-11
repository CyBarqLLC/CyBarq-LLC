import { locales } from "@/i18n/routing";

type Options = {
  /** Where to go when the requested path is missing or unsafe. */
  fallback: string;
  /** Allowed first segments after the locale (for example ["app"]); omit to allow any page on the site. */
  areas?: readonly string[];
};

/**
 * Returns a same-site path for a post sign-in (or post action) redirect, or
 * the fallback. The candidate is resolved against a fixed origin so that
 * tricks such as `//evil.com`, `/\evil.com`, `/%09/evil.com` or encoded
 * schemes cannot leave the site, and it must start with a known locale.
 */
export function safeInternalPath(candidate: string | null | undefined, { fallback, areas }: Options): string {
  if (!candidate || typeof candidate !== "string" || candidate.length > 500) return fallback;
  if (!candidate.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  let url: URL;
  try {
    url = new URL(candidate, "https://internal.invalid");
  } catch {
    return fallback;
  }
  if (url.origin !== "https://internal.invalid") return fallback;
  const [, locale, area] = url.pathname.split("/");
  if (!locale || !(locales as readonly string[]).includes(locale)) return fallback;
  if (areas && (!area || !areas.includes(area))) return fallback;
  return `${url.pathname}${url.search}`;
}
