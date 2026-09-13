import type * as React from "react";
import { getTranslations } from "next-intl/server";
import { otherLocale, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { Draw, Settle } from "./reveal";

/**
 * Returns a translator for the language the visitor is *not* reading in, so a
 * sheet can carry its own label in both languages the way the brand book does.
 */
export async function mirror(locale: Locale, namespace: string) {
  return getTranslations({ locale: otherLocale(locale), namespace });
}

type SheetProps = {
  /** Section number, printed as it appears in the brand book: 01, 02, 03. */
  index: number;
  /** The label in the language being read. */
  label: string;
  /** The same label in the other language, set at the end of the rule. */
  mirrorLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * How every section of the public site opens: a hairline across the measure,
 * the section number and its label at the start, and the same label in the
 * other language at the end. No eyebrow phrases, no decoration — the rule and
 * the number carry the hierarchy, exactly as the guidelines set a sheet.
 */
export function Sheet({ index, label, mirrorLabel, className, children }: SheetProps) {
  return (
    <Settle className={cn("s-sheet s-meta", className)}>
      <span aria-hidden className="s-sheet__index">
        {String(index).padStart(2, "0")}
      </span>
      <span className="s-sheet__label">{label}</span>
      {mirrorLabel ? (
        <span aria-hidden className="s-sheet__mirror hidden sm:inline">
          {mirrorLabel}
        </span>
      ) : null}
      {children}
    </Settle>
  );
}

/**
 * A hairline that draws itself from the start side when it comes into view.
 * The brand's rule is always 1px Fog, never dashed or dotted.
 */
export function Rule({ className }: { className?: string }) {
  return <Draw className={cn("h-px w-full bg-(--s-hair)", className)} />;
}
