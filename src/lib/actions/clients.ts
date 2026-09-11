"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionAccount, sendAccountEmail } from "@/lib/auth/provisioning";
import { isLocale, type Locale } from "@/i18n/routing";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { actionError } from "@/lib/actions/messages";
import { audit } from "@/lib/audit";
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
    if (!data || data.length === 0) return fail(await actionError("notFound"), "NOT_FOUND");
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
 * Gives a client contact access to the portal: creates a client account (or
 * links an existing client account), links it to the client, grants the
 * client role and sends the invitation email.
 */
export async function inviteClientUser(clientId: string, _prev: ActionResult<{ emailSent: boolean }> | null, formData: FormData): Promise<ActionResult<{ emailSent: boolean }>> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const input = inviteClientUserSchema.parse(Object.fromEntries(formData));
    const requested = String(formData.get("locale") ?? "");
    const locale: Locale = isLocale(requested) ? requested : ((await getLocale()) as Locale);
    const supabase = await createClient();
    const { data: client } = await supabase.from("clients").select("id").eq("id", id).maybeSingle();
    if (!client) return fail(await actionError("notFound"), "NOT_FOUND");

    const account = await provisionAccount({ email: input.email, fullName: input.full_name, fullNameAr: input.full_name_ar, kind: "client", locale });
    if (account.status === "exists" && account.kind !== "client") return fail(await actionError("emailIsEmployee"), "CONFLICT");
    const userId = account.userId;
    const linkedExisting = account.status === "exists";

    // Linking and the client role are service writes: the client account cannot be granted roles by staff sessions.
    const admin = createAdminClient();
    const { error: linkError } = await admin.from("client_users").upsert({ user_id: userId, client_id: id, is_active: true }, { onConflict: "user_id,client_id" });
    if (linkError) throw linkError;
    const { error: roleError } = await admin.from("user_roles").upsert({ user_id: userId, role_key: "client" }, { onConflict: "user_id,role_key", ignoreDuplicates: true });
    if (roleError) throw roleError;

    let emailSent = false;
    if (!linkedExisting || (account.status === "exists" && !account.confirmed)) {
      try {
        const mail = await sendAccountEmail({ email: input.email, name: input.full_name, kind: "client", locale, type: "invite" });
        emailSent = mail.sent;
      } catch (error) {
        console.error("[clients] invitation email failed", error instanceof Error ? error.message : error);
      }
    }
    await audit("client_user.invited", "client_user", userId, { client_id: id, linked_existing: linkedExisting, email_sent: emailSent }, id);
    revalidateClient(id);
    return ok({ emailSent });
  });
}

/** Sends a new invitation to a portal user who has not activated their account yet. */
export async function resendClientInvitation(clientId: string, userId: string): Promise<ActionResult<{ emailSent: boolean }>> {
  return runAction(async () => {
    await requirePermission("clients.write", "action");
    const id = uuid.parse(clientId);
    const uid = uuid.parse(userId);
    const supabase = await createClient();
    const { data: link } = await supabase.from("client_users").select("user_id, profile:profiles(email, full_name, full_name_ar, locale, is_active)").eq("client_id", id).eq("user_id", uid).maybeSingle();
    const profile = link?.profile;
    if (!profile) return fail(await actionError("notFound"), "NOT_FOUND");
    if (!profile.is_active) return fail(await actionError("accountInactive"), "CONFLICT");
    const locale: Locale = profile.locale === "ar" ? "ar" : "en";
    const name = (locale === "ar" ? profile.full_name_ar : null) || profile.full_name;
    const mail = await sendAccountEmail({ email: profile.email, name, kind: "client", locale, type: "invite" });
    await audit("client_user.invitation_resent", "client_user", uid, { client_id: id, email_sent: mail.sent }, id);
    if (!mail.sent) return fail(await actionError("emailNotSent"), "ERROR");
    return ok({ emailSent: true });
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
    if (!data || data.length === 0) return fail(await actionError("notFound"), "NOT_FOUND");
    await audit(active ? "client_user.reactivated" : "client_user.deactivated", "client_user", uid, { client_id: id }, id);
    revalidateClient(id);
    return ok(undefined);
  });
}
