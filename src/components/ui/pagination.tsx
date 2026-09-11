import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
  labels: { previous: string; next: string; summary: (from: number, to: number, total: number) => string };
  className?: string;
};

export const DEFAULT_PAGE_SIZE = 25;

export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** Server rendered, link based pagination. Works without JavaScript and with RTL. */
export function Pagination({ page, pageSize, total, hrefFor, labels, className }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1 && total <= pageSize) return null;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = "touch inline-flex items-center gap-1 border border-fog px-3 text-small hover:bg-surface aria-disabled:pointer-events-none aria-disabled:opacity-40";
  return (
    <nav className={cn("mt-6 flex flex-wrap items-center justify-between gap-3", className)} aria-label="Pagination">
      <p className="text-small text-slate">{labels.summary(from, to, total)}</p>
      <div className="flex gap-2">
        <Link href={hrefFor(Math.max(1, page - 1))} aria-disabled={page <= 1} className={btn} rel="prev">
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden /> {labels.previous}
        </Link>
        <Link href={hrefFor(Math.min(pages, page + 1))} aria-disabled={page >= pages} className={btn} rel="next">
          {labels.next} <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
