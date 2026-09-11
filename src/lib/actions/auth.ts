"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { sendAccountEmail } from "@/lib/auth/provisioning";
import { safeInternalPath } from "@/lib/safe-redirect";
import { isLocale, type Locale } from "@/i18n/routing";
import { type ActionResult, ok, fail, runAction } from "./result";

const signInSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(500).optional(),
});

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let destination: string | null = null;
  const t = await getTranslations("auth.errors");
  const result = await runAction<undefined>(async () => {
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") ?? undefined,
    });
    if (!parsed.success) return fail(t("invalid"), "VALIDATION");
    const ip = await requestIp();
    const [byIp, byAccount] = await Promise.all([
      rateLimit({ key: `signin:ip:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 }),
      rateLimit({ key: `signin:email:${parsed.data.email.toLowerCase()}`, limit: 8, windowMs: 10 * 60 * 1000 }),
    ]);
    if (!byIp.allowed || !byAccount.allowed) return fail(t("tooMany"));

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (error || !data.user) return fail(t("invalid"), "VALIDATION");
    const locale = await getLocale();
    // Send each account kind to its home. Clients cannot reach /app (layout enforces).
    const { data: profile } = await supabase.from("profiles").select("kind, is_active").eq("id", data.user.id).maybeSingle();
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      return fail(t("inactive"), "FORBIDDEN");
    }
    const home = profile.kind === "client" ? `/${locale}/portal` : `/${locale}/app`;
    const allowedArea = profile.kind === "client" ? "portal" : "app";
    destination = safeInternalPath(parsed.data.next, { fallback: home, areas: [allowedArea] });
    return ok(undefined);
  });
  // redirect() throws a control flow error, so it must run outside runAction's try/catch.
  if (result.ok && destination) redirect(destination);
  return result;
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect(`/${locale}/login`);
}

const forgotSchema = z.object({ email: z.string().trim().email().max(200) });

/**
 * Sends a password link through our own email (Resend), not the auth
 * provider's mailer. Always answers the same way whether or not the account
 * exists, so the form cannot be used to discover accounts.
 */
export async function requestPasswordReset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const t = await getTranslations("auth.errors");
  return runAction(async () => {
    const parsed = forgotSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) return fail(t("emailInvalid"), "VALIDATION");
    const email = parsed.data.email.toLowerCase();
    const ip = await requestIp();
    const [byIp, byAccount] = await Promise.all([
      rateLimit({ key: `reset:ip:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 }),
      rateLimit({ key: `reset:email:${email}`, limit: 3, windowMs: 60 * 60 * 1000 }),
    ]);
    if (!byIp.allowed) return fail(t("tooMany"));
    if (!byAccount.allowed) return ok(undefined);

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("full_name, full_name_ar, kind, locale, is_active").eq("email", email).maybeSingle();
    if (profile?.is_active) {
      const locale: Locale = profile.locale === "ar" ? "ar" : "en";
      const name = (locale === "ar" ? profile.full_name_ar : null) || profile.full_name || "";
      try {
        await sendAccountEmail({ email, name, kind: profile.kind, locale, type: "recovery" });
      } catch (error) {
        console.error("[auth] reset link failed", error instanceof Error ? error.message : error);
      }
    }
    return ok(undefined);
  });
}

const passwordSchema = z
  .object({ password: z.string().min(12).max(200), confirm: z.string().max(200) })
  .refine((v) => v.password === v.confirm, { path: ["confirm"] });

const tokenSchema = z.object({
  token: z.string().trim().min(16).max(200),
  type: z.enum(["invite", "recovery"]),
});

function passwordErrors(error: z.ZodError, t: (key: string) => string): ActionResult<never> {
  const fields = error.flatten().fieldErrors;
  const fieldErrors: Record<string, string[]> = {};
  if (fields.password) fieldErrors.password = [t("passwordTooShort")];
  if (fields.confirm) fieldErrors.confirm = [t("passwordMismatch")];
  return { ok: false, error: t("checkFields"), fieldErrors, code: "VALIDATION" };
}

/**
 * Finishes an invitation or a password reset: verifies the one time token
 * from the email, signs the person in and sets their password in one step.
 */
export async function completeAccountSetup(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const t = await getTranslations("auth.errors");
  let destination: string | null = null;
  const result = await runAction<undefined>(async () => {
    const link = tokenSchema.safeParse({ token: formData.get("token"), type: formData.get("type") });
    if (!link.success) return fail(t("linkInvalid"), "VALIDATION");
    const pw = passwordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
    if (!pw.success) return passwordErrors(pw.error, t);

    const ip = await requestIp();
    if (!(await rateLimit({ key: `setup:ip:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 })).allowed) return fail(t("tooMany"));

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type: link.data.type, token_hash: link.data.token });
    if (error || !data.user) return fail(t("linkInvalid"), "VALIDATION");
    const { error: pwError } = await supabase.auth.updateUser({ password: pw.data.password });
    if (pwError) {
      return fail(pwError.code === "same_password" ? t("passwordSame") : pwError.code === "weak_password" ? t("passwordWeak") : t("generic"), "VALIDATION");
    }
    const { data: profile } = await supabase.from("profiles").select("kind, is_active, locale").eq("id", data.user.id).maybeSingle();
    if (!profile?.is_active) {
      await supabase.auth.signOut();
      return fail(t("inactive"), "FORBIDDEN");
    }
    const requested = String(formData.get("locale") ?? "");
    const locale = isLocale(requested) ? requested : profile.locale;
    destination = profile.kind === "client" ? `/${locale}/portal` : `/${locale}/app`;
    return ok(undefined);
  });
  if (result.ok && destination) redirect(destination);
  return result;
}

/** Changes the password of the signed in person. */
export async function updatePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const t = await getTranslations("auth.errors");
  return runAction(async () => {
    const pw = passwordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
    if (!pw.success) return passwordErrors(pw.error, t);
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: pw.data.password });
    if (error) {
      return fail(error.code === "same_password" ? t("passwordSame") : error.code === "weak_password" ? t("passwordWeak") : t("generic"), "VALIDATION");
    }
    return ok(undefined);
  });
}
