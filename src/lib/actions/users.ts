"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { requirePermission, type Viewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { audit } from "@/lib/audit";
import { provisionAccount, sendAccountEmail, ProvisioningError } from "@/lib/auth/provisioning";
import { uuid, formToObject } from "@/lib/validation/common";
import { inviteEmployeeSchema, userRolesSchema, rolePermissionSchema } from "@/lib/validation/users";
import { isLocale, type Locale } from "@/i18n/routing";
import { actionError } from "@/lib/actions/messages";

function revalidateUsers() {
  revalidatePath("/[locale]/(platform)/app/users", "layout");
  revalidatePath("/[locale]/(platform)/app/employees", "layout");
}

/** Roles the viewer may hand out: every permission of the role must already be theirs. */
async function grantableRoles(viewer: Viewer): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("role_permissions").select("role_key, permission_key");
  const { data: roles } = await supabase.from("roles").select("key").neq("key", "client");
  const isSuper = viewer.roles.includes("super_admin");
  const perms = new Map<string, string[]>();
  for (const row of data ?? []) perms.set(row.role_key, [...(perms.get(row.role_key) ?? []), row.permission_key]);
  const out = new Set<string>();
  for (const r of roles ?? []) {
    if (r.key === "super_admin" && !isSuper) continue;
    if (isSuper || (perms.get(r.key) ?? []).every((p) => viewer.permissions.has(p))) out.add(r.key);
  }
  return out;
}

export type InviteResult = { userId: string; emailSent: boolean };

/**
 * Provisions an employee account and sends the invitation email.
 * The account is created with the service role (kind set server side), and the
 * roles are granted with the caller's own session so the database guards
 * (no escalation, super admin rules) apply to the caller, not to the server.
 */
export async function inviteEmployee(_prev: ActionResult<InviteResult> | null, formData: FormData): Promise<ActionResult<InviteResult>> {
  return runAction(async () => {
    const viewer = await requirePermission("users.manage", "action");
    const input = inviteEmployeeSchema.parse(formToObject(formData));
    const requested = String(formData.get("locale") ?? "");
    const locale: Locale = isLocale(requested) ? requested : ((await getLocale()) as Locale);
    const roles = input.roles.length > 0 ? input.roles : ["employee"];
    const allowed = await grantableRoles(viewer);
    if (roles.some((r) => !allowed.has(r))) return fail(await actionError("roleNotGrantable"), "FORBIDDEN");

    let userId: string;
    try {
      const account = await provisionAccount({ email: input.email, fullName: input.full_name, fullNameAr: input.full_name_ar, kind: "employee", locale });
      if (account.status === "exists") {
        return fail(await actionError(account.kind === "client" ? "emailIsClient" : "emailExists"), "CONFLICT");
      }
      userId = account.userId;
    } catch (error) {
      if (error instanceof ProvisioningError && error.reason === "exists") return fail(await actionError("emailExists"), "CONFLICT");
      throw error;
    }

    const supabase = await createClient();
    const { error: roleError } = await supabase.from("user_roles").insert(roles.map((role_key) => ({ user_id: userId, role_key })));
    if (roleError) throw roleError;

    let emailSent = false;
    try {
      const mail = await sendAccountEmail({ email: input.email, name: input.full_name, kind: "employee", locale, type: "invite" });
      emailSent = mail.sent;
    } catch (error) {
      console.error("[users] invitation email failed", error instanceof Error ? error.message : error);
    }
    await audit("user.invited", "user", userId, { roles, email_sent: emailSent });
    revalidateUsers();
    return ok({ userId, emailSent });
  });
}

/** Sends a fresh invitation (or a password link if the person already activated the account). */
export async function resendInvitation(userId: string): Promise<ActionResult<{ emailSent: boolean }>> {
  return runAction(async () => {
    await requirePermission("users.manage", "action");
    const uid = uuid.parse(userId);
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("id, email, full_name, full_name_ar, kind, locale, is_active").eq("id", uid).maybeSingle();
    if (!profile) return fail(await actionError("notFound"), "NOT_FOUND");
    if (!profile.is_active) return fail(await actionError("accountInactive"), "CONFLICT");
    const locale: Locale = profile.locale === "ar" ? "ar" : "en";
    const name = (locale === "ar" ? profile.full_name_ar : null) || profile.full_name;
    const mail = await sendAccountEmail({ email: profile.email, name, kind: profile.kind, locale, type: "invite" });
    await audit("user.invitation_resent", "user", uid, { email_sent: mail.sent });
    if (!mail.sent) return fail(await actionError("emailNotSent"), "ERROR");
    return ok({ emailSent: true });
  });
}

