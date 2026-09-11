import type { Permission } from "@/lib/auth/permissions";

export type NavEntry = {
  key: string;
  href: string;
  /** Message key under platform.nav */
  labelKey: string;
  icon: "home" | "tasks" | "clients" | "projects" | "security" | "content" | "finance" | "certificates" | "employees" | "users" | "audit" | "settings" | "bell";
  /** Shown when the viewer holds any of these; empty = every employee. */
  anyOf?: Permission[];
};

export const PLATFORM_NAV: { section: string; items: NavEntry[] }[] = [
  {
    section: "work",
    items: [
      { key: "dashboard", href: "/app", labelKey: "dashboard", icon: "home" },
      { key: "tasks", href: "/app/tasks", labelKey: "tasks", icon: "tasks" },
      { key: "projects", href: "/app/projects", labelKey: "projects", icon: "projects" },
      { key: "clients", href: "/app/clients", labelKey: "clients", icon: "clients" },
      { key: "security", href: "/app/security", labelKey: "security", icon: "security" },
    ],
  },
  {
    section: "company",
    items: [
      { key: "content", href: "/app/content", labelKey: "content", icon: "content", anyOf: ["content.read", "content.write", "content.publish"] },
      { key: "finance", href: "/app/finance", labelKey: "finance", icon: "finance", anyOf: ["finance.read", "finance.write"] },
      { key: "certificates", href: "/app/certificates", labelKey: "certificates", icon: "certificates", anyOf: ["certificates.read", "certificates.issue"] },
      { key: "employees", href: "/app/employees", labelKey: "employees", icon: "employees" },
    ],
  },
  {
    section: "admin",
    items: [
      { key: "users", href: "/app/users", labelKey: "users", icon: "users", anyOf: ["users.manage"] },
      { key: "audit", href: "/app/audit", labelKey: "audit", icon: "audit", anyOf: ["audit.read"] },
      { key: "settings", href: "/app/settings", labelKey: "settings", icon: "settings" },
    ],
  },
];

export const PORTAL_NAV: { key: string; href: string; labelKey: string; icon: NavEntry["icon"] }[] = [
  { key: "overview", href: "/portal", labelKey: "overview", icon: "home" },
  { key: "projects", href: "/portal/projects", labelKey: "projects", icon: "projects" },
  { key: "documents", href: "/portal/documents", labelKey: "documents", icon: "content" },
  { key: "finance", href: "/portal/finance", labelKey: "finance", icon: "finance" },
  { key: "security", href: "/portal/security", labelKey: "security", icon: "security" },
  { key: "support", href: "/portal/support", labelKey: "support", icon: "bell" },
];
