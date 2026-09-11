import type * as React from "react";
import { StretchedCornerMarks } from "@/components/brand/stretched-corner-marks";
import { cn } from "@/lib/utils/cn";

type StatementPanelProps = {
  statement: string;
  eyebrow?: string;
  body?: string;
  tone?: "blue" | "ice" | "graphite" | "lime";
  /**
   * Draw the two stretched corner blades (top start and bottom end). These are
   * the only decorative marks on the public site: use them on the home page
   * promise panel and nowhere else.
   */
  marks?: boolean;
  children?: React.ReactNode;
  className?: string;
};

const tones = {
  blue: "bg-blue text-graphite",
  ice: "bg-ice text-graphite",
  graphite: "bg-graphite text-white",
  lime: "bg-lime-tint text-graphite",
};

/** One flat field of colour carrying a single statement. The only place a section is allowed a full colour ground. */
export function StatementPanel({ statement, eyebrow, body, tone = "blue", marks = false, children, className }: StatementPanelProps) {
  const dark = tone === "graphite";
  return (
    <section className={cn("relative overflow-hidden", tones[tone], className)}>
      {marks ? <StretchedCornerMarks inset="clamp(1.75rem, 4vw, 3rem)" className={dark ? "text-white/80" : "text-graphite/80"} /> : null}
      <div className="container-page flex flex-col items-center gap-6 py-24 text-center sm:py-32">
        {eyebrow ? <p className={`text-small ${dark ? "text-white/70" : "text-graphite/70"}`}>{eyebrow}</p> : null}
        <p className="text-display max-w-4xl">{statement}</p>
        {body ? <p className={cn("max-w-2xl text-lg", dark ? "text-white/80" : "text-graphite/80")}>{body}</p> : null}
        {children}
      </div>
    </section>
  );
}
