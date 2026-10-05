import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { practices, servicesByPractice, servicePath } from "@/content/services";
import { Action, Arrow } from "./action";
import { LanguageSwitch } from "./language-switch";
import { NavLink } from "./nav-link";
import { SiteHeaderShell } from "./site-header-shell";
import { resolveLocale } from "./metadata";

/** How many services each practice lists in the header panel; the practice page carries the rest. */
const PANEL_SERVICES = 5;

/**
 * Public site header: a solid white bar that stays with the page. The logo at
 * the start, the navigation in the middle, the language and one action at the
 * end, and nothing else. Rendered on the server; only the menu disclosure
 * (SiteHeaderShell) and the current page marker (NavLink) run on the client.
 */
export async function SiteHeader() {
  const locale = resolveLocale(await getLocale());
  const t = await getTranslations("site.nav");
  const tc = await getTranslations("common");

  const groups = practices.map((p) => ({
    href: `/services/${p.slug}`,
    label: p.title[locale],
    short: p.short[locale],
    services: servicesByPractice(p.slug)
      .slice(0, PANEL_SERVICES)
      .map((s) => ({ href: servicePath(s), label: s.title[locale] })),
  }));

  const links = [
    { href: "/projects", label: t("projects") },
    { href: "/case-studies", label: t("caseStudies") },
    { href: "/articles", label: t("articles") },
    { href: "/about", label: t("about") },
  ];

  const menu = (
    <nav aria-label={t("mobileLabel")} className="container-page flex min-h-full flex-col">
      <ul className="flex flex-col">
        <li className="border-b border-fog">
          <NavLink href="/services" className="site-menu__link" activeClassName="">
            {t("services")}
          </NavLink>
          <ul className="site-menu__sub">
            {groups.map((g) => (
              <li key={g.href}>
                <NavLink href={g.href} className="site-menu__sublink" activeClassName="">
                  {g.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </li>
        {[...links, { href: "/contact", label: t("contact") }].map((item) => (
          <li key={item.href} className="border-b border-fog">
            <NavLink href={item.href} className="site-menu__link" activeClassName="">
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-5 pt-10">
        <Action href="/contact" arrow className="w-full">
          {t("talk")}
        </Action>
        <div className="flex items-center justify-between gap-4">
          <LanguageSwitch icon className="-ms-2 font-medium" />
          <Link href="/login" className="touch -me-2 inline-flex items-center px-2 text-small text-slate hover:text-graphite">
            {tc("footer.signIn")}
          </Link>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <a href="#main" className="site-skip-link">
        {tc("skipToContent")}
      </a>
      <SiteHeaderShell menu={menu} menuLabel={tc("menu")}>
        <Link href="/" aria-label={t("homeLabel")} className="site-brand">
          <Logo className="h-7 w-auto lg:h-8" />
        </Link>

        <nav aria-label={t("primaryLabel")} className="site-nav lg:ms-6">
          <div className="site-nav__item">
            <NavLink href="/services" className="site-nav-link" activeClassName="">
              {t("services")}
              <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden focusable="false" className="site-nav__caret">
                <path d="M1 3l4 4 4-4" />
              </svg>
            </NavLink>
            <div className="site-mega">
              <ul className="site-mega__grid container-page">
                {groups.map((g) => (
                  <li key={g.href} className="site-mega__col">
                    <Link href={g.href} className="site-mega__title">
                      {g.label}
                      <Arrow />
                    </Link>
                    <p className="site-mega__short">{g.short}</p>
                    <ul className="site-mega__list">
                      {g.services.map((s) => (
                        <li key={s.href}>
                          <Link href={s.href} className="site-mega__link">
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {links.map((item) => (
            <div key={item.href} className="site-nav__item">
              <NavLink href={item.href} className="site-nav-link" activeClassName="">
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="site-header__end">
          <LanguageSwitch icon className="hidden font-medium sm:inline-flex" />
          <Action href="/contact" size="sm" className="hidden sm:inline-flex">
            {t("talk")}
          </Action>
        </div>
      </SiteHeaderShell>
    </>
  );
}
