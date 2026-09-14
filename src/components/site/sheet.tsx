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
  /** The label in the language being read. */
  label: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * How every section of the public site opens: a hairline across the measure
 * with one quiet label on it. Nothing is numbered and nothing is repeated in
 * the other language: the rule marks the change of subject, the label names
 * it, and the section itself does the rest.
 */
export function Sheet({ label, className, children }: SheetProps) {
  return (
    <Settle className={cn("s-sheet s-meta", className)}>
      <span className="s-sheet__label">{label}</span>
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
