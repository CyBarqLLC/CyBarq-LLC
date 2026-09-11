import type { MetadataRoute } from "next";
import { company } from "@/content/site/company";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/*/app", "/*/app/", "/*/portal", "/*/portal/", "/api/", "/*/login"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