/** Replaces the user's role set with the submitted checkbox values. */
export async function setUserRoles(userId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("users.manage", "action");
    const uid = uuid.parse(userId);
    const { roles } = userRolesSchema.parse(formToObject(formData));
    const supabase = await createClient();

    const { data: profile } = await supabase.from("profiles").select("id, kind").eq("id", uid).maybeSingle();
    if (!profile) return fail(await actionError("notFound"), "NOT_FOUND");
    if (profile.kind !== "employee") return fail(await actionError("clientRolesElsewhere"), "CONFLICT");
    if (uid === viewer.userId && !viewer.roles.includes("super_admin")) return fail(await actionError("ownRoles"), "FORBIDDEN");

    const { data: current, error: currentError } = await supabase.from("user_roles").select("role_key").eq("user_id", uid);
    if (currentError) throw currentError;
    const have = new Set<string>((current ?? []).map((r) => r.role_key));
    const want = new Set<string>(roles);
    const allowed = await grantableRoles(viewer);
    // Roles outside the viewer's reach are shown read only: keep them exactly as they are.
    for (const r of have) if (!allowed.has(r)) want.add(r);
    for (const r of want) if (!have.has(r) && !allowed.has(r)) return fail(await actionError("roleNotGrantable"), "FORBIDDEN");

    const toAdd: string[] = [...want].filter((r) => !have.has(r));
    const toRemove: string[] = [...have].filter((r) => !want.has(r));
    if (uid === viewer.userId && toRemove.includes("super_admin")) return fail(await actionError("ownSuperAdmin"), "CONFLICT");

    if (toRemove.length > 0) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).in("role_key", toRemove);
      if (error) throw error;
    }
    if (toAdd.length > 0) {
      const { error } = await supabase.from("user_roles").insert(toAdd.map((role_key) => ({ user_id: uid, role_key })));
      if (error) throw error;
    }
    if (toAdd.length > 0 || toRemove.length > 0) {
      await audit("user.roles_changed", "user", uid, { added: toAdd, removed: toRemove });
    }
    revalidateUsers();
    return ok(undefined);
  });
}

/**
 * Activates or deactivates an account. Deactivation is immediate everywhere:
 * the profile flag cuts off the platform and every database policy, and the
 * sign in account is suspended so existing sessions cannot be refreshed.
 */
export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("users.manage", "action");
    const uid = uuid.parse(userId);
    if (uid === viewer.userId && !active) return fail(await actionError("ownDeactivation"), "CONFLICT");
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").update({ is_active: active === true }).eq("id", uid).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("notFound"), "NOT_FOUND");
    const { error: banError } = await createAdminClient().auth.admin.updateUserById(uid, { ban_duration: active ? "none" : "876000h" });
    if (banError) {
      console.error("[users] sign in suspension failed", banError.message);
      return fail(await actionError("suspendFailed"), "ERROR");
    }
    revalidateUsers();
    return ok(undefined);
  });
}

/** Toggles one permission on a role (super admins only). The super_admin role is never editable. */
export async function setRolePermission(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("roles.manage", "action");
    if (!viewer.roles.includes("super_admin")) return fail(await actionError("forbidden"), "FORBIDDEN");
    const input = rolePermissionSchema.parse(Object.fromEntries(formData));
    if (input.role_key === "super_admin") return fail(await actionError("superAdminRoleFixed"), "CONFLICT");
    const supabase = await createClient();
    if (input.granted) {
      const { error } = await supabase.from("role_permissions").upsert({ role_key: input.role_key, permission_key: input.permission_key }, { onConflict: "role_key,permission_key", ignoreDuplicates: true });
      if (error) throw error;
    } else {
      const { error } = await supabase.from("role_permissions").delete().eq("role_key", input.role_key).eq("permission_key", input.permission_key);
      if (error) throw error;
    }
    revalidatePath("/[locale]/(platform)/app/users/roles", "page");
    return ok(undefined);
  });
}
