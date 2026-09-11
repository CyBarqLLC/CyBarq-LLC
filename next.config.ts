import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
  // PDF rendering reads the brand fonts from disk at runtime on Vercel.
  outputFileTracingIncludes: {
    "/api/documents/invoices/[id]": ["./src/assets/fonts/*.otf"],
    "/api/documents/quotes/[id]": ["./src/assets/fonts/*.otf"],
    "/api/documents/certificates/[id]": ["./src/assets/fonts/*.otf"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    // Legacy static site URLs (GitHub Pages era) map to the new localized routes.
    const legacy: Array<[string, string]> = [
      ["/index.html", "/en"],
      ["/about.html", "/en/about"],
      ["/services.html", "/en/services"],
      ["/contact.html", "/en/contact"],
      ["/penetration-testing.html", "/en/services/cybersecurity/penetration-testing"],
      ["/dfir.html", "/en/services/cybersecurity/digital-forensics-incident-response"],
      ["/training.html", "/en/services/cybersecurity/training-awareness"],
      ["/compromise-assessment.html", "/en/services/cybersecurity/compromise-assessment"],
      ["/professional-services.html", "/en/services/cybersecurity/professional-security-services"],
      ["/development.html", "/en/services/digital-engineering"],
      ["/ar/index.html", "/ar"],
      ["/ar/about.html", "/ar/about"],
      ["/ar/services.html", "/ar/services"],
      ["/ar/contact.html", "/ar/contact"],
      ["/ar/penetration-testing.html", "/ar/services/cybersecurity/penetration-testing"],
      ["/ar/dfir.html", "/ar/services/cybersecurity/digital-forensics-incident-response"],
      ["/ar/training.html", "/ar/services/cybersecurity/training-awareness"],
      ["/ar/compromise-assessment.html", "/ar/services/cybersecurity/compromise-assessment"],
      ["/ar/professional-services.html", "/ar/services/cybersecurity/professional-security-services"],
      ["/ar/development.html", "/ar/services/digital-engineering"],
    ];
    return legacy.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
