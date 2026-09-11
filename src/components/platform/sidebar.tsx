"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "./nav-icon";
import type { NavEntry } from "./nav-config";
import { cn } from "@/lib/utils/cn";

type SidebarProps = {
  sections: { section: string; items: NavEntry[] }[];
  onNavigate?: () => void;
  className?: string;
  /** Message namespace holding `sections.*` and item labels. */
  namespace?: "platform.nav" | "portal.nav";
  homeHref?: string;
};

/**
 * Start-side navigation for the internal platform and the client portal.
 * Rendered inside a sheet on small screens. The active item is marked with a
 * 2px graphite bar on the start edge rather than a filled background, so the
 * column stays quiet.
 */
export function Sidebar({ sections, onNavigate, className, namespace = "platform.nav", homeHref = "/app" }: SidebarProps) {
  const t = useTranslations(namespace);
  const tc = useTranslations("common");
  const pathname = usePathname();
  const isActive = (href: string) => (href === homeHref ? pathname === homeHref : pathname === href || pathname.startsWith(href + "/"));
  return (
    <nav className={cn("flex h-full flex-col", className)} aria-label={tc("navigation")}>
      <Link href={homeHref} className="flex h-(--nav-height) shrink-0 items-center px-5 text-graphite" onClick={onNavigate} aria-label={tc("brand")}>
        <Logo className="h-6" />
      </Link>
      <div className="flex-1 overflow-y-auto px-3 pb-8 pt-2">
        {sections.map((s) => (
          <div key={s.section} className="mb-7">
            <div className="mb-2 px-3 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-slate/80">{t(`sections.${s.section}`)}</div>
            <ul className="flex flex-col gap-px">
              {s.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-3 px-3 text-body text-slate transition-colors duration-(--duration-state) hover:bg-surface hover:text-graphite",
                        "before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:bg-transparent before:transition-colors before:content-['']",
                        active && "bg-surface/60 font-medium text-graphite before:bg-graphite",
                      )}
                    >
                      <NavIcon name={item.icon} className={cn("size-4.5 shrink-0 transition-colors", active ? "text-graphite" : "text-slate")} />
                      <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
