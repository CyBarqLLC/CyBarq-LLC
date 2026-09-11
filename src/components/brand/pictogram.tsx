import { pictogramPaths, type PictogramName } from "./pictogram-paths";
import { cn } from "@/lib/utils/cn";

type PictogramProps = { name: PictogramName; className?: string; title?: string };

/**
 * CyBarq pictograms: 48 unit grid, one thin line of 1.35 units, two to four
 * strokes, no fills. Colour follows `currentColor` (Graphite on light, white on dark).
 */
export function Pictogram({ name, className, title }: PictogramProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-12 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {pictogramPaths[name]}
    </svg>
  );
}

export type { PictogramName };
