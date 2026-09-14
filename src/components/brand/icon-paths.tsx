import type { ReactNode } from "react";

/**
 * The CyBarq interface icons.
 *
 * Drawn in the same language as the printed pictograms (one thin line, square
 * joins, no fills, no rounded corners) but on a 24 unit grid and at a stroke
 * that stays crisp at 18 to 20 pixels, which is where an interface icon lives.
 * They belong to the identity: nothing here is borrowed from a general icon
 * library.
 */
export const iconPaths = {
  /* ---- places ---------------------------------------------------------- */
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" />
    </>
  ),
  tasks: (
    <>
      <polyline points="3 6.5 5 8.5 9 4.5" />
      <line x1="12" y1="6.5" x2="21" y2="6.5" />
      <polyline points="3 16.5 5 18.5 9 14.5" />
      <line x1="12" y1="16.5" x2="21" y2="16.5" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3 21 7.5 12 12 3 7.5Z" />
      <polyline points="3 13.5 12 18 21 13.5" />
    </>
  ),
  clients: (
    <>
      <rect x="3.5" y="4" width="8" height="16.5" />
      <rect x="13.5" y="9.5" width="7" height="11" />
      <line x1="6" y1="8" x2="9" y2="8" />
      <line x1="6" y1="12.5" x2="9" y2="12.5" />
      <line x1="16" y1="14" x2="18" y2="14" />
    </>
  ),
  security: (
    <>
      <path d="M5.5 16.5c0-5.5 2.75-9.5 6.5-9.5s6.5 4 6.5 9.5" />
      <path d="M9 18.5c0-3.5 1.25-6 3-6s3 2.5 3 6" />
      <line x1="12" y1="15.5" x2="12" y2="20.5" />
    </>
  ),
  content: (
    <>
      <rect x="4.5" y="3" width="15" height="18" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </>
  ),
  finance: (
    <>
      <rect x="3" y="4.5" width="18" height="15" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="12" y1="9.5" x2="12" y2="19.5" />
    </>
  ),
  certificates: (
    <>
      <rect x="3" y="4" width="18" height="13" />
      <line x1="6.5" y1="9" x2="14" y2="9" />
      <rect x="13" y="13" width="5.5" height="5.5" />
    </>
  ),
  employees: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20.5a6 6 0 0 1 12 0" />
      <circle cx="17.5" cy="9.5" r="2.6" />
      <path d="M16 15.4A5.6 5.6 0 0 1 21.5 20.5" />
    </>
  ),
  users: (
    <>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.5 20.5a6.5 6.5 0 0 1 13 0" />
      <rect x="16.5" y="14" width="5" height="5" />
    </>
  ),
  audit: (
    <>
      <line x1="6" y1="3" x2="6" y2="21" />
      <circle cx="6" cy="7" r="1.5" />
      <circle cx="6" cy="13" r="1.5" />
      <circle cx="6" cy="19" r="1.5" />
      <line x1="10.5" y1="7" x2="21" y2="7" />
      <line x1="10.5" y1="13" x2="21" y2="13" />
      <line x1="10.5" y1="19" x2="18" y2="19" />
    </>
  ),
  settings: (
    <>
      <line x1="3" y1="7.5" x2="21" y2="7.5" />
      <rect x="7.5" y="5.5" width="4" height="4" />
      <line x1="3" y1="16.5" x2="21" y2="16.5" />
      <rect x="12.5" y="14.5" width="4" height="4" />
    </>
  ),
  documents: (
    <>
      <rect x="3.5" y="6" width="12.5" height="15" />
      <polyline points="7.5 6 7.5 3 20.5 3 20.5 18" />
    </>
  ),
  support: (
    <>
      <path d="M3.5 4h17v12h-9l-5 4v-4h-3z" />
    </>
  ),
  portal: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="20" />
    </>
  ),

  /* ---- actions --------------------------------------------------------- */
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.4" y1="15.4" x2="21" y2="21" />
    </>
  ),
  notifications: (
    <>
      <path d="M6.5 17.5V11a5.5 5.5 0 0 1 11 0v6.5" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" />
      <line x1="10" y1="20.5" x2="14" y2="20.5" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  signOut: (
    <>
      <path d="M12 3.5H4v17h8" />
      <line x1="20.5" y1="12" x2="9.5" y2="12" />
      <polyline points="16 7 20.5 12 16 17" />
    </>
  ),
  close: (
    <>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="16" x2="21" y2="16" />
    </>
  ),
  chevronDown: (
    <>
      <polyline points="6 9.5 12 15.5 18 9.5" />
    </>
  ),
  arrow: (
    <>
      <line x1="4" y1="12" x2="19.5" y2="12" />
      <polyline points="14 6.5 19.5 12 14 17.5" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type IconName = keyof typeof iconPaths;
export const iconNames = Object.keys(iconPaths) as IconName[];
