"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { useReveal } from "./reveal";

type ServiceStripProps = {
  /** id of the heading that names the row. */
  labelledBy: string;
  /** Button labels; the strip is also scrolled by touch, wheel and keyboard focus. */
  controls: { previous: string; next: string };
  /** Cards, rendered on the server (ServiceStripCard). */
  children: React.ReactNode;
  className?: string;
};

/**
 * A row of cards that scrolls sideways on every screen: CSS scroll snap, no
 * visible scrollbar, edges fading out. On large screens two text buttons move
 * the row by one card (mirrored in right to left) and switch off at the ends;
 * focus moving through the cards scrolls them into view on its own.
 */
export function ServiceStrip({ labelledBy, controls, children, className }: ServiceStripProps) {
  const scroller = React.useRef<HTMLUListElement>(null);
  const [edges, setEdges] = React.useState({ start: true, end: false });
  const reveal = useReveal();

  React.useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      const position = Math.abs(element.scrollLeft);
      const next = { start: position <= 1, end: position >= max - 1 };
      setEdges((current) => (current.start === next.start && current.end === next.end ? current : next));
    };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      resize.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element || (direction === -1 && edges.start) || (direction === 1 && edges.end)) return;
    const card = element.firstElementChild;
    const width = card instanceof HTMLElement ? card.offsetWidth + 16 : element.clientWidth * 0.8;
    const rtl = getComputedStyle(element).direction === "rtl";
    element.scrollBy({ left: direction * width * (rtl ? -1 : 1), behavior: "smooth" });
  };

  const buttonClass = "touch inline-flex items-center px-2 text-small text-slate transition-colors duration-(--duration-state) hover:text-graphite aria-disabled:cursor-default aria-disabled:text-grey aria-disabled:hover:text-grey";

  return (
    <div ref={reveal} className={cn("site-reveal", className)}>
      <div className="mb-2 hidden justify-end gap-1 lg:flex">
        <button type="button" className={buttonClass} onClick={() => step(-1)} aria-disabled={edges.start}>
          {controls.previous}
        </button>
        <button type="button" className={cn(buttonClass, "-me-2")} onClick={() => step(1)} aria-disabled={edges.end}>
          {controls.next}
        </button>
      </div>
      <ul ref={scroller} className="site-strip" aria-labelledby={labelledBy}>
        {children}
      </ul>
    </div>
  );
}
