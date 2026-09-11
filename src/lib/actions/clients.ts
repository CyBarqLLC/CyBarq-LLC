"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { audit } from "@/lib/audit";
import { publicEnv } from "@/lib/env";
import { uuid } from "@/lib/validation/common";
import { clientSchema, contactSchema, inviteClientUserSchema, type ClientInput } from "@/lib/validation/clients";

function revalidateClient(_clientId?: string) {
  revalidatePath("/[locale]/(platform)/app/clients", "page");
  revalidatePath("/[locale]/(platform)/app/clients/[id]", "layout");
}

function toRow(input: ClientInput) {
  const n = (v: string | undefined) => (v === undefined || v === "" ? null : v);
  return {
    name_en: input.name_en,
    name_ar: n(input.name_ar),
    legal_name: n(input.legal_name),
    country: n(input.country),
    city: n(input.city),
    address: n(input.address),
    tax_number: n(input.tax_number),
    website: n(input.website),
    primary_contact_name: n(input.primary_contact_name),
    primary_contact_email: n(input.primary_contact_email),
    phone: n(input.phone),
    status: input.status,
    notes: n(input.notes),
  };
}

export async function createClientRecord(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const viewer = await requirePermission("clients.write", "action");
    const input = clientSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").insert({ ...toRow(input), created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    revalidateClient();
    return ok({ id: data.id });
  });
}

export async function updateClientRecord(clientId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const input = clientSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").update(toRow(input)).eq("id", id).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Not found.", "NOT_FOUND");
    revalidateClient(id);
    return ok({ id });
  });
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function createContact(clientId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const input = contactSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_contacts")
      .insert({ client_id: id, name: input.name, email: input.email ?? null, phone: input.phone ?? null, title: input.title ?? null })
      .select("id")
      .single();
    if (error) throw error;
    revalidateClient(id);
    return ok({ id: data.id });
  });
}

export async function updateContact(clientId: string, contactId: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const cid = uuid.parse(contactId);
    const input = contactSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { error } = await supabase
      .from("client_contacts")
      .update({ name: input.name, email: input.email ?? null, phone: input.phone ?? null, title: input.title ?? null })
      .eq("id", cid)
      .eq("client_id", id);
    if (error) throw error;
    revalidateClient(id);
    return ok({ id: cid });
  });
}

export async function deleteContact(clientId: string, contactId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const cid = uuid.parse(contactId);
    const supabase = await createClient();
    const { error } = await supabase.from("client_contacts").delete().eq("id", cid).eq("client_id", id);
    if (error) throw error;
    revalidateClient(id);
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Portal users
// ---------------------------------------------------------------------------

/**
 * Invites a client user by email (Supabase Auth invite), then links the
 * account to the client and grants the `client` role. If the address is
 * already registered as a client account, it is linked instead of re-invited.
 */
export async function inviteClientUser(clientId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const input = inviteClientUserSchema.parse(Object.fromEntries(formData));
    const locale = await getLocale();
    const supabase = await createClient();
    const { data: client } = await supabase.from("clients").select("id").eq("id", id).maybeSingle();
    if (!client) return fail("Not found.", "NOT_FOUND");

    const admin = createAdminClient();
    let userId: string | null = null;
    let linkedExisting = false;

    const invite = await admin.auth.admin.inviteUserByEmail(input.email, {
      data: { full_name: input.full_name, full_name_ar: input.full_name_ar ?? null, kind: "client", locale },
      redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}/reset-password`,
    });

    if (invite.error) {
      const inviteError = invite.error;
      const alreadyRegistered = inviteError.code === "email_exists" || /already/i.test(inviteError.message);
      if (!alreadyRegistered) return fail("The invitation could not be sent. Check the email address and try again.", "VALIDATION");
      const { data: profile } = await admin.from("profiles").select("id, kind").eq("email", input.email).maybeSingle();
      if (!profile) return fail("This email is already registered but has no profile. Contact an administrator.", "CONFLICT");
      if (profile.kind !== "client") return fail("This email belongs to an employee account and cannot be used for the client portal.", "CONFLICT");
      userId = profile.id;
      linkedExisting = true;
    } else {
      userId = invite.data.user.id;
    }

    const { error: linkError } = await admin.from("client_users").upsert({ user_id: userId, client_id: id, is_active: true }, { onConflict: "user_id,client_id" });
    if (linkError) throw linkError;
    const { error: roleError } = await admin.from("user_roles").upsert({ user_id: userId, role_key: "client" }, { onConflict: "user_id,role_key", ignoreDuplicates: true });
    if (roleError) throw roleError;

    await audit("client_user.invited", "client_user", userId, { client_id: id, email: input.email, linked_existing: linkedExisting }, id);
    revalidateClient(id);
    return ok(undefined);
  });
}

export async function setClientUserActive(clientId: string, userId: string, active: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const uid = uuid.parse(userId);
    const supabase = await createClient();
    const { data, error } = await supabase.from("client_users").update({ is_active: active === true }).eq("client_id", id).eq("user_id", uid).select("user_id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Not found.", "NOT_FOUND");
    await audit(active ? "client_user.reactivated" : "client_user.deactivated", "client_user", uid, { client_id: id }, id);
    revalidateClient(id);
    return ok(undefined);
  });
}
