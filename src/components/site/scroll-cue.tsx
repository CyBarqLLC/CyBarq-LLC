"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const getSnapshot = () => window.scrollY > 24;
const getServerSnapshot = () => false;

/**
 * Hero scroll cue: a single thin line that breathes (CSS animation) and fades
 * out as soon as the page moves. Decorative; hidden from assistive technology.
 */
export function ScrollCue({ className }: { className?: string }) {
  const scrolled = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <span aria-hidden className={cn("site-scroll-cue", className)} data-hidden={scrolled ? "" : undefined} />;
}
