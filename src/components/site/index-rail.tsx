"use client";

import * as React from "react";

export type RailItem = { id: string; label: string };

type IndexRailProps = {
  items: RailItem[];
  /** Accessible name of the rail (it is a second, supplementary navigation). */
  label: string;
};

/**
 * The contents column of the brand book, made live: a numbered index of the
 * page pinned to the start margin, with a hairline tick that reaches full
 * length for the section being read. It appears only on screens wide enough to
 * carry it outside the measure, and only once the opening has been passed —
 * a page should never greet anyone with its own table of contents.
 *
 * It is supplementary: every section it lists is reachable by scrolling and by
 * the main navigation, so nothing is lost when it is not shown.
 */
export function IndexRail({ items, label }: IndexRailProps) {
  const [active, setActive] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // The section whose top has most recently crossed the upper third is the
    // one being read; scrolling back up hands it to the previous one.
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight * 0.34;
        let current: string | null = null;
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= line) current = section.id;
        }
        setActive(current);
        setVisible(current !== null);
      },
      { rootMargin: "-34% 0px -66% 0px", threshold: [0, 1] },
    );
    for (const section of sections) observer.observe(section);

    // One pass on mount so a restored scroll position is reflected at once.
    const line = window.innerHeight * 0.34;
    let current: string | null = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    }
    setActive(current);
    setVisible(current !== null);

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="s-rail" data-visible={visible ? "" : undefined} inert={!visible}>
      {items.map((item, i) => (
        <a key={item.id} href={`#${item.id}`} className="s-rail__item s-meta" data-active={active === item.id ? "" : undefined}>
          <span aria-hidden className="s-rail__tick" />
          <span aria-hidden className="s-rail__num">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="s-rail__label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
