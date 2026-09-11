"use client";

import * as React from "react";

type MarqueeFrameProps = {
  headingId: string;
  title: string;
  /** Visible button text, plus a screen reader suffix naming what moves ("logo animation"). */
  labels: { pause: string; play: string; subject: string };
  children: React.ReactNode;
};

/** "auto": moves, but pauses on hover and while focus is inside. "paused" and "playing" are the visitor's explicit choice. */
type Mode = "auto" | "paused" | "playing";

/**
 * Heading row and pause control for a logo marquee (WCAG 2.2.2). The motion
 * pauses on hover and while keyboard focus is inside; the button pauses it
 * for good, and pressing Play resumes it even while the button keeps focus.
 * The animation itself is pure CSS; this only sets data attributes. Hidden
 * when the visitor prefers reduced motion, since nothing moves then.
 */
export function MarqueeFrame({ headingId, title, labels, children }: MarqueeFrameProps) {
  const [mode, setMode] = React.useState<Mode>("auto");
  const paused = mode === "paused";
  return (
    <div className="site-marquee-root" data-paused={paused ? "" : undefined} data-playing={mode === "playing" ? "" : undefined}>
      <div className="mb-6 flex min-h-11 items-center justify-between gap-4">
        <h2 id={headingId} className="text-label text-slate">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setMode(paused ? "playing" : "paused")}
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
