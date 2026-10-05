import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  title: string;
  lead?: string;
  as?: "h2" | "h3";
  /** Visual size of the title. */
  size?: "h1" | "h2";
  id?: string;
  /** Rendered at the end of the row on large screens (a link, a count). */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * How a section opens: the title at the start and, where there is one, the
 * lead or a link at the end of the same row. Nothing sits above the title.
 */
export function SectionHeading({ title, lead, as: Tag = "h2", size = "h1", id, aside, className, children }: SectionHeadingProps) {
  const split = Boolean(lead || aside);
  return (
    <Reveal stagger className={cn("s-head", className)} data-split={split ? "" : undefined}>
      <Tag id={id} className={cn(size === "h1" ? "s-title" : "s-sub", "max-w-3xl")}>
        {title}
      </Tag>
      {split ? (
        <div className={cn(!lead && "s-head__end")}>
          {lead ? <p className="s-lede s-head__lead">{lead}</p> : null}
          {aside ? <div className={cn(lead && "s-head__aside")}>{aside}</div> : null}
        </div>
      ) : null}
      {children}
    </Reveal>
  );
}
