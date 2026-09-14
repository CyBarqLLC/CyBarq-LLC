"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";

export type GlobeLabelSlot = {
  /** Where the label is anchored on the sphere, in degrees from the start side. */
  angle: number;
  items: { title: string; href: string }[];
};

type GlobeLabelsProps = {
  slots: GlobeLabelSlot[];
  /** How long each name holds before the next one takes its place, in ms. */
  interval?: number;
};

/**
 * Names of the work, rising off the globe.
 *
 * Three anchors sit on the sphere and each one holds a service name at the end
 * of a hairline. Every few seconds the name lets go and the next one takes its
 * place, so the globe keeps saying what the company does without anything
 * having to be clicked. Pointing at a name holds it, and following it opens
 * that service. With reduced motion the three names simply stay.
 */
export function GlobeLabels({ slots, interval = 4200 }: GlobeLabelsProps) {
  const [step, setStep] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [still, setStill] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  React.useEffect(() => {
    if (still || held) return;
    const id = window.setInterval(() => setStep((s) => s + 1), interval);
    return () => window.clearInterval(id);
  }, [still, held, interval]);

  return (
    <div className="s-globe-labels" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      {slots.map((slot, i) => {
        const item = slot.items[(step + i) % slot.items.length];
        if (!item) return null;
        const radians = (slot.angle * Math.PI) / 180;
        /* Two anchor rings: a tighter one on a phone, where the sphere fills
           the screen and a card has nowhere to go. */
        const ring = (r: number) => ({ x: 50 + r * Math.cos(radians), y: 50 - r * Math.sin(radians) });
        const wide = ring(26);
        const narrow = ring(17);
        const outward = Math.cos(radians) >= 0;
        return (
          <div
            key={slot.angle}
            className="s-globe-label"
            data-side={outward ? "end" : "start"}
            style={
              {
                "--s-label-x": `${wide.x}%`,
                "--s-label-y": `${wide.y}%`,
                "--s-label-x-narrow": `${narrow.x}%`,
                "--s-label-y-narrow": `${narrow.y}%`,
              } as React.CSSProperties
            }
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
          >
            <span aria-hidden className="s-globe-label__anchor" />
            <span aria-hidden className="s-globe-label__rule" />
            <Link key={item.href} href={item.href} className="s-globe-label__text">
              {item.title}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
