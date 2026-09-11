"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { type ActionResult, ok, fail, runAction } from "./result";
import { publicEnv } from "@/lib/env";

const signInSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  next: z.string().optional(),
});

/** Only allow same site relative redirects after login. */
function safeNext(next: string | undefined, locale: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) return `/${locale}/app`;
  return next;
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let destination: string | null = null;
  const t = await getTranslations("auth.errors");
  const result = await runAction<undefined>(async () => {
    const ip = await requestIp();
    if (!rateLimit({ key: `signin:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 }).allowed) {
      return fail(t("tooMany"));
    }
    const parsed = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") ?? undefined,
    });
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.email, password: parsed.password });
    if (error || !data.user) return fail(t("invalid"), "VALIDATION");
    const locale = await getLocale();
    // Send each account kind to its home. Clients cannot reach /app (layout enforces).
    const { data: profile } = await supabase.from("profiles").select("kind, is_active").eq("id", data.user.id).maybeSingle();
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      return fail(t("inactive"), "FORBIDDEN");
    }
    const home = profile.kind === "client" ? `/${locale}/portal` : `/${locale}/app`;
    const target = parsed.next ? safeNext(parsed.next, locale) : home;
    destination = profile.kind === "client" && target.includes("/app") ? home : target;
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

export async function requestPasswordReset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const t = await getTranslations("auth.errors");
  return runAction(async () => {
    const ip = await requestIp();
    if (!rateLimit({ key: `reset:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 }).allowed) {
      return fail(t("tooMany"));
    }
    const { email } = forgotSchema.parse({ email: formData.get("email") });
    const supabase = await createClient();
    const locale = await getLocale();
    // Always report success to avoid account enumeration.
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}/reset-password` });
    return ok(undefined);
  });
}

const passwordSchema = z
  .object({ password: z.string().min(12).max(200), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function updatePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { password } = passwordSchema.parse({ password: formData.get("password"), confirm: formData.get("confirm") });
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return fail(error.message, "VALIDATION");
    return ok(undefined);
  });
}
