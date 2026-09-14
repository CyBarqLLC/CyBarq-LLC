import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/brand/icon";
import type { IconName } from "@/components/brand/icon-paths";
import { cn } from "@/lib/utils/cn";

type KpiTileProps = { label: string; value: string; hint?: string; href?: string; icon?: IconName; className?: string };

/**
 * One figure from the day's work. The label and the CyBarq mark share the top
 * line, the figure sits underneath at specification scale, and the tile answers
 * a pointer with a Graphite rule rather than a shadow: nothing floats here.
 */
export function KpiTile({ label, value, hint, href, icon, className }: KpiTileProps) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-small text-slate">{label}</span>
        {icon ? <Icon name={icon} className="size-5 text-grey transition-colors group-hover:text-azure" /> : null}
      </span>
      <span className="mt-3 block text-h1 font-light tabular-nums text-graphite">{value}</span>
      {hint ? <span className="mt-1 block text-label text-slate">{hint}</span> : null}
    </>
  );
  const base = "group block border border-fog bg-white p-5";
  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-colors hover:border-graphite", className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}
