import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export type Corner = "top-start" | "top-end" | "bottom-start" | "bottom-end";

/** Corner blade geometry from 05_Graphic_Elements/Element_Corner_Marks.svg (24 unit box, tip in the corner). */
const GEOMETRY: Record<Corner, string> = {
  "top-start": "1,1 15.2,15.2 11.15,22.97",
  "top-end": "23,1 8.8,15.2 1.03,11.15",
  "bottom-start": "1,23 15.2,8.8 22.97,12.85",
  "bottom-end": "23,23 8.8,8.8 12.85,1.03",
};

function placement(corner: Corner, inset: string): React.CSSProperties {
  switch (corner) {
    case "top-start":
      return { top: inset, insetInlineStart: inset };
    case "top-end":
      return { top: inset, insetInlineEnd: inset };
    case "bottom-start":
      return { bottom: inset, insetInlineStart: inset };
    case "bottom-end":
      return { bottom: inset, insetInlineEnd: inset };
  }
}

type StretchedCornerMarksProps = {
  /** Which corners carry a mark. Two opposite corners by default. */
  corners?: readonly Corner[];
  /** Mark height in px. The height of the original corner mark is kept. */
  height?: number;
  /** Horizontal stretch factor: the mark is this many times wider than it is tall. */
  stretch?: number;
  /** Distance from the panel edges (any CSS length). */
  inset?: string;
  className?: string;
};

/**
 * Corner blades stretched horizontally (not scaled uniformly): the same 24 unit
 * geometry drawn into a box `stretch` times wider than it is tall, with
 * `preserveAspectRatio="none"`. Rendered absolutely inside a relatively
 * positioned parent; mirrored in right to left layouts so each blade still
 * points into its own corner. Decorative only.
 */
export function StretchedCornerMarks({ corners = ["top-start", "bottom-end"], height = 16, stretch = 4, inset = "2rem", className }: StretchedCornerMarksProps) {
  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner}
          viewBox="0 0 24 24"
          width={height * stretch}
          height={height}
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
          className={cn("pointer-events-none absolute fill-current rtl:-scale-x-100", className)}
          style={placement(corner, inset)}
        >
          <polygon points={GEOMETRY[corner]} />
        </svg>
      ))}
    </>
  );
}
