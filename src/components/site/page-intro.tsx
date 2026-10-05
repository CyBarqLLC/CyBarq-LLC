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
  /** Rendered at the end of the row on large screens (a pictogram). */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The opening of an inner public page: a band of the night ground carrying
 * the breadcrumb, the title and one lead. The same ground as the home page
 * hero, so every page of the site opens the same way.
 */
export function PageIntro({ title, lead, meta, crumbs, crumbsLabel, children, aside, className }: PageIntroProps) {
  return (
    <header className={cn("s-intro s-night", className)}>
      <div className="container-page">
        {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} label={crumbsLabel} /> : null}
        <div className="s-intro__row">
          <div className="site-enter max-w-4xl">
            <h1 className="s-display">{title}</h1>
            {lead ? <p className="s-lede mt-6 max-w-2xl">{lead}</p> : null}
            {meta ? <p className="s-meta s-soft mt-6">{meta}</p> : null}
            {children ? <div className="mt-9">{children}</div> : null}
          </div>
          {aside ? <div className="shrink-0 text-blue">{aside}</div> : null}
        </div>
      </div>
    </header>
  );
}
