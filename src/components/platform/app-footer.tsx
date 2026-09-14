import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { company } from "@/content/site/company";

/**
 * The quiet line that closes every platform and portal page: where to get
 * help, the public documents, and who operates the system. It is the only
 * place in the application that speaks to the person as a company rather than
 * as a tool.
 */
export async function AppFooter() {
  const t = await getTranslations("platform.footer");
  const year = new Date().getFullYear();
  const links = [
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
    { href: "/verify", label: t("verify") },
  ];
  return (
    <footer className="border-t border-fog bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-small text-slate sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label={t("label")}>
          <a href={`mailto:${company.emails.support}`} className="transition-colors hover:text-graphite">
            {t("support")}
          </a>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-graphite">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="s-num">{t("copyright", { year, company: company.legalName.en })}</p>
      </div>
    </footer>
  );
}
