"use client";

import * as React from "react";
import { StreamCanvas } from "./stream-canvas";
import type { StreamPreset, StreamParams } from "./stream-math";
import { cn } from "@/lib/utils/cn";

type StreamProps = {
  preset?: StreamPreset;
  params?: StreamParams;
  ink?: string;
  accent?: string;
  interactive?: boolean;
  className?: string;
  /** Server rendered static fallback (StreamStatic) shown until the canvas paints. */
  children?: React.ReactNode;
};

/**
 * Progressive Stream: paints the static SVG immediately (no JS, no LCP cost)
 * and swaps in the animated canvas once it has drawn its first frame.
 */
export function Stream({ preset, params, ink, accent, interactive, className, children }: StreamProps) {
  const [ready, setReady] = React.useState(false);
  const onReady = React.useCallback(() => setReady(true), []);
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div className={cn("absolute inset-0 transition-opacity duration-(--duration-panel)", ready ? "opacity-0" : "opacity-100")} aria-hidden>
        {children}
      </div>
      <StreamCanvas preset={preset} params={params} ink={ink} accent={accent} interactive={interactive} onReady={onReady} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
