"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Marks an element with `data-inview` once it enters the lower part of the
 * viewport (or is already above it, as after a restored scroll position), then
 * stops watching. The styling lives in styles/site.css, where it applies only
 * when scripts run and the person has not asked for reduced motion; everything
 * else is visible at once. Returns a callback ref, so it attaches to any
 * element.
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

type Tag = "div" | "span" | "section" | "header" | "ul" | "ol" | "dl" | "li" | "p";

type RevealProps = {
  children?: React.ReactNode;
  className?: string;
  /** Delay before this block moves, in milliseconds. */
  delay?: number;
  /** Move the direct children one after another instead of the block as a whole. */
  stagger?: boolean;
  as?: Tag;
  id?: string;
  "aria-labelledby"?: string;
  "aria-hidden"?: boolean;
};

function makeReveal(base: string, group: string) {
  return function RevealBlock({ children, className, delay, stagger = false, as: Element = "div", id, "aria-labelledby": labelledBy, "aria-hidden": hidden }: RevealProps) {
    const ref = useReveal();
    const style = delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined;
    return (
      <Element ref={ref as never} id={id} aria-labelledby={labelledBy} aria-hidden={hidden} className={cn(stagger ? group : base, className)} style={style}>
        {children}
      </Element>
    );
  };
}

/**
 * Type that rises from behind its own baseline, clipped rather than faded —
 * the way a line of metal type comes up into the bed. For headings, statements
 * and leads. Never for a block that carries a mark outside its box.
 */
export const Rise = makeReveal("s-rise", "s-rise-group");

/**
 * A block that settles into place: a short lift and a fade, no clipping. For
 * panels, grids, cards and anything with a mark or a shadow outside its box.
 */
export const Settle = makeReveal("s-settle", "s-settle-group");

/** A hairline that draws itself from the start side. */
export const Draw = makeReveal("s-draw", "s-draw");

/**
 * The original wrapper, kept so pages that have not moved to Rise or Settle
 * keep behaving. New work should use Rise for type and Settle for blocks.
 */
export const Reveal = makeReveal("site-reveal", "site-reveal-stagger");
