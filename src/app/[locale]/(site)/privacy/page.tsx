import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/site/legal-document";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { privacy } from "@/content/site/legal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.legal" });
  return pageMetadata({ locale, path: "/privacy", title: privacy.title[locale], description: t("privacySeo") });
}

export default async function PrivacyPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.legal");
  const tn = await getTranslations("site.nav");
  return <LegalDocumentView document={privacy} locale={locale} updatedLabel={(date) => t("updated", { date })} crumbs={[{ href: "/", label: tn("home") }, { label: tn("privacy") }]} />;
}
