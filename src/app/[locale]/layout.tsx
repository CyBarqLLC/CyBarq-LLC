import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, dirOf, type Locale } from "@/i18n/routing";
import { thmanyah } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { company } from "@/content/site/company";
import "@/styles/globals.css";
import { siteUrl } from "@/lib/env";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: { default: company.legalName[l], template: `%s | ${company.name[l]}` },
    description: company.description[l],
    applicationName: company.name.en,
    icons: { icon: "/brand/logo/symbol-graphite.svg", apple: "/apple-touch-icon.png" },
    openGraph: { siteName: company.legalName[l], type: "website", locale: l === "ar" ? "ar_JO" : "en_US" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const dir = dirOf(locale);
  return (
    <html lang={locale} dir={dir} className={thmanyah.variable}>
      <body className="font-sans">
        <NextIntlClientProvider>
          {children}
          <Toaster dir={dir} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
