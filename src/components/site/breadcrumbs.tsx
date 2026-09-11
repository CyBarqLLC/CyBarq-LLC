import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type Crumb = { href?: string; label: string };

/** Small breadcrumb trail. The last item is the current page and is not a link. */
export function Breadcrumbs({ items, className, label }: { items: Crumb[]; className?: string; label?: string }) {
  const t = useTranslations("site.nav");
  return (
    <nav aria-label={label ?? t("breadcrumb")} className={cn("text-slate", className)}>
      {/* The size sits on the list: cn() would read text-small as a colour and drop it next to text-slate. */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors duration-(--duration-state) hover:text-azure">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "text-graphite")}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden className="text-grey">
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
