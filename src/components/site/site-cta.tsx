import type * as React from "react";
import { Link } from "@/i18n/navigation";

type SiteCtaProps = {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  /** Layout classes only (display, width, margins). The look is fixed. */
  className?: string;
};

const look =
  "items-center justify-center whitespace-nowrap bg-graphite font-medium text-white select-none transition-colors duration-(--duration-state) ease-(--ease-brand) hover:bg-graphite/85 active:bg-slate";
const sizes = { sm: "h-9 px-4 text-small", md: "h-11 px-5 text-body" } as const;

/**
 * The header call to action: graphite fill, white text, square corners, a
 * quiet hover. Kept in the site layer so the shared Button stays unchanged.
 * Class names are joined without tailwind-merge on purpose: `cn()` reads the
 * custom `text-small` and `text-body` sizes as text colours and would drop
 * `text-white`. Pass the display utility (for example `inline-flex`) in
 * `className`.
 */
export function SiteCta({ href, children, size = "sm", className }: SiteCtaProps) {
  return (
    <Link href={href} className={[look, sizes[size], className].filter(Boolean).join(" ")}>
      {children}
    </Link>
  );
}
