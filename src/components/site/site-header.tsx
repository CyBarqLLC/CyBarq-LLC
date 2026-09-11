"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LanguageSwitch } from "./language-switch";
import { practices } from "@/content/services/registry";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string; children?: { href: string; label: string; short: string }[] };

export function SiteHeader() {
  const t = useTranslations("site.nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={cn("sticky top-0 z-40 bg-white transition-shadow safe-pt", scrolled && "shadow-[0_1px_0_0_var(--color-fog)]")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-3 focus:py-2 focus:text-white">
        {tc("skipToContent")}
      </a>
      <div className="container-page flex h-(--nav-height) items-center justify-between gap-6">
        <Link href="/" className="flex items-center text-graphite" aria-label={tc("company")}>
          <Logo className="h-7 sm:h-8" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {items.map((item) =>
            item.children ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn("touch inline-flex items-center px-3 text-body text-graphite hover:text-azure", isActive(item.href) && "text-azure")}
                  aria-haspopup="true"
                >
                  {item.label}
                </Link>
                <div className="invisible absolute start-0 top-full w-[36rem] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="grid grid-cols-2 gap-1 border border-fog bg-white p-2 shadow-[0_12px_32px_rgba(13,14,19,0.08)]">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="flex flex-col gap-0.5 px-3 py-3 hover:bg-ice">
                        <span className="text-body font-medium text-graphite">{c.label}</span>
                        <span className="text-small text-slate">{c.short}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className={cn("touch inline-flex items-center px-3 text-body text-graphite hover:text-azure", isActive(item.href) && "text-azure")}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitch className="hidden sm:inline-flex" />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/contact">{t("talk")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={tc("menu")}>
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="end" title={tc("menu")}>
              <nav className="flex flex-col" aria-label="Mobile">
                {items.map((item) => (
                  <div key={item.href} className="border-b border-fog py-1">
                    <SheetClose asChild>
                      <Link href={item.href} className="touch flex items-center text-body font-medium text-graphite">
                        {item.label}
                      </Link>
                    </SheetClose>
                    {item.children?.map((c) => (
                      <SheetClose asChild key={c.href}>
                        <Link href={c.href} className="touch flex items-center ps-4 text-body text-slate hover:text-graphite">
                          {c.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                ))}
                <SheetClose asChild>
                  <Link href="/contact" className="touch flex items-center text-body font-medium text-graphite border-b border-fog py-1">
                    {t("contact")}
                  </Link>
                </SheetClose>
                <div className="mt-4 flex items-center justify-between">
                  <LanguageSwitch />
                  <SheetClose asChild>
                    <Link href="/login" className="touch inline-flex items-center px-2 text-small text-slate">
                      {tc("footer.signIn")}
                    </Link>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
