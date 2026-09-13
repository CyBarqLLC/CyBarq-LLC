import type * as React from "react";
import { Link } from "@/i18n/navigation";
import { FieldFrame } from "./frame";
import { Settle } from "./reveal";

export type Specimen = {
  key: string;
  href: string;
  title: string;
  short: string;
  icon: React.ReactNode;
};

type SpecimenGridProps = {
  items: Specimen[];
  /** The call to action printed at the foot of every specimen. */
  linkLabel: string;
};

/**
 * The four practices, set as four specimens on a hairline grid rather than an
 * accordion. Each carries its number, its pictogram and the blades of the
 * symbol opened to its corners; pointing at one turns the ground to Ice, the
 * rule to Graphite and the blades to CyBarq Blue. Everything is readable at
 * once: nothing has to be opened to be read, and nothing moves that the
 * visitor did not ask to move.
 */
export function SpecimenGrid({ items, linkLabel }: SpecimenGridProps) {
  return (
    <Settle as="ul" stagger className="s-specimens">
      {items.map((item, i) => (
        <li key={item.key} className="s-specimen">
          <FieldFrame inset="0.75rem" />
          <Link href={item.href} className="s-specimen__link focus-visible:-outline-offset-2">
            <div className="flex items-start justify-between gap-4">
              <span aria-hidden className="s-meta text-slate">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="s-specimen__mark text-graphite">{item.icon}</span>
            </div>

            {/* The title box holds two lines whether it needs them or not, so
                the rule under it sits on the same line across all four. */}
            <div className="mt-auto flex flex-col gap-4 pt-8 sm:pt-12">
              <h3 className="s-sub flex items-end sm:min-h-[2.5em]">{item.title}</h3>
              <span aria-hidden className="s-specimen__rule" />
              <p className="text-small text-slate">{item.short}</p>
              <span className="s-meta mt-1 flex items-center gap-2 text-graphite">
                {linkLabel}
                <span aria-hidden className="inline-block rtl:-scale-x-100">
                  →
                </span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </Settle>
  );
}
