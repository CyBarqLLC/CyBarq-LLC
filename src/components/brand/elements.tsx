import type * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The single blade: one of the four blades of the symbol, at its exact
 * proportion (20.2 degree apex). Used as marker and particle.
 * Geometry from 05_Graphic_Elements/Element_Blade.svg (100 unit box).
 */
export function Blade({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-4 fill-current", className)} aria-hidden style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}>
      <polygon points="50,15 50,73.1 25.83,80.69" />
    </svg>
  );
}

/**
 * Corner marks: the four blades of the symbol opened to the corners of a
 * panel. Rendered absolutely inside a relatively positioned parent.
 * Geometry from 05_Graphic_Elements/Element_Corner_Marks.svg.
 */
export function CornerMarks({ className, inset = "1rem", size = 14 }: { className?: string; inset?: string; size?: number }) {
  const mark = (points: string, pos: React.CSSProperties) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={cn("absolute fill-current", className)} style={pos} aria-hidden>
      <polygon points={points} />
    </svg>
  );
  return (
    <>
      {mark("1,1 15.2,15.2 11.15,22.97", { top: inset, insetInlineStart: inset })}
      {mark("23,1 8.8,15.2 1.03,11.15", { top: inset, insetInlineEnd: inset })}
      {mark("1,23 15.2,8.8 22.97,12.85", { bottom: inset, insetInlineStart: inset })}
      {mark("23,23 8.8,8.8 12.85,1.03", { bottom: inset, insetInlineEnd: inset })}
    </>
  );
}
