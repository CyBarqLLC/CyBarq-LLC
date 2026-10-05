import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type Crumb = { href?: string; label: string };

/** Small breadcrumb trail in the inks of its ground. The last item is the current page and is not a link. */
export function Breadcrumbs({ items, className, label }: { items: Crumb[]; className?: string; label?: string }) {
  const t = useTranslations("site.nav");
  return (
    <nav aria-label={label ?? t("breadcrumb")} className={cn("s-crumbs", className)}>
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-2.5">
              {item.href && !last ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="truncate">
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden className="opacity-50">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
