import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { company } from "@/content/site/company";
import { practices } from "@/content/services/registry";
import { LanguageSwitch } from "./language-switch";
import { resolveLocale } from "./metadata";

/**
 * The footer, on the night ground: the name, what the company does in one
 * line, the three lists a visitor actually uses (services, company, contact)
 * and the legal links. It carries the company name and nothing about where or
 * how the company is registered.
 */
export async function SiteFooter() {
  const locale = resolveLocale(await getLocale());
  const t = await getTranslations("common.footer");
  const tn = await getTranslations("site.nav");
  const tf = await getTranslations("site.footer");
  const year = new Date().getFullYear();

  const companyLinks = [
    { href: "/about", label: tn("about") },
    { href: "/projects", label: tn("projects") },
    { href: "/case-studies", label: tn("caseStudies") },
    { href: "/articles", label: tn("articles") },
    { href: "/news", label: tn("news") },
    { href: "/careers", label: tn("careers") },
  ];

  const social = [
    { href: company.social.linkedin, label: "LinkedIn" },
    { href: company.social.x, label: "X" },
    { href: company.social.instagram, label: "Instagram" },
    { href: company.social.facebook, label: "Facebook" },
  ];

  return (
    <footer className="site-footer s-night">
      <div className="container-page">
        <div className="site-footer__grid">
          <div className="site-footer__brand flex flex-col items-start gap-5">
            <Link href="/" aria-label={tn("homeLabel")} className="inline-flex text-white">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="s-sub max-w-sm">{company.slogan[locale]}</p>
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-(--s-ink-soft)">{tf("tagline")}</p>
          </div>

          <nav aria-labelledby="footer-services">
            <h2 id="footer-services" className="site-footer__heading">
              {t("services")}
            </h2>
            <ul>
              {practices.map((p) => (
                <li key={p.slug}>
                  <Link href={`/services/${p.slug}`} className="site-footer__link">
                    {p.title[locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="site-footer__link">
                  {tf("allServices")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className="site-footer__heading">
              {t("company")}
            </h2>
            <ul>
              {companyLinks.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="site-footer__link">
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="site-footer__heading">{t("contact")}</h2>
            <ul>
              <li>
                <Link href="/contact" className="site-footer__link">
                  {tn("talk")}
                </Link>
              </li>
              {[company.emails.general, company.emails.sales, company.emails.support].map((email) => (
                <li key={email}>
                  <a href={`mailto:${email}`} className="site-footer__link">
                    {email}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-x-5" aria-label={tf("social")}>
              {social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="site-footer__link">
                    {s.label}
                    <span className="sr-only"> {tf("newTab")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__base">
          <p>
            © {year} {company.fullName[locale]}. {t("rights")}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <li>
              <Link href="/privacy" className="site-footer__link text-small">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="site-footer__link text-small">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/verify" className="site-footer__link text-small">
                {t("verify")}
              </Link>
            </li>
            <li>
              <Link href="/login" className="site-footer__link text-small">
                {t("signIn")}
              </Link>
            </li>
            <li>
              <LanguageSwitch icon className="-mx-2 text-small text-white hover:text-blue" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
