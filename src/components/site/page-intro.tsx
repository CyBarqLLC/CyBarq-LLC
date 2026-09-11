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

/** Opening block of an inner public page: breadcrumbs, light weight title, lead. The copy settles in on load. */
export function PageIntro({ title, lead, meta, crumbs, crumbsLabel, children, aside, className }: PageIntroProps) {
  return (
    <header className={cn("container-page pt-10 pb-12 sm:pt-14 sm:pb-16", className)}>
      {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} label={crumbsLabel} className="mb-8" /> : null}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="site-enter max-w-3xl">
          <h1 className="text-display">{title}</h1>
          {lead ? <p className="mt-5 max-w-2xl text-lg text-slate">{lead}</p> : null}
          {meta ? <p className="mt-4 text-small text-slate">{meta}</p> : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
        {aside ? <div className="shrink-0 text-graphite">{aside}</div> : null}
      </div>
    </header>
  );
}
