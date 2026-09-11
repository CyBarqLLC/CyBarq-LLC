"use client";

import * as React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useReveal } from "./reveal";

export type PracticePanel = {
  key: string;
  href: string;
  title: string;
  short: string;
  intro: string;
  /** Pictogram, rendered on the server. */
  icon: React.ReactNode;
};

type PracticePanelsProps = {
  panels: PracticePanel[];
  /** Label of the link inside the open panel ("Explore"). */
  linkLabel: string;
};

/**
 * The four practices as one system: large panels side by side on large
 * screens, where pointing at, focusing or pressing one opens it (details and
 * link) while the others quietly compress; a vertical accordion on phones.
 * One panel is always open. Keyboard: arrow keys move between panels (mirrored
 * in right to left), Home and End jump, Enter on the open panel follows its
 * link. Each header is a button with aria-expanded and aria-controls.
 */
export function PracticePanels({ panels, linkLabel }: PracticePanelsProps) {
  const [active, setActive] = React.useState(0);
  const router = useRouter();
  const baseId = React.useId();
  const buttons = React.useRef<Array<HTMLButtonElement | null>>([]);
  const reveal = useReveal();

  const focusPanel = (index: number) => {
    const count = panels.length;
    const next = (index + count) % count;
    setActive(next);
    buttons.current[next]?.focus();
  };

  const onButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Enter" && index === active) {
      event.preventDefault();
      router.push(panels[index]?.href ?? "/services");
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = rtl ? active - 1 : active + 1;
        break;
      case "ArrowLeft":
        next = rtl ? active + 1 : active - 1;
        break;
      case "ArrowDown":
        next = active + 1;
        break;
      case "ArrowUp":
        next = active - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = panels.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    focusPanel(next);
  };

  return (
    <ul ref={reveal} className="site-panels site-reveal-stagger" data-active={active}>
      {panels.map((panel, index) => {
        const open = index === active;
        const tabId = `${baseId}-tab-${index}`;
        const regionId = `${baseId}-panel-${index}`;
        return (
          <li
            key={panel.key}
            className="site-panel"
            data-active={open ? "" : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setActive(index);
            }}
            onFocus={() => setActive(index)}
          >
            <button
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              id={tabId}
              aria-expanded={open}
              aria-controls={regionId}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onButtonKeyDown(event, index)}
              className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-start focus-visible:-outline-offset-2 sm:gap-5 sm:px-8 sm:py-6 lg:min-h-64 lg:flex-col lg:items-start lg:gap-8 lg:px-8 lg:py-8 xl:px-10 xl:py-10"
            >
              <span className="hidden text-small tabular-nums text-slate lg:block" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="shrink-0 text-graphite">{panel.icon}</span>
              <span className="text-h3 lg:text-h2">{panel.title}</span>
            </button>
            <div id={regionId} role="region" aria-labelledby={tabId} className="site-panel__body">
              <div>
                <div className="flex flex-col gap-3 px-5 pb-7 sm:px-8 sm:pb-8 lg:max-w-md lg:px-8 lg:pb-10 xl:px-10">
                  <p className="text-graphite">{panel.short}</p>
                  <p className="text-slate">{panel.intro}</p>
                  <Link href={panel.href} className="site-link mt-3 self-start text-azure">
                    {linkLabel}
                  </Link>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
