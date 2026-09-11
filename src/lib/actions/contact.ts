"use server";

import { getLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, requestIp, hashIp } from "@/lib/rate-limit";
import { sendMail, mailLayout } from "@/lib/email/resend";
import { serverEnv } from "@/lib/env.server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { contactSchema, CONTACT_RATE_LIMIT, CONTACT_RATE_LIMITED } from "@/lib/validation/contact";
import { getServiceBySlug } from "@/content/services";
import { isLocale, type Locale } from "@/i18n/routing";

export type ContactResult = ActionResult<{ id: string }>;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/**
 * Public contact form. Anonymous: validated with Zod, rate limited per hashed
 * IP, honeypot checked, stored with the service role (anon has no insert
 * grant on contact_submissions) and forwarded to the contact inbox.
 */
export async function submitContact(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  return runAction(async () => {
    const input = contactSchema.parse(Object.fromEntries(formData));

    // Honeypot: pretend success so bots learn nothing.
    if (input.website) return ok({ id: "ignored" });

    const ip = await requestIp();
    const ipHash = hashIp(ip);
    const { allowed } = rateLimit({ key: `contact:${ipHash}`, ...CONTACT_RATE_LIMIT });
    if (!allowed) return fail(CONTACT_RATE_LIMITED, "ERROR");

    const requestLocale = await getLocale();
    const locale: Locale = input.locale ?? (isLocale(requestLocale) ? requestLocale : "en");
    const serviceTitle = input.service ? (getServiceBySlug(input.service)?.title.en ?? input.service) : null;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("contact_submissions")
      .insert({
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        country: input.country ?? null,
        service: input.service ?? null,
        message: input.message,
        locale,
        ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (error) throw error;

    const env = serverEnv();
    const rows: Array<[string, string | null]> = [
      ["Name", input.name],
      ["Email", input.email],
      ["Company", input.company ?? null],
      ["Country", input.country ?? null],
      ["Service", serviceTitle],
      ["Language", locale],
    ];
    const details = rows
      .filter((r): r is [string, string] => typeof r[1] === "string" && r[1] !== "")
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5a616b;white-space:nowrap">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
      .join("");
    const html = `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">${details}</table>
<p style="margin:20px 0 6px 0;color:#5a616b">Message</p>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
<p style="margin:20px 0 0 0;font-size:13px;color:#5a616b">Submission ${escapeHtml(data.id)}</p>`;
    const text = rows
      .filter((r): r is [string, string] => typeof r[1] === "string" && r[1] !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .concat(["", "Message:", input.message, "", `Submission ${data.id}`])
      .join("\n");

    await sendMail({
      to: env.CONTACT_INBOX,
      subject: `Contact form: ${input.name}${input.company ? ` (${input.company})` : ""}`,
      html: mailLayout("New contact message", html),
      text,
      replyTo: input.email,
    });

    return ok({ id: data.id });
  });
}
