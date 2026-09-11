"use client";

import type * as React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Classes added when the link is the current page or one of its ancestors. */
  activeClassName?: string;
};

/**
 * Navigation link that marks itself as current: `aria-current="page"` on the
 * exact page, `aria-current="true"` on a section the current page belongs to.
 * The only client code in the navigation; the rest of the header is rendered
 * on the server.
 */
export function NavLink({ href, children, className, activeClassName = "text-azure" }: NavLinkProps) {
  const pathname = usePathname();
  const exact = pathname === href;
  const within = !exact && href !== "/" && pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={exact ? "page" : within ? "true" : undefined} className={cn(className, (exact || within) && activeClassName)}>
      {children}
    </Link>
  );
}
