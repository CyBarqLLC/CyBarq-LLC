import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { company } from "@/content/site/company";
import { practices } from "@/content/services/registry";
import { FieldFrame } from "./frame";
import { JordanLegalName, RegistrationMark, RegistrationNumber } from "./registration";
import { resolveLocale } from "./metadata";

const linkClass = "site-link inline-flex min-h-9 items-center text-graphite hover:text-azure";

/**
 * The colophon: identity, index, contact, the official registration and the
 * legal line, all on hairlines over the white ground, with the blades of the
 * symbol opened to the two top corners to close the document.
 *
 * It is deliberately not a coloured field. The Graphite chapter in the middle
 * of the page is the one field the layout is allowed, so the page closes on
 * white with the Fine stream left as the faintest texture at the end side:
 * present if you look for it, never competing with the type.
 */
export async function SiteFooter() {
  const locale = resolveLocale(await getLocale());
  const t = await getTranslations("common.footer");
  const tn = await getTranslations("site.nav");
  const tf = await getTranslations("site.footer");
  const tr = await getTranslations("site.registration");
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

  const social = [
    { href: company.social.linkedin, label: "LinkedIn" },
    { href: company.social.instagram, label: "Instagram" },
    { href: company.social.facebook, label: "Facebook" },
    { href: company.social.x, label: "X" },
  ];

  return (
    <footer className="relative mt-auto overflow-clip border-t border-fog bg-white">
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/2 opacity-25 lg:block rtl:-scale-x-100" aria-hidden>
        <Image src="/brand/pattern/stream-fine-footer.svg" alt="" fill unoptimized loading="lazy" sizes="50vw" className="object-cover" />
      </div>
      <FieldFrame corners={["top-start", "top-end"]} inset="clamp(1rem, 2.5vw, 2rem)" className="text-grey" />

      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-10">
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label={tn("homeLabel")} className="inline-flex self-start text-graphite">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="s-sub max-w-sm text-graphite">{company.slogan[locale]}</p>
            <p className="max-w-sm text-small text-slate">{tf("tagline")}</p>
            <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-small" aria-label={tf("social")}>
              {social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {s.label}
                    <span className="sr-only"> {tf("newTab")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-services">
            <h2 id="footer-services" className="s-meta mb-5 border-t border-fog pt-3 text-slate">
              {t("services")}
            </h2>
            <ul className="flex flex-col gap-1">
              {practices.map((p) => (
                <li key={p.slug}>
                  <Link href={`/services/${p.slug}`} className={linkClass}>
                    {p.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="s-meta mb-5 border-t border-fog pt-3 text-slate">
              {t("explore")}
            </h2>
            <ul className="flex flex-col gap-1">
              {explore.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className={linkClass}>
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="s-meta mb-5 border-t border-fog pt-3 text-slate">{t("contact")}</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <a href={`mailto:${company.emails.general}`} className={linkClass}>
                  {company.emails.general}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.emails.sales}`} className={linkClass}>
                  {company.emails.sales}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.emails.support}`} className={linkClass}>
                  {company.emails.support}
                </a>
              </li>
              <li className="pt-3">
                <Link href="/verify" className={linkClass}>
                  {t("verify")}
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkClass}>
                  {t("signIn")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <section aria-labelledby="footer-registration" className="mt-16 flex flex-col items-start gap-3 border-t border-fog pt-8">
          <h2 id="footer-registration" className="sr-only">
            {tr("heading")}
          </h2>
          <RegistrationMark alt={tr("alt")} sizes="(min-width: 640px) 22rem, 70vw" className="w-56 sm:w-88" />
          <RegistrationNumber format={(number) => tr("number", { number })} className="max-w-prose text-[0.6875rem] leading-relaxed text-slate" />
        </section>

        <div className="mt-10 flex flex-col gap-3 border-t border-fog pt-6 text-small text-slate lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p>
            © {year} {company.legalName[locale]}. {t("rights")} <JordanLegalName label={tr("legalNameLabel")} />
          </p>
          <div className="flex shrink-0 items-center gap-6">
            <Link href="/privacy" className="site-link hover:text-azure">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="site-link hover:text-azure">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
