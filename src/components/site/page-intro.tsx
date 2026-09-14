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
  /** Rendered under the lead: buttons, links, etc. */
  children?: React.ReactNode;
  /** Rendered at the end of the row on large screens (a pictogram, a marker). */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The opening of an inner public page: a hairline carrying the breadcrumb,
 * then the title with nothing above it. The copy rises into place on load.
 */
export function PageIntro({ title, lead, meta, crumbs, crumbsLabel, children, aside, className }: PageIntroProps) {
  const hasRule = crumbs && crumbs.length > 0;
  return (
    <header className={cn("container-page pt-8 pb-12 sm:pt-10 sm:pb-16", className)}>
      {hasRule ? (
        <div className="s-meta mb-10 border-t border-(--s-hair) pt-3.5 sm:mb-14">
          <Breadcrumbs items={crumbs ?? []} label={crumbsLabel} />
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
