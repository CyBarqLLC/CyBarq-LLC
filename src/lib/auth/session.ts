import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { type Permission, hasPermission, hasAnyPermission } from "./permissions";

export type Viewer = {
  userId: string;
  email: string;
  profile: Tables<"profiles">;
  permissions: ReadonlySet<string>;
  roles: string[];
  clientIds: string[];
  isEmployee: boolean;
  isClient: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
};

/**
 * Loads the signed in user, their profile, permissions and client membership.
 * Cached per request so layouts, pages and actions share one lookup.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: perms }, { data: roles }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.rpc("my_permissions"),
    supabase.from("user_roles").select("role_key").eq("user_id", user.id),
    supabase.from("client_users").select("client_id").eq("user_id", user.id).eq("is_active", true),
  ]);
  if (!profile || !profile.is_active) return null;

  const permissions = new Set<string>(perms ?? []);
  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    permissions,
    roles: (roles ?? []).map((r) => r.role_key),
    clientIds: (memberships ?? []).map((m) => m.client_id),
    isEmployee: profile.kind === "employee",
    isClient: profile.kind === "client",
    can: (permission) => hasPermission(permissions, permission),
    canAny: (list) => hasAnyPermission(permissions, list),
  };
});

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";
  constructor(message = "You do not have permission to do this.") {
    super(message);
  }
}

/** Redirects to login when anonymous. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return viewer;
}

/** Internal platform: employees only. Clients are sent to the portal. */
export async function requireEmployee(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isEmployee) {
    const locale = await getLocale();
    redirect(`/${locale}/portal`);
  }
  return viewer;
}

/** Client portal: client users only. Employees are sent to the platform. */
export async function requireClientUser(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isClient) {
    const locale = await getLocale();
    redirect(`/${locale}/app`);
  }
  return viewer;
}

/** Employees with a specific permission. Throws for server actions, redirects for pages. */
export async function requirePermission(permission: Permission, mode: "page" | "action" = "page"): Promise<Viewer> {
  const viewer = await requireEmployee();
  if (!viewer.can(permission)) {
    if (mode === "action") throw new AuthorizationError();
    const locale = await getLocale();
    redirect(`/${locale}/app/forbidden`);
  }
  return viewer;
}

export async function requireAnyPermission(permissions: readonly Permission[], mode: "page" | "action" = "page"): Promise<Viewer> {
  const viewer = await requireEmployee();
  if (!viewer.canAny(permissions)) {
    if (mode === "action") throw new AuthorizationError();
    const locale = await getLocale();
    redirect(`/${locale}/app/forbidden`);
  }
  return viewer;
}
