"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Marks an element with `data-inview` once it enters the lower 88% of the
 * viewport (or is already above it, as after a restored scroll position), then
 * stops watching. The styling lives in globals.css (`.site-reveal`,
 * `.site-reveal-stagger`), where it applies only when scripts run and the
 * person has not asked for reduced motion; everything else is visible at once.
 * Returns a callback ref, so it attaches to any element.
 */
export function useReveal() {
  return React.useCallback((element: HTMLElement | null) => {
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      element.setAttribute("data-inview", "");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            element.setAttribute("data-inview", "");
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay before this block moves in, in milliseconds. */
  delay?: number;
  /** Reveal the direct children one after another instead of the block as a whole. */
  stagger?: boolean;
  /** Element to render. A list keeps its list semantics when its items are the staggered children. */
  as?: "div" | "section" | "ul" | "ol" | "dl";
  id?: string;
  "aria-labelledby"?: string;
};

/**
 * Scroll reveal wrapper for server rendered content: a soft translate and
 * fade when the block comes into view. Renders a plain element; the only
 * client work is one IntersectionObserver per block.
 */
export function Reveal({ children, className, delay, stagger = false, as: Tag = "div", id, "aria-labelledby": labelledBy }: RevealProps) {
  const ref = useReveal();
  const classes = cn(stagger ? "site-reveal-stagger" : "site-reveal", className);
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag ref={ref} id={id} aria-labelledby={labelledBy} className={classes} style={style}>
      {children}
    </Tag>
  );
}
