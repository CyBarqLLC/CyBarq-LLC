"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { CommandSearch, type CommandItem } from "@/components/ui/command-search";
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
  /** Everything the palette can jump to. Renders the quick search at the top. */
  commands?: CommandItem[];
};

/**
 * Start-side navigation for the internal platform and the client portal.
 *
 * The column is a working index, not a menu: the wordmark, the quick search
 * that answers Cmd K, then the destinations under quiet sentence case group
 * names. The page being read is marked with a CyBarq Blue bar on the start
 * edge and a pale ground, so the column stays calm while still telling you
 * where you are.
 */
export function Sidebar({ sections, onNavigate, className, namespace = "platform.nav", homeHref = "/app", commands }: SidebarProps) {
  const t = useTranslations(namespace);
  const tc = useTranslations("common");
  const tb = useTranslations("platform.topbar");
  const pathname = usePathname();
  const isActive = (href: string) => (href === homeHref ? pathname === homeHref : pathname === href || pathname.startsWith(href + "/"));
  return (
    <nav className={cn("flex h-full flex-col", className)} aria-label={tc("navigation")}>
      <Link href={homeHref} className="flex h-(--nav-height) shrink-0 items-center px-5 text-graphite" onClick={onNavigate} aria-label={tc("brand")}>
        <Logo className="h-6" />
      </Link>

      {commands && commands.length > 0 ? (
        <div className="px-3 pb-1">
          <CommandSearch
            items={commands}
            className="w-full"
            labels={{ placeholder: tb("searchPlaceholder"), empty: tb("searchEmpty"), title: tb("search"), open: tb("search") }}
          />
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-3 pb-8 pt-4">
        {sections.map((s) => (
          <div key={s.section} className="mb-7">
            <div className="mb-2 px-3 text-label font-medium text-slate">{t(`sections.${s.section}`)}</div>
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
                        "before:absolute before:inset-y-1.5 before:start-0 before:w-0.5 before:bg-transparent before:transition-colors before:content-['']",
                        active && "bg-ice/45 font-medium text-graphite before:bg-blue",
                      )}
                    >
                      <NavIcon name={item.icon} className={cn("size-5 shrink-0 transition-colors", active ? "text-azure" : "text-slate")} />
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
