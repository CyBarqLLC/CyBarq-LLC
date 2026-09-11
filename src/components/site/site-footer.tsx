import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo, PageSignature } from "@/components/brand/logo";
import { StreamStatic } from "@/components/brand/stream-static";
import { company } from "@/content/site/company";
import { practices } from "@/content/services/registry";

export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common.footer");
  const tn = await getTranslations("site.nav");
  const year = new Date().getFullYear();

  const explore = [
    { href: "/about", label: tn("about") },
    { href: "/projects", label: tn("projects") },
    { href: "/case-studies", label: tn("caseStudies") },
    { href: "/news", label: tn("news") },
    { href: "/articles", label: tn("articles") },
    { href: "/careers", label: tn("careers") },
    { href: "/contact", label: tn("contact") },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-fog bg-ice">
      {/* Fine stream in CyBarq Blue on Ice, as specified for footers and backs */}
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/2 opacity-70 lg:block" aria-hidden>
        <StreamStatic preset="fine" density="fine" ink="#74C3F2" accent="#74C3F2" width={900} height={520} params={{ fadeIn: 1.2 }} />
      </div>
      <div className="container-page relative py-14 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Link href="/" className="text-graphite" aria-label={company.legalName[locale]}>
              <Logo className="h-8" />
            </Link>
            <p className="max-w-sm text-slate">{company.slogan[locale]}</p>
            <p className="max-w-sm text-small text-slate">{company.city[locale]}</p>
            <ul className="flex gap-4 text-small">
              <li><a href={company.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-azure">LinkedIn</a></li>
              <li><a href={company.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-azure">Instagram</a></li>
              <li><a href={company.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-azure">Facebook</a></li>
              <li><a href={company.social.x} target="_blank" rel="noopener noreferrer" className="hover:text-azure">X</a></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-label text-slate">{t("services")}</h2>
            <ul className="flex flex-col gap-2.5">
              {practices.map((p) => (
                <li key={p.slug}>
                  <Link href={`/services/${p.slug}`} className="hover:text-azure">{p.title[locale]}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-label text-slate">{t("explore")}</h2>
            <ul className="flex flex-col gap-2.5">
              {explore.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="hover:text-azure">{e.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-label text-slate">{t("contact")}</h2>
            <ul className="flex flex-col gap-2.5">
              <li><a href={`mailto:${company.emails.general}`} className="hover:text-azure">{company.emails.general}</a></li>
              <li><a href={`mailto:${company.emails.sales}`} className="hover:text-azure">{company.emails.sales}</a></li>
              <li><a href={`mailto:${company.emails.support}`} className="hover:text-azure">{company.emails.support}</a></li>
              <li className="pt-2"><Link href="/verify" className="hover:text-azure">{t("verify")}</Link></li>
              <li><Link href="/login" className="hover:text-azure">{t("signIn")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-fog/80 pt-6 text-small text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName[locale]}. {t("rights")} {t("registered")}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-azure">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-azure">{t("terms")}</Link>
            <PageSignature label={company.name[locale]} />
          </div>
        </div>
      </div>
    </footer>
  );
}
