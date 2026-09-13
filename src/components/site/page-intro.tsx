import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type PageIntroProps = {
  title: string;
  lead?: string;
  /** A short line under the lead (a date, a note). */
  meta?: string;
  crumbs?: Crumb[];
  crumbsLabel?: string;
  /** The section label printed at the end of the opening rule, in the other language. */
  mirrorLabel?: string;
  /** Rendered under the lead: buttons, links, etc. */
  children?: React.ReactNode;
  /** Rendered at the end of the row on large screens (a pictogram, a marker). */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The opening of an inner public page, set like a sheet of the brand book: a
 * rule carrying the breadcrumb at the start and the page's own label in the
 * other language at the end, then the title at display size with nothing above
 * it. The copy rises into place on load.
 */
export function PageIntro({ title, lead, meta, crumbs, crumbsLabel, mirrorLabel, children, aside, className }: PageIntroProps) {
  const hasRule = (crumbs && crumbs.length > 0) || mirrorLabel;
  return (
    <header className={cn("container-page pt-8 pb-12 sm:pt-10 sm:pb-16", className)}>
      {hasRule ? (
        <div className="s-meta mb-10 flex items-baseline justify-between gap-6 border-t border-(--s-hair) pt-3.5 sm:mb-14">
          {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} label={crumbsLabel} /> : <span />}
          {mirrorLabel ? (
            <span aria-hidden className="hidden shrink-0 text-grey sm:inline">
              {mirrorLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="site-enter max-w-4xl">
          <h1 className="s-display">{title}</h1>
          {lead ? <p className="s-lede mt-6 max-w-2xl">{lead}</p> : null}
          {meta ? <p className="s-meta mt-5 text-slate">{meta}</p> : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
        {aside ? <div className="shrink-0 text-graphite">{aside}</div> : null}
      </div>
    </header>
  );
}
