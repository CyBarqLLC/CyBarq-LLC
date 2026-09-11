"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type TabItem = { href: string; label: string; exact?: boolean; count?: number };

/** Link based tabs: each tab is its own server rendered route, so deep links and back navigation work. */
export function TabNav({ items, className, ariaLabel }: { items: TabItem[]; className?: string; ariaLabel?: string }) {
  const pathname = usePathname();
  const isActive = (item: TabItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));
  return (
    <nav aria-label={ariaLabel} className={cn("flex w-full gap-1 overflow-x-auto border-b border-fog [scrollbar-width:none]", className)}>
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-body text-slate transition-colors hover:text-graphite",
              active && "border-graphite text-graphite font-medium",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? <span className="bg-surface px-1.5 text-label text-slate">{item.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
