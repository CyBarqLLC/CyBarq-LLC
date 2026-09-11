import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Key / value list for detail pages. */
export function DetailList({ items, className }: { items: Array<{ label: string; value: React.ReactNode }>; className?: string }) {
  const rows = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (rows.length === 0) return null;
  return (
    <dl className={cn("grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2", className)}>
      {rows.map((i) => (
        <div key={i.label} className="flex flex-col gap-0.5">
          <dt className="text-label text-slate">{i.label}</dt>
          <dd className="text-body break-words">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Notice shown on locked (issued) documents. */
export function ImmutableNotice({ title, body }: { title: string; body: string }) {
  return (
    <div role="note" className="flex items-start gap-3 border border-fog bg-ice px-4 py-3 text-small text-graphite">
      <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-slate">{body}</p>
      </div>
    </div>
  );
}

export function KpiCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 border border-fog bg-white p-5">
      <span className="text-label text-slate">{label}</span>
      <span className="text-h2 tabular-nums">{value}</span>
      {hint ? <span className="text-small text-slate">{hint}</span> : null}
    </div>
  );
}

/** Section wrapper with a heading, used across detail pages. */
export function Section({ title, children, actions, className }: { title: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-h3">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
