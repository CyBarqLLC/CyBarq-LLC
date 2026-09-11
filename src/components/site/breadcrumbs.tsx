import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type Crumb = { href?: string; label: string };

/** Small breadcrumb trail. The last item is the current page and is not a link. */
export function Breadcrumbs({ items, className, label = "Breadcrumb" }: { items: Crumb[]; className?: string; label?: string }) {
  return (
    <nav aria-label={label} className={cn("text-small text-slate", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-azure">{item.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-graphite")}>{item.label}</span>
              )}
              {!last ? <span aria-hidden className="text-grey">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
