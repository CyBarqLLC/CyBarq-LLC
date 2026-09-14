import { iconPaths, type IconName } from "./icon-paths";
import { cn } from "@/lib/utils/cn";

type IconProps = {
  name: IconName;
  className?: string;
  /** Stroke weight in grid units. 1.5 is the interface default. */
  weight?: number;
};

/**
 * One CyBarq interface icon. Square joins and butt caps, a single stroke
 * weight, no fills: the printed pictogram language at interface size. Purely
 * decorative, so it is always hidden from assistive technology and the label
 * beside it carries the meaning.
 */
export function Icon({ name, className, weight = 1.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      className={cn("size-5 shrink-0", className)}
      aria-hidden
      focusable="false"
    >
      {iconPaths[name]}
    </svg>
  );
}
