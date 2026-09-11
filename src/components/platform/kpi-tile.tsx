import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type KpiTileProps = { label: string; value: string; hint?: string; href?: string; className?: string };

/** Quiet number tile for the dashboard. One figure, one label, optional link. */
export function KpiTile({ label, value, hint, href, className }: KpiTileProps) {
  const body = (
    <>
      <span className="block text-small text-slate">{label}</span>
      <span className="mt-2 block text-h1 font-light tabular-nums text-graphite">{value}</span>
      {hint ? <span className="mt-1 block text-label text-slate">{hint}</span> : null}
    </>
  );
  const base = "block border border-fog bg-white p-5";
  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-colors hover:border-grey", className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}
