"use client";

import * as React from "react";
import { useReveal } from "./reveal";

export type NarrativeStep = {
  key: string;
  title: string;
  body: string;
  /** Pictogram, rendered on the server. */
  icon: React.ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "How we work" as a pinned narrative. On large screens the start column
 * stays put and shows the title of the active principle large, while the
 * steps scroll past in the end column; the step crossing the middle of the
 * viewport is the active one (IntersectionObserver over a 10% band around
 * the centre) and the others are dimmed. On phones it is a plain stacked
 * list. The pinned column repeats the titles, so it is hidden from
 * assistive technology.
 */
export function PrinciplesNarrative({ steps }: { steps: NarrativeStep[] }) {
  const [active, setActive] = React.useState(0);
  const items = React.useRef<Array<HTMLLIElement | null>>([]);
  const reveal = useReveal();

  React.useEffect(() => {
    const elements = items.current.filter((element): element is HTMLLIElement => element !== null);
    if (elements.length === 0) return;
    const indexOf = new Map<Element, number>(elements.map((element, index): [Element, number] => [element, index]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = indexOf.get(entry.target);
          if (index !== undefined) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div className="hidden lg:block" aria-hidden>
        <div className="sticky top-[calc(var(--site-header-offset)+3rem)]">
          <p className="s-meta text-slate">
            {pad(active + 1)} / {pad(steps.length)}
          </p>
          <div className="mt-6 grid">
            {steps.map((step, index) => (
              <p key={step.key} className="site-steps__title s-title" data-active={index === active ? "" : undefined}>
                {step.title}
              </p>
            ))}
          </div>
        </div>
      </div>
      <ol ref={reveal} className="site-reveal flex flex-col">
        {steps.map((step, index) => (
          <li
            key={step.key}
            ref={(element) => {
              items.current[index] = element;
            }}
            className="site-step border-t border-fog py-10 sm:py-14 lg:py-24"
            data-active={index === active ? "" : undefined}
          >
            <article className="flex gap-5 sm:gap-7">
              <span className="shrink-0 text-graphite">{step.icon}</span>
              <div className="min-w-0">
                <h3 className="s-sub">{step.title}</h3>
                <p className="s-lede mt-4 max-w-prose">{step.body}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
