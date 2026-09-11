import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type SectionCardProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Remove inner padding (tables and lists bring their own). */
  flush?: boolean;
};

/** Titled panel used for dashboard blocks and detail page sections. */
export function SectionCard({ title, description, actions, children, className, flush }: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <CardTitle className="text-h3 font-medium">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn(flush ? "p-0" : "p-4 sm:p-5")}>{children}</CardContent>
    </Card>
  );
}
