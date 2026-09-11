import { CORPORATE_BILINGUAL_PATHS, CORPORATE_BILINGUAL_VIEWBOX, PRIMARY_PATHS, PRIMARY_VIEWBOX, SYMBOL_PATHS, SYMBOL_VIEWBOX } from "./logo-paths";
import { cn } from "@/lib/utils/cn";

type LogoProps = { className?: string; title?: string };

/** Primary logo: symbol and CyBarq. Default for every public application. Minimum width 88px. */
export function Logo({ className, title = "CyBarq" }: LogoProps) {
  return (
    <svg viewBox={PRIMARY_VIEWBOX} className={cn("h-8 w-auto fill-current", className)} role="img" aria-label={title}>
      <title>{title}</title>
      {PRIMARY_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Symbol alone: page signature, favicons, marks. */
export function Symbol({ className, title }: LogoProps) {
  return (
    <svg viewBox={SYMBOL_VIEWBOX} className={cn("size-6 fill-current", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {title ? <title>{title}</title> : null}
      {SYMBOL_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Corporate bilingual lockup: formal documents only. */
export function CorporateLogo({ className, title = "CyBarq Technology LLC" }: LogoProps) {
  return (
    <svg viewBox={CORPORATE_BILINGUAL_VIEWBOX} className={cn("h-10 w-auto fill-current", className)} role="img" aria-label={title}>
      <title>{title}</title>
      {CORPORATE_BILINGUAL_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Page signature: symbol next to a number or short label (used in footers and documents). */
export function PageSignature({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-small text-graphite", className)}>
      <Symbol className="size-4" />
      <span>{label}</span>
    </span>
  );
}
