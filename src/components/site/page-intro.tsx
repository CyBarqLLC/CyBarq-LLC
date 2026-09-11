import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type PageIntroProps = {
  title: string;
  lead?: string;
  eyebrow?: string;
  crumbs?: Crumb[];
  crumbsLabel?: string;
  /** Rendered under the lead: buttons, meta, etc. */
  children?: React.ReactNode;
  /** Rendered at the end of the row on large screens (a pictogram, a marker). */
  aside?: React.ReactNode;
  className?: string;
};

/** Opening block of an inner public page: breadcrumbs, eyebrow, light weight title, lead. */
export function PageIntro({ title, lead, eyebrow, crumbs, crumbsLabel, children, aside, className }: PageIntroProps) {
  return (
    <header className={cn("container-page pt-10 pb-12 sm:pt-14 sm:pb-16", className)}>
      {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} label={crumbsLabel} className="mb-6" /> : null}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="mb-3 text-small text-slate">{eyebrow}</p> : null}
          <h1 className="text-display">{title}</h1>
          {lead ? <p className="mt-5 max-w-2xl text-lg text-slate">{lead}</p> : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
        {aside ? <div className="shrink-0 text-graphite">{aside}</div> : null}
      </div>
    </header>
  );
}
