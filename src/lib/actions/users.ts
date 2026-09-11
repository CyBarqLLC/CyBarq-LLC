"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { audit } from "@/lib/audit";
import { publicEnv } from "@/lib/env";
import { uuid, formToObject } from "@/lib/validation/common";
import { inviteEmployeeSchema, userRolesSchema, rolePermissionSchema } from "@/lib/validation/users";

function revalidateUsers(_userId?: string) {
  revalidatePath("/[locale]/(platform)/app/users", "layout");
}

/**
 * Provisions an employee account: Supabase Auth invite (profile row is created
 * by the auth trigger), then role grants written with the caller's own client
 * so RLS and the super admin trigger apply to the caller, not the service role.
 */
export async function inviteEmployee(_prev: ActionResult<{ userId: string }> | null, formData: FormData): Promise<ActionResult<{ userId: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("users.manage", "action");
    const input = inviteEmployeeSchema.parse(formToObject(formData));
    const locale = await getLocale();
    const supabase = await createClient();

    if (input.roles.includes("super_admin") && !viewer.roles.includes("super_admin")) {
      return fail("Only a super admin can grant the super admin role.", "FORBIDDEN");
    }
    const { data: knownRoles } = await supabase.from("roles").select("key").neq("key", "client");
    const allowed = new Set<string>((knownRoles ?? []).map((r) => r.key));
    const unknown = input.roles.filter((r) => !allowed.has(r));
    if (unknown.length > 0) return fail("One of the selected roles does not exist.", "VALIDATION");

    const admin = createAdminClient();
    const invite = await admin.auth.admin.inviteUserByEmail(input.email, {
      data: { full_name: input.full_name, full_name_ar: input.full_name_ar ?? null, kind: "employee", locale },
      redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}/reset-password`,
    });
    if (invite.error) {
      const already = invite.error.code === "email_exists" || /already/i.test(invite.error.message);
      return fail(already ? "An account with this email already exists." : "The invitation could not be sent. Check the email address and try again.", already ? "CONFLICT" : "VALIDATION");
    }
    const userId = invite.data.user.id;

    // The profile row is created by the auth trigger; wait for it before granting roles.
    const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!profile) return fail("The account was created but its profile is not ready yet. Assign roles from the user page in a moment.", "ERROR");

    const roles = input.roles.length > 0 ? input.roles : ["employee"];
    const { error: roleError } = await supabase.from("user_roles").insert(roles.map((role_key) => ({ user_id: userId, role_key, granted_by: viewer.userId })));
    if (roleError) {
      if (roleError.code === "42501") return fail("The account was created but one of the roles could not be granted: only a super admin can grant super admin.", "FORBIDDEN");
      throw roleError;
    }

    await audit("user.invited", "user", userId, { email: input.email, roles });
    revalidateUsers(userId);
    return ok({ userId });
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
    if (!profile) return fail("Not found.", "NOT_FOUND");
    if (profile.kind !== "employee") return fail("Roles for client accounts are managed from the client page.", "CONFLICT");

    const { data: current, error: currentError } = await supabase.from("user_roles").select("role_key").eq("user_id", uid);
    if (currentError) throw currentError;
    const have = new Set<string>((current ?? []).map((r) => r.role_key));
    const want = new Set<string>(roles);
    const isSuper = viewer.roles.includes("super_admin");
    if (!isSuper) {
      // The super admin checkbox is disabled for non super admins: never grant it, and keep it if already held.
      if (want.has("super_admin") && !have.has("super_admin")) return fail("Only a super admin can change super admin membership.", "FORBIDDEN");
      if (have.has("super_admin")) want.add("super_admin");
    }
    const toAdd: string[] = [...want].filter((r) => !have.has(r));
    const toRemove: string[] = [...have].filter((r) => !want.has(r));
    if (uid === viewer.userId && toRemove.includes("super_admin")) {
      return fail("You cannot remove your own super admin role.", "CONFLICT");
    }

    if (toRemove.length > 0) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).in("role_key", toRemove);
      if (error) throw error;
    }
    if (toAdd.length > 0) {
      const { error } = await supabase.from("user_roles").insert(toAdd.map((role_key) => ({ user_id: uid, role_key, granted_by: viewer.userId })));
      if (error) throw error;
    }
    if (toAdd.length > 0 || toRemove.length > 0) {
      await audit("user.roles_changed", "user", uid, { added: toAdd, removed: toRemove });
    }
    revalidateUsers(uid);
    return ok(undefined);
  });
}

export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("users.manage", "action");
    const uid = uuid.parse(userId);
    if (uid === viewer.userId && !active) return fail("You cannot deactivate your own account.", "CONFLICT");
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").update({ is_active: active === true }).eq("id", uid).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Not found.", "NOT_FOUND");
    revalidateUsers(uid);
    revalidatePath("/[locale]/(platform)/app/employees", "layout");
    return ok(undefined);
  });
}

/** Toggles one permission on a role. The super_admin role is never editable. */
export async function setRolePermission(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("roles.manage", "action");
    const input = rolePermissionSchema.parse(Object.fromEntries(formData));
    if (input.role_key === "super_admin") return fail("The super admin role always holds every permission.", "CONFLICT");
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
