import type * as React from "react";
import { Link } from "@/i18n/navigation";

/** An arrow that follows the reading direction (mirrored in right to left by the stylesheet). */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden focusable="false" className={["s-arrow", className].filter(Boolean).join(" ")}>
      <path d="M0 6h16M11 1l5 5-5 5" />
    </svg>
  );
}

type ActionProps = {
  href: string;
  children: React.ReactNode;
  /** solid: Graphite on white. bright: Lime, for night and coloured fields. line: an outline in the ink of its ground. */
  variant?: "solid" | "bright" | "line";
  size?: "md" | "sm";
  arrow?: boolean;
  /** Layout classes only. The look is fixed by the variant. */
  className?: string;
};

/**
 * The public site's button. One shape, three variants, and an arrow on the
 * actions that lead somewhere. Internal paths go through the locale aware
 * Link; mailto and absolute URLs render a plain anchor.
 */
export function Action({ href, children, variant = "solid", size = "md", arrow = false, className }: ActionProps) {
  const props = { className: ["s-btn", className].filter(Boolean).join(" "), "data-variant": variant, "data-size": size };
  const content = (
    <>
      <span>{children}</span>
      {arrow ? <Arrow /> : null}
    </>
  );
  if (/^(mailto:|tel:|https?:)/.test(href)) {
    return (
      <a href={href} {...props}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {content}
    </Link>
  );
}
