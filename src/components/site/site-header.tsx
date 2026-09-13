import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, Symbol } from "@/components/brand/logo";
import { practices } from "@/content/services/registry";
import { LanguageSwitch } from "./language-switch";
import { NavLink } from "./nav-link";
import { SiteHeaderShell } from "./site-header-shell";
import { SiteCta } from "./site-cta";
import { resolveLocale } from "./metadata";

type NavItem = { href: string; label: string; children?: { href: string; label: string; short: string }[] };

/**
 * Public site header. Rendered on the server; only the condensed state, the
 * menu disclosure (SiteHeaderShell) and the current page marker (NavLink) run
 * on the client.
 *
 * The bar is square and flush with the page, as the identity is: no rounded
 * pill, no floating card. Once the page moves it condenses, the wordmark hands
 * over to the symbol, and a Graphite hairline along the bottom edge reports
 * how far down the page the visitor has read. The marker under the current
 * item is a hairline that draws from the start side.
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

  /* The menu sheet: the same index, set large and numbered, as a page of its own. */
  const menu = (
    <nav aria-label={t("mobileLabel")} className="container-page flex h-full flex-col">
      <ul className="flex flex-col">
        {[...items, { href: "/contact", label: t("contact") } as NavItem].map((item, i) => (
          <li key={item.href} className="border-b border-fog">
            <NavLink href={item.href} className="flex items-baseline gap-4 py-4 text-graphite transition-colors duration-(--s-fast) hover:text-azure" activeClassName="text-azure">
              <span aria-hidden className="s-meta text-grey">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="s-sub">{item.label}</span>
            </NavLink>
            {item.children ? (
              <ul className="-mt-1 flex flex-wrap gap-x-5 gap-y-1 ps-9 pb-4">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <NavLink href={c.href} className="inline-flex min-h-9 items-center text-small text-slate transition-colors duration-(--s-fast) hover:text-azure" activeClassName="text-azure">
                      {c.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-4 pt-8">
        <SiteCta href="/contact" size="md" className="flex w-full sm:hidden">
          {t("talk")}
        </SiteCta>
        <div className="flex items-center justify-between gap-4">
          <LanguageSwitch className="-ms-2 sm:hidden" />
          <Link href="/login" className="touch -me-2 inline-flex items-center px-2 text-small text-slate transition-colors duration-(--s-fast) hover:text-azure sm:me-0 sm:-ms-2">
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
        <div className="flex flex-1 items-center">
          <Link href="/" aria-label={t("homeLabel")} className="site-brand text-graphite">
            <Logo className="site-brand__full h-7 w-auto sm:h-[1.875rem]" />
            <Symbol className="site-brand__mark size-6" />
          </Link>
        </div>

        <nav aria-label={t("primaryLabel")} className="hidden lg:block">
          <ul className="flex items-center">
            {items.map((item) =>
              item.children ? (
                <li key={item.href} className="group relative">
                  <NavLink href={item.href} className="site-nav-link text-small" activeClassName="text-graphite">
                    {item.label}
                  </NavLink>
                  <div className="invisible absolute start-0 top-full pt-2 opacity-0 transition-opacity duration-(--s-fast) group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="site-panel-menu grid w-[34rem] grid-cols-2 gap-px bg-fog p-px">
                      {item.children.map((c, i) => (
                        <li key={c.href} className="bg-white">
                          <NavLink
                            href={c.href}
                            className="flex h-full flex-col gap-1 px-4 py-4 transition-colors duration-(--s-fast) hover:bg-ice/70 focus-visible:bg-ice/70"
                            activeClassName="bg-ice/50"
                          >
                            <span aria-hidden className="s-meta text-grey">
                              {String(i + 1).padStart(2, "0")}
                            </span>
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
                  <NavLink href={item.href} className="site-nav-link text-small" activeClassName="text-graphite">
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
