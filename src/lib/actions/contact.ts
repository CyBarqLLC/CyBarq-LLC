"use server";

import { getLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, requestIp, hashIp } from "@/lib/rate-limit";
import { sendMail, renderEmail, escapeHtml } from "@/lib/email/resend";
import { serverEnv } from "@/lib/env.server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { contactSchema, CONTACT_RATE_LIMIT, CONTACT_RATE_LIMITED } from "@/lib/validation/contact";
import { getServiceBySlug } from "@/content/services";
import { isLocale, type Locale } from "@/i18n/routing";

export type ContactResult = ActionResult<{ id: string }>;

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
    const { allowed } = await rateLimit({ key: `contact:${ipHash}`, ...CONTACT_RATE_LIMIT });
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
      .select("id, reference")
      .single();
    if (error) throw error;

    const env = serverEnv();
    const details: Array<[string, string | null]> = [
      ["Name", input.name],
      ["Email", input.email],
      ["Company", input.company ?? null],
      ["Country", input.country ?? null],
      ["Service", serviceTitle],
      ["Language", locale === "ar" ? "Arabic" : "English"],
      ["Reference", data.reference],
    ];
    const rows = details.filter((r): r is [string, string] => typeof r[1] === "string" && r[1] !== "");
    const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;margin:0 0 16px 0">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#5a616b;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
      .join("")}</table><p style="margin:0 0 6px 0;color:#5a616b">Message</p><p style="white-space:pre-wrap;margin:0 0 16px 0">${escapeHtml(input.message)}</p>`;
    const { html, text } = renderEmail({
      locale: "en",
      title: "New message from the website",
      paragraphs: [],
      extraHtml: table,
      note: "Reply to this email to answer the sender directly.",
    });
    await sendMail({
      to: env.CONTACT_INBOX,
      subject: `Website enquiry${data.reference ? ` ${data.reference}` : ""}: ${input.name}${input.company ? ` (${input.company})` : ""}`,
      html,
      text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${input.message}\n\n${text}`,
      replyTo: input.email,
      idempotencyKey: `contact/${data.id}`,
    });

    return ok({ id: data.id });
  });
}
