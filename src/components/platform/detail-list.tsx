import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type DetailItem = { label: string; value: React.ReactNode; wide?: boolean };

/** Label and value pairs for detail pages. Empty values render as a quiet placeholder. */
export function DetailList({ items, columns = 2, className, empty = "-" }: { items: DetailItem[]; columns?: 1 | 2 | 3; className?: string; empty?: string }) {
  const cols = columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <dl className={cn("grid grid-cols-1 gap-x-8 gap-y-4", cols, className)}>
      {items.map((item) => {
        const isEmpty = item.value === null || item.value === undefined || item.value === "";
        return (
          <div key={item.label} className={cn("min-w-0", item.wide && "sm:col-span-full")}>
            <dt className="text-label text-slate">{item.label}</dt>
            <dd className={cn("mt-1 break-words text-body", isEmpty && "text-slate")}>{isEmpty ? empty : item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
