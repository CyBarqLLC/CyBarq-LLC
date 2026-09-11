import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/site/page-intro";
import { ContactForm, type ServiceOptionGroup } from "@/components/site/contact-form";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata, resolveLocale, absoluteUrl } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { practices, servicesByPractice, getServiceBySlug } from "@/content/services";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.contact" });
  return pageMetadata({ locale, path: "/contact", title: t("title"), description: t("seoDescription") });
}

export default async function ContactPage({ params, searchParams }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const { service } = await searchParams;
  const t = await getTranslations("site.contact");
  const tn = await getTranslations("site.nav");

  const requested = Array.isArray(service) ? service[0] : service;
  const defaultService = requested && getServiceBySlug(requested) ? requested : undefined;

  const serviceGroups: ServiceOptionGroup[] = practices.map((p) => ({
    label: p.title[locale],
    options: servicesByPractice(p.slug).map((s) => ({ value: s.slug, label: s.title[locale] })),
  }));

  const channels = [
    { key: "general", email: company.emails.general },
    { key: "sales", email: company.emails.sales },
    { key: "support", email: company.emails.support },
  ] as const;

  const contactPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("title"),
    url: absoluteUrl(locale, "/contact"),
    mainEntity: {
      "@type": "Organization",
      name: company.legalName.en,
      email: company.emails.general,
      contactPoint: channels.map((c) => ({ "@type": "ContactPoint", email: c.email, contactType: c.key === "support" ? "technical support" : c.key === "sales" ? "sales" : "customer service", availableLanguage: ["en", "ar"] })),
    },
  };

  return (
    <>
      <JsonLd data={contactPage} />
      <PageIntro title={t("title")} lead={t("lead")} crumbs={[{ href: "/", label: tn("home") }, { label: tn("contact") }]} />

      <div className="border-t border-fog">
        <div className="container-page section grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
          <section aria-labelledby="channels-heading" className="flex flex-col gap-8">
            <h2 id="channels-heading" className="text-h2">
              {t("channelsEyebrow")}
            </h2>
            <ul className="flex flex-col divide-y divide-fog border-y border-fog">
              {channels.map((c) => (
                <li key={c.key} className="flex flex-col gap-1 py-5">
                  <h3 className="text-h3">{t(`channels.${c.key}.title`)}</h3>
                  <a href={`mailto:${c.email}`} className="self-start text-azure underline-offset-4 hover:underline">
                    {c.email}
                  </a>
                  <p className="text-small text-slate">{t(`channels.${c.key}.description`)}</p>
                </li>
              ))}
            </ul>
            <p className="max-w-sm text-small text-slate">{t("location")}</p>
          </section>

          <section aria-labelledby="form-heading">
            <p className="text-small text-slate">{t("form.eyebrow")}</p>
            <h2 id="form-heading" className="mt-1 mb-8 text-h2">
              {t("form.title")}
            </h2>
            <ContactForm serviceGroups={serviceGroups} defaultService={defaultService} />
          </section>
        </div>
      </div>
    </>
  );
}
