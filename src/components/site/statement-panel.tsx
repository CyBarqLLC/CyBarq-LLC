import type * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

type StatementPanelProps = {
  statement: string;
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
 * One flat field of colour carrying a single statement, on the inner pages.
 * No decorative marks here: the two stretched corner blades belong to the
 * home page statement band (StatementBand) and nowhere else.
 */
export function StatementPanel({ statement, body, tone = "blue", children, className }: StatementPanelProps) {
  const dark = tone === "graphite";
  return (
    <section className={cn("relative overflow-hidden", tones[tone], className)}>
      <Reveal className="container-page flex flex-col items-center gap-6 py-24 text-center sm:py-32">
        <p className="s-display max-w-4xl">{statement}</p>
        {body ? <p className={cn("max-w-2xl text-lg", dark ? "text-white/80" : "text-graphite/80")}>{body}</p> : null}
        {children}
      </Reveal>
    </section>
  );
}
