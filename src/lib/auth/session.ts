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
  unreadNotifications: number;
  can: (permission: Permission) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
};

type ViewerContext = {
  profile: Tables<"profiles">;
  roles: string[];
  permissions: string[];
  client_ids: string[];
  unread_notifications: number;
};

function isViewerContext(value: unknown): value is ViewerContext {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.profile === "object" && v.profile !== null && Array.isArray(v.roles) && Array.isArray(v.permissions) && Array.isArray(v.client_ids);
}

/**
 * Loads the signed in user, their profile, permissions and client membership.
 * The session JWT is verified locally (asymmetric signing keys), and everything
 * else arrives in a single database round trip. Cached per request so layouts,
 * pages and actions share one lookup.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return null;

  const { data, error } = await supabase.rpc("viewer_context");
  if (error) {
    console.error("[viewer] context failed", error.code, error.message);
    return null;
  }
  if (!isViewerContext(data)) return null;
  const { profile } = data;
  if (!profile.is_active) return null;

  const permissions = new Set<string>(data.permissions);
  return {
    userId,
    email: profile.email,
    profile,
    permissions,
    roles: data.roles,
    clientIds: data.client_ids,
    isEmployee: profile.kind === "employee",
    isClient: profile.kind === "client",
    unreadNotifications: Number(data.unread_notifications ?? 0),
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
