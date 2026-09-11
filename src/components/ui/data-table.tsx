import * as React from "react";
import { Link } from "@/i18n/navigation";
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
  /** Figures: end aligned with tabular numerals. */
  numeric?: boolean;
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /**
   * Whole row click target, rendered as an overlay link on cards and rows.
   * Locale-less path (`/app/projects/123`): the i18n `Link` adds the locale.
   */
  rowHref?: (row: T) => string | undefined;
  caption?: string;
  className?: string;
};

function cellClasses<T>(c: Column<T>): string {
  return cn((c.align === "end" || c.numeric) && "text-end", c.numeric && "tabular-nums", c.className);
}

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
  const openLabel = typeof primary?.header === "string" ? primary.header : (caption ?? "");
  return (
    <div className={cn("w-full", className)}>
      {/* Cards (mobile) */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const href = rowHref?.(row);
          return (
            <li key={rowKey(row)} className={cn("relative border border-fog bg-white p-4 transition-colors", href && "hover:border-grey")}>
              {primary ? <div className="mb-2 pe-6 text-body font-medium text-graphite">{primary.cell(row)}</div> : null}
              <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-1.5 text-small">
                {columns
                  .filter((c) => c !== primary && !c.hideOnCard)
                  .map((c) => (
                    <React.Fragment key={c.key}>
                      <dt className="text-slate">{c.header}</dt>
                      <dd className={cn("min-w-0 break-words", c.numeric && "tabular-nums")}>{c.cell(row)}</dd>
                    </React.Fragment>
                  ))}
              </dl>
              {href ? (
                <Link href={href} className="absolute inset-0" aria-label={openLabel}>
                  <span className="sr-only">{openLabel}</span>
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
      {/* Table (tablet and desktop) */}
      <div className="hidden border border-fog bg-white md:block">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={cellClasses(c)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <TableRow key={rowKey(row)} className={cn(href && "relative cursor-pointer")}>
                  {columns.map((c, i) => (
                    <TableCell key={c.key} className={cellClasses(c)}>
                      {href && i === 0 ? (
                        <Link href={href} className="after:absolute after:inset-0 after:content-['']">{c.cell(row)}</Link>
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
