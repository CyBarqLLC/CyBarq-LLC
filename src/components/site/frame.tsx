import { cn } from "@/lib/utils/cn";

export type Corner = "top-start" | "top-end" | "bottom-start" | "bottom-end";

/** Corner blade geometry from 05_Graphic_Elements/Element_Corner_Marks.svg (24 unit box, tip in the corner). */
const GEOMETRY: Record<Corner, string> = {
  "top-start": "1,1 15.2,15.2 11.15,22.97",
  "top-end": "23,1 8.8,15.2 1.03,11.15",
  "bottom-start": "1,23 15.2,8.8 22.97,12.85",
  "bottom-end": "23,23 8.8,8.8 12.85,1.03",
};

const ALL: readonly Corner[] = ["top-start", "top-end", "bottom-start", "bottom-end"];

function placement(corner: Corner, inset: string): React.CSSProperties {
  const [block, inline] = corner.split("-") as ["top" | "bottom", "start" | "end"];
  return {
    [block]: inset,
    [inline === "start" ? "insetInlineStart" : "insetInlineEnd"]: inset,
  } as React.CSSProperties;
}

type FieldFrameProps = {
  /** Which corners carry a blade. All four by default: the symbol, opened. */
  corners?: readonly Corner[];
  /** Blade size in px. */
  size?: number;
  /** Distance from the panel edges (any CSS length). */
  inset?: string;
  className?: string;
};

/**
 * The four blades of the symbol opened to the corners of a panel — the brand's
 * own framing device, made live. Each blade grows out of its own corner as the
 * panel arrives, and inside a card or a specimen it takes CyBarq Blue when the
 * panel is pointed at. Rendered absolutely inside a relatively positioned
 * parent and mirrored in right to left layouts, so a blade always points into
 * the corner it sits in. Decorative only.
 */
export function FieldFrame({ corners = ALL, size = 13, inset = "0.875rem", className }: FieldFrameProps) {
  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          aria-hidden
          focusable="false"
          data-corner={corner}
          className={cn("s-frame__blade", className)}
          style={placement(corner, inset)}
        >
          <polygon points={GEOMETRY[corner]} />
        </svg>
      ))}
    </>
  );
}
