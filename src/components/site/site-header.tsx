import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { practices } from "@/content/services/registry";
import { LanguageSwitch } from "./language-switch";
import { NavLink } from "./nav-link";
import { SiteHeaderShell } from "./site-header-shell";
import { SiteCta } from "./site-cta";
import { resolveLocale } from "./metadata";

type NavItem = { href: string; label: string; children?: { href: string; label: string; short: string }[] };

const linkClass = "touch inline-flex items-center px-3 text-graphite transition-colors duration-(--duration-state) hover:text-azure";

/**
 * Public site header. Rendered on the server; only the scroll state, the
 * mobile disclosure (SiteHeaderShell) and the current page marker (NavLink)
 * run on the client. At the top of a page the bar is transparent and sits on
 * the page grid; once the page scrolls it floats as a glass bar.
 */
export async function SiteHeader() {
  const locale = resolveLocale(await getLocale());
  const t = await getTranslations("site.nav");
  const tc = await getTranslations("common");

  const items: NavItem[] = [
    {
      href: "/services",
      label: t("services"),
      children: practices.map((p) => ({ href: `/services/${p.slug}`, label: p.title[locale], short: p.short[locale] })),
    },
    { href: "/projects", label: t("projects") },
    { href: "/case-studies", label: t("caseStudies") },
    { href: "/news", label: t("news") },
    { href: "/articles", label: t("articles") },
    { href: "/about", label: t("about") },
  ];

  const menu = (
    <nav aria-label={t("mobileLabel")}>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.href} className="border-b border-fog/80">
            <NavLink href={item.href} className="touch flex items-center py-2 text-lg text-graphite hover:text-azure">
              {item.label}
            </NavLink>
            {item.children ? (
              <ul className="-mt-1 pb-3">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <NavLink href={c.href} className="touch flex items-center ps-4 text-slate hover:text-azure" activeClassName="text-azure">
                      {c.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
        <li className="border-b border-fog/80">
          <NavLink href="/contact" className="touch flex items-center py-2 text-lg text-graphite hover:text-azure">
            {t("contact")}
          </NavLink>
        </li>
      </ul>
      {/* From sm up the bar itself shows the language switch and the call to action. */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <LanguageSwitch className="-ms-2 sm:hidden" />
        <Link href="/login" className="touch -me-2 inline-flex items-center px-2 text-small text-slate transition-colors duration-(--duration-state) hover:text-azure sm:me-0 sm:-ms-2">
          {tc("footer.signIn")}
        </Link>
      </div>
      <SiteCta href="/contact" size="md" className="mt-3 flex w-full sm:hidden">
        {t("talk")}
      </SiteCta>
    </nav>
  );

  return (
    <>
      <a href="#main" className="site-skip-link">
        {tc("skipToContent")}
      </a>
      <SiteHeaderShell menu={menu} menuLabel={tc("menu")}>
        <div className="flex flex-1 items-center">
          <Link href="/" aria-label={t("homeLabel")} className="-my-2 inline-flex items-center py-2 text-graphite">
            <Image src="/brand/logo/primary-graphite.svg" alt="" width={132} height={32} priority unoptimized className="h-7 w-auto sm:h-8" />
          </Link>
        </div>

        <nav aria-label={t("primaryLabel")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) =>
              item.children ? (
                <li key={item.href} className="group relative">
                  <NavLink href={item.href} className={linkClass}>
                    {item.label}
                  </NavLink>
                  <div className="invisible absolute start-0 top-full pt-3 opacity-0 transition-opacity duration-(--duration-state) group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="site-glass site-rounded grid w-[36rem] grid-cols-2 gap-1 p-2">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <NavLink href={c.href} className="flex h-full flex-col gap-0.5 px-3 py-3 transition-colors duration-(--duration-state) hover:bg-ice/80 focus-visible:bg-ice/80" activeClassName="bg-ice/60">
                            <span className="text-body font-medium text-graphite">{c.label}</span>
                            <span className="text-small text-slate">{c.short}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink href={item.href} className={linkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2 lg:flex-1">
          <LanguageSwitch className="hidden sm:inline-flex" />
          <SiteCta href="/contact" className="hidden sm:inline-flex">
            {t("talk")}
          </SiteCta>
        </div>
      </SiteHeaderShell>
    </>
  );
}
