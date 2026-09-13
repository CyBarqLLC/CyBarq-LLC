"use client";

import * as React from "react";
import { usePathname } from "@/i18n/navigation";

type SiteHeaderShellProps = {
  /** Bar content (logo, primary navigation, actions), rendered on the server. */
  children: React.ReactNode;
  /** Menu sheet content, rendered on the server. */
  menu: React.ReactNode;
  /** Accessible name of the menu button (its state is carried by aria-expanded). */
  menuLabel: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Matches the `lg` breakpoint, where the full navigation replaces the menu button. */
const DESKTOP = "(min-width: 64rem)";

/**
 * The only client part of the public header. It watches a 1px sentinel with an
 * IntersectionObserver (no scroll handler) to condense the bar once the page
 * has moved, and it runs the menu disclosure: aria-expanded and aria-controls,
 * focus moved into the sheet and kept inside the header while it is open,
 * Escape and outside clicks close it, and the page does not scroll behind it.
 *
 * The bar is flush with the page and square, as the identity is: it sits on a
 * hairline rather than floating as a rounded pill, and the hairline under it
 * reports how far down the page the visitor has read. Styling lives in
 * styles/site.css.
 */
export function SiteHeaderShell({ children, menu, menuLabel }: SiteHeaderShellProps) {
  const [floating, setFloating] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();

  // Close the menu whenever the route changes (including back and forward).
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setFloating(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const header = headerRef.current;
    const panel = panelRef.current;
    const root = document.documentElement;

    // Lock page scroll; keep the scrollbar gutter so nothing shifts sideways.
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.getPropertyValue("scrollbar-gutter");
    root.style.overflow = "hidden";
    root.style.setProperty("scrollbar-gutter", "stable");

    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const closeAndReturnFocus = () => {
      setOpen(false);
      toggleRef.current?.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndReturnFocus();
        return;
      }
      if (event.key !== "Tab" || !header) return;
      const items = Array.from(header.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !header.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !header.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    // Anything outside the header closes the menu.
    const onPointerDown = (event: PointerEvent) => {
      if (header && event.target instanceof Node && !header.contains(event.target)) closeAndReturnFocus();
    };

    // Following a link inside the sheet closes it, even when the link points to the current page.
    const onPanelClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a[href]")) setOpen(false);
    };

    const desktop = window.matchMedia(DESKTOP);
    const onBreakpoint = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    panel?.addEventListener("click", onPanelClick);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      root.style.overflow = previousOverflow;
      if (previousGutter) root.style.setProperty("scrollbar-gutter", previousGutter);
      else root.style.removeProperty("scrollbar-gutter");
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      panel?.removeEventListener("click", onPanelClick);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="site-header" data-floating={floating || open ? "" : undefined} data-open={open ? "" : undefined}>
        <span aria-hidden className="site-header__ground" />
        <span aria-hidden className="site-header__progress" />
        <div className="site-header__bar container-page">
          <div className="site-header__row">
            {children}
            <button
              ref={toggleRef}
              type="button"
              className="site-menu-toggle touch lg:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={menuLabel}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden className="site-menu-toggle__lines" />
            </button>
          </div>
        </div>
        <div ref={panelRef} id={panelId} className="site-menu lg:hidden" hidden={!open}>
          {menu}
        </div>
      </header>
      <div aria-hidden className="site-header-spacer">
        <div ref={sentinelRef} className="site-header-sentinel" />
      </div>
    </>
  );
}
