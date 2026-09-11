import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { EmptyState } from "./states";
import { cn } from "@/lib/utils/cn";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Shown as the card title on small screens. One column should be primary. */
  primary?: boolean;
  /** Hide on the card layout (e.g. redundant actions). */
  hideOnCard?: boolean;
  className?: string;
  align?: "start" | "end";
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Whole row click target (rendered as an overlay link on cards and rows). */
  rowHref?: (row: T) => string | undefined;
  caption?: string;
  className?: string;
};

/**
 * Responsive data table. Full table from `md` up; stacked cards below so
 * internal screens stay usable on phones without horizontal scrolling.
 * Server component friendly: no client state, pagination is handled by the page.
 */
export function DataTable<T>({ rows, columns, rowKey, emptyTitle, emptyDescription, emptyAction, rowHref, caption, className }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  const primary = columns.find((c) => c.primary) ?? columns[0];
  return (
    <div className={cn("w-full", className)}>
      {/* Cards (mobile) */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const href = rowHref?.(row);
          return (
            <li key={rowKey(row)} className="relative border border-fog bg-white p-4">
              {primary ? <div className="text-body font-medium mb-2 pe-6">{primary.cell(row)}</div> : null}
              <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-1.5 text-small">
                {columns
                  .filter((c) => c !== primary && !c.hideOnCard)
                  .map((c) => (
                    <React.Fragment key={c.key}>
                      <dt className="text-slate">{c.header}</dt>
                      <dd className="min-w-0 break-words">{c.cell(row)}</dd>
                    </React.Fragment>
                  ))}
              </dl>
              {href ? <a href={href} className="absolute inset-0" aria-label={typeof primary?.header === "string" ? primary.header : "Open"}><span className="sr-only">Open</span></a> : null}
            </li>
          );
        })}
      </ul>
      {/* Table (tablet and desktop) */}
      <div className="hidden md:block border border-fog bg-white">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn(c.align === "end" && "text-end", c.className)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <TableRow key={rowKey(row)} className={cn(href && "relative")}>
                  {columns.map((c, i) => (
                    <TableCell key={c.key} className={cn(c.align === "end" && "text-end", c.className)}>
                      {href && i === 0 ? (
                        <a href={href} className="after:absolute after:inset-0 after:content-['']">{c.cell(row)}</a>
                      ) : (
                        c.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
