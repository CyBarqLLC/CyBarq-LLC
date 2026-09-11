import * as React from "react";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

/** Internal platform page header: eyebrow, title, description and actions. */
export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 text-small text-slate">{eyebrow}</div> : null}
        <h1 className="text-h1 break-words">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-slate">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </header>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "start" | "center";
  as?: "h2" | "h3";
  className?: string;
  children?: React.ReactNode;
};

/** Public website section header. Calm, light weight, generous whitespace. */
export function SectionHeader({ title, description, eyebrow, align = "start", as: Tag = "h2", className, children }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col gap-3 sm:mb-14", align === "center" && "items-center text-center", className)}>
      {eyebrow ? <span className="text-small text-slate">{eyebrow}</span> : null}
      <Tag className={cn(Tag === "h2" ? "text-h1" : "text-h2", "max-w-3xl")}>{title}</Tag>
      {description ? <p className="max-w-2xl text-slate text-lg">{description}</p> : null}
      {children}
    </div>
  );
}
