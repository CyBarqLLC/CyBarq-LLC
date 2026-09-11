import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  title: string;
  lead?: string;
  as?: "h2" | "h3";
  /** Visual size of the title; h2 titles use the h1 size unless told otherwise. */
  size?: "h1" | "h2";
  id?: string;
  align?: "start" | "center";
  /** Rendered at the end of the row on large screens (a link, controls). */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Public site section heading: a light title, an optional lead, nothing above
 * the title. Moves in softly when it comes into view.
 */
export function SectionHeading({ title, lead, as: Tag = "h2", size, id, align = "start", aside, className, children }: SectionHeadingProps) {
  const sizeClass = (size ?? (Tag === "h2" ? "h1" : "h2")) === "h1" ? "text-h1" : "text-h2";
  return (
    <Reveal className={cn("mb-10 sm:mb-14", aside && "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12", className)}>
      <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center")}>
        <Tag id={id} className={cn(sizeClass, "max-w-3xl")}>
          {title}
        </Tag>
        {lead ? <p className="max-w-2xl text-lg text-slate">{lead}</p> : null}
        {children}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </Reveal>
  );
}
