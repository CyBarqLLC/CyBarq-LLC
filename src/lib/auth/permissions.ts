/**
 * Permission keys. Mirrors supabase/migrations/20260911001100_seed_reference.sql.
 * Application code checks permissions, never role names.
 */
export const PERMISSIONS = [
  "users.manage",
  "roles.manage",
  "audit.read",
  "settings.manage",
  "clients.read",
  "clients.write",
  "projects.read_all",
  "projects.write",
  "tasks.write",
  "hr.read",
  "hr.write",
  "finance.read",
  "finance.write",
  "finance.issue",
  "security.read_all",
  "security.write",
  "security.report",
  "content.read",
  "content.write",
  "content.publish",
  "certificates.read",
  "certificates.issue",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_KEYS = [
  "super_admin",
  "admin",
  "finance",
  "hr",
  "project_manager",
  "security_team",
  "developer",
  "content_editor",
  "employee",
  "client",
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

/** Pure helper shared by server code and tests. */
export function hasPermission(granted: ReadonlySet<string> | readonly string[], permission: Permission): boolean {
  return granted instanceof Set ? granted.has(permission) : (granted as readonly string[]).includes(permission);
}

export function hasAnyPermission(granted: ReadonlySet<string>, permissions: readonly Permission[]): boolean {
  return permissions.some((p) => granted.has(p));
}
