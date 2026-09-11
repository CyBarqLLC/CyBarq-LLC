import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { company } from "@/content/site/company";
import { practices } from "@/content/services/registry";
import { JordanLegalName, RegistrationMark, RegistrationNumber } from "./registration";
import { resolveLocale } from "./metadata";

const linkClass = "transition-colors duration-(--duration-state) hover:text-azure";

/**
 * Public site footer: identity and positioning, links, the official
 * registration block, and the legal line. The Fine stream on Ice sits behind
 * the end half on large screens; it is a static file loaded lazily (it is
 * below the fold), mirrored in right to left layouts.
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
    <footer className="relative mt-auto overflow-hidden border-t border-fog bg-ice">
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/2 opacity-70 lg:block rtl:-scale-x-100" aria-hidden>
        <Image src="/brand/pattern/stream-fine-footer.svg" alt="" fill unoptimized loading="lazy" sizes="50vw" className="object-cover" />
      </div>
      <div className="container-page relative py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label={tn("homeLabel")} className="inline-flex self-start">
              <Image src="/brand/logo/primary-graphite.svg" alt="" width={132} height={32} unoptimized loading="lazy" className="h-8 w-auto" />
            </Link>
            <p className="max-w-sm text-graphite">{company.slogan[locale]}</p>
            <p className="max-w-sm text-small text-slate">{tf("tagline")}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-small" aria-label={tf("social")}>
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
            <h2 id="footer-services" className="mb-4 text-label text-slate">
              {t("services")}
            </h2>
            <ul className="flex flex-col gap-2.5">
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
            <h2 id="footer-explore" className="mb-4 text-label text-slate">
              {t("explore")}
            </h2>
            <ul className="flex flex-col gap-2.5">
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
            <h2 className="mb-4 text-label text-slate">{t("contact")}</h2>
            <ul className="flex flex-col gap-2.5">
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
              <li className="pt-2">
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

        <section aria-labelledby="footer-registration" className="mt-14 flex flex-col gap-5 border-t border-fog pt-8 sm:flex-row sm:items-center sm:gap-8">
          <h2 id="footer-registration" className="sr-only">
            {tr("heading")}
          </h2>
          <RegistrationMark alt={tr("alt")} sizes="144px" className="w-32 shrink-0 sm:w-36" />
          <div className="flex max-w-2xl flex-col gap-1 text-small text-slate">
            <p>{tr("jordan")}</p>
            <p>{tr("us")}</p>
            <RegistrationNumber format={(number) => tr("number", { number })} />
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 border-t border-fog pt-6 text-small text-slate lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p>
            © {year} {company.legalName[locale]}. {t("rights")} <JordanLegalName label={tr("legalNameLabel")} />
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <Link href="/privacy" className={linkClass}>
              {t("privacy")}
            </Link>
            <Link href="/terms" className={linkClass}>
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
