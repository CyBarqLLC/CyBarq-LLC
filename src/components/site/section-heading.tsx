import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Rise, Settle } from "./reveal";

type SectionHeadingProps = {
  title: string;
  lead?: string;
  as?: "h2" | "h3";
  /** Visual size of the title; h2 titles take the section title size unless told otherwise. */
  size?: "h1" | "h2";
  id?: string;
  align?: "start" | "center";
  /** Rendered at the end of the row on large screens (a link, controls). */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Public site section heading. The title rises from behind its own baseline;
 * nothing sits above it. A sheet rule with the section number belongs before
 * this block, never inside it.
 */
export function SectionHeading({ title, lead, as: Tag = "h2", size, id, align = "start", aside, className, children }: SectionHeadingProps) {
  const sizeClass = (size ?? (Tag === "h2" ? "h1" : "h2")) === "h1" ? "s-title" : "s-sub";
  return (
    <div className={cn("mb-10 sm:mb-14", aside && "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12", className)}>
      <Rise stagger className={cn("flex flex-col gap-5", align === "center" && "items-center text-center")}>
        <Tag id={id} className={cn(sizeClass, "max-w-3xl")}>
          {title}
        </Tag>
        {lead ? <p className="s-lede max-w-2xl">{lead}</p> : null}
        {children}
      </Rise>
      {aside ? <Settle className="shrink-0">{aside}</Settle> : null}
    </div>
  );
}
