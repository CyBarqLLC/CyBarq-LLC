"use client";

import * as React from "react";

type MarqueeFrameProps = {
  headingId: string;
  title: string;
  /** Visible button text, plus a screen reader suffix naming what moves ("logo animation"). */
  labels: { pause: string; play: string; subject: string };
  children: React.ReactNode;
};

/**
 * Heading row and pause control for a logo marquee. Motion pauses on hover and
 * while focus is inside; the button pauses it for good (WCAG 2.2.2). The
 * animation itself is pure CSS; this only toggles `data-paused`. Hidden when
 * the user prefers reduced motion, since nothing moves then.
 */
export function MarqueeFrame({ headingId, title, labels, children }: MarqueeFrameProps) {
  const [paused, setPaused] = React.useState(false);
  return (
    <div className="site-marquee-root" data-paused={paused ? "" : undefined}>
      <div className="mb-6 flex min-h-11 items-center justify-between gap-4">
        <h2 id={headingId} className="text-label text-slate">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="site-marquee__control touch -me-2 inline-flex items-center px-2 text-small text-slate transition-colors duration-(--duration-state) hover:text-graphite motion-reduce:hidden"
        >
          {paused ? labels.play : labels.pause}
          <span className="sr-only"> {labels.subject}</span>
        </button>
      </div>
      {children}
    </div>
  );
}
