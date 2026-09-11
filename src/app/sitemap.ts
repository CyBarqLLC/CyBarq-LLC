import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { company } from "@/content/site/company";
import { practices, services, servicePath } from "@/content/services";
import { listPublishedSlugs } from "@/lib/data/public-content";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? company.url).replace(/\/$/, "");

const STATIC_PATHS = ["/", "/about", "/services", "/projects", "/case-studies", "/news", "/articles", "/careers", "/contact", "/verify", "/privacy", "/terms"];

function url(locale: Locale, path: string): string {
  return path === "/" ? `${base}/${locale}` : `${base}/${locale}${path}`;
}

/** One entry per locale for a path, with hreflang alternates for both locales and x-default. */
function entries(path: string, options: { lastModified?: string | Date; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number } = {}): MetadataRoute.Sitemap {
  const languages = { en: url("en", path), ar: url("ar", path), "x-default": url("en", path) };
  return locales.map((locale) => ({
    url: url(locale, path),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) out.push(...entries(path, { changeFrequency: path === "/" ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.7 }));
  for (const p of practices) out.push(...entries(`/services/${p.slug}`, { changeFrequency: "monthly", priority: 0.8 }));
  for (const s of services) out.push(...entries(servicePath(s), { changeFrequency: "monthly", priority: 0.8 }));

  // Published CMS content. A missing or unreachable database must not break the build.
  try {
    const { projects, caseStudies, news, articles } = await listPublishedSlugs();
    for (const r of projects) out.push(...entries(`/projects/${r.slug}`, { lastModified: r.updated_at, changeFrequency: "yearly", priority: 0.6 }));
    for (const r of caseStudies) out.push(...entries(`/case-studies/${r.slug}`, { lastModified: r.updated_at, changeFrequency: "yearly", priority: 0.6 }));
    for (const r of news) out.push(...entries(`/news/${r.slug}`, { lastModified: r.updated_at, changeFrequency: "yearly", priority: 0.5 }));
    for (const r of articles) out.push(...entries(`/articles/${r.slug}`, { lastModified: r.updated_at, changeFrequency: "yearly", priority: 0.5 }));
  } catch (error) {
    console.error("[sitemap] content lookup failed", error);
  }

  return out;
}
