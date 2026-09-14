import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/brand/icon";
import type { IconName } from "@/components/brand/icon-paths";

export type QuickAction = { key: string; href: string; title: string; description: string; icon: IconName };

/**
 * The things a person most often comes here to start. One mark, one line of
 * plain language, and a rule that turns Graphite when pointed at: the same
 * card language as the public site, at working scale.
 */
export function ActionCards({ items }: { items: QuickAction[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="group flex h-full flex-col border border-fog bg-white p-5 transition-colors hover:border-graphite hover:bg-ice/30"
          >
            <span className="flex items-center justify-between gap-3">
              <Icon name={item.icon} className="size-6 text-azure" />
              <Icon name="arrow" className="size-4 text-grey transition-colors group-hover:text-azure rtl:-scale-x-100" />
            </span>
            <span className="mt-6 block text-h3 font-medium text-graphite">{item.title}</span>
            <span className="mt-1 block text-small text-slate">{item.description}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
