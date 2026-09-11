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

/** Left (start side) navigation for the internal platform. Rendered inside a sheet on small screens. */
export function Sidebar({ sections, onNavigate, className, namespace = "platform.nav", homeHref = "/app" }: SidebarProps) {
  const t = useTranslations(namespace);
  const pathname = usePathname();
  const isActive = (href: string) => (href === homeHref ? pathname === homeHref : pathname === href || pathname.startsWith(href + "/"));
  return (
    <nav className={cn("flex h-full flex-col", className)} aria-label="Platform">
      <Link href={homeHref} className="flex h-(--nav-height) items-center px-5 text-graphite" onClick={onNavigate} aria-label="CyBarq">
        <Logo className="h-6" />
      </Link>
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {sections.map((s) => (
          <div key={s.section} className="mb-6">
            <div className="px-2 pb-2 text-label text-slate">{t(`sections.${s.section}`)}</div>
            <ul className="flex flex-col gap-0.5">
              {s.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 px-2 text-body text-graphite transition-colors hover:bg-surface",
                      isActive(item.href) && "bg-ice font-medium",
                    )}
                  >
                    <NavIcon name={item.icon} className="size-4 shrink-0 text-slate" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
