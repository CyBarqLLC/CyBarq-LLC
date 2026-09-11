import type * as React from "react";
import { CornerMarks } from "@/components/brand/elements";
import { cn } from "@/lib/utils/cn";

type StatementPanelProps = {
  statement: string;
  eyebrow?: string;
  body?: string;
  tone?: "blue" | "ice" | "graphite" | "lime";
  children?: React.ReactNode;
  className?: string;
};

const tones = {
  blue: "bg-blue text-graphite",
  ice: "bg-ice text-graphite",
  graphite: "bg-graphite text-white",
  lime: "bg-lime-tint text-graphite",
};

/**
 * One flat field of colour carrying a single statement, marked with the four
 * corner blades. The only place a section is allowed a full colour ground.
 */
export function StatementPanel({ statement, eyebrow, body, tone = "blue", children, className }: StatementPanelProps) {
  return (
    <section className={cn("relative overflow-hidden", tones[tone], className)}>
      <CornerMarks inset="1.25rem" size={16} className={tone === "graphite" ? "text-white/80" : "text-graphite/80"} />
      <div className="container-page flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        {eyebrow ? <p className={cn("text-small", tone === "graphite" ? "text-white/70" : "text-graphite/70")}>{eyebrow}</p> : null}
        <p className="text-display max-w-4xl">{statement}</p>
        {body ? <p className={cn("max-w-2xl text-lg", tone === "graphite" ? "text-white/80" : "text-graphite/80")}>{body}</p> : null}
        {children}
      </div>
    </section>
  );
}
