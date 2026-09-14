"use client";

import * as React from "react";
import { GlobeCanvas, type GlobePlacement } from "./globe-canvas";
import type { GlobeParams } from "./globe-math";
import { cn } from "@/lib/utils/cn";

type GlobeProps = {
  params?: GlobeParams;
  placement?: GlobePlacement;
  ink?: string;
  blue?: string;
  lime?: string;
  hair?: string;
  mirror?: boolean;
  interactive?: boolean;
  className?: string;
  /** The server rendered still frame, held until the canvas has painted. */
  children?: React.ReactNode;
};

/** Paints the still globe first, then hands over to the turning one. */
export function Globe({ children, className, ...rest }: GlobeProps) {
  const [ready, setReady] = React.useState(false);
  const onReady = React.useCallback(() => setReady(true), []);
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div className={cn("absolute inset-0 transition-opacity duration-(--duration-panel)", ready ? "opacity-0" : "opacity-100")} aria-hidden>
        {children}
      </div>
      <GlobeCanvas {...rest} onReady={onReady} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
