import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env.server";

type Mail = { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string };

/**
 * Transactional email through Resend. When RESEND_API_KEY is absent (local
 * development, preview) the message is logged instead of sent, so flows never
 * break on a missing provider.
 */
export async function sendMail(mail: Mail): Promise<{ sent: boolean }> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    console.info("[mail:skipped]", mail.subject, "->", mail.to);
    return { sent: false };
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo,
  });
  if (error) {
    console.error("[mail] failed", error);
    return { sent: false };
  }
  return { sent: true };
}

/** Minimal, brand consistent HTML wrapper for notifications. */
export function mailLayout(title: string, body: string, locale: "en" | "ar" = "en"): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  return `<!doctype html><html lang="${locale}" dir="${dir}"><body style="margin:0;background:#ffffff;font-family:'Thmanyah Sans',system-ui,Tahoma,sans-serif;color:#0d0e13">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px"><tr><td style="padding:0 0 24px 0;font-size:18px;font-weight:500">CyBarq</td></tr>
<tr><td style="border-top:1px solid #dadcdf;padding:24px 0 8px 0;font-size:22px;font-weight:300">${title}</td></tr>
<tr><td style="padding:8px 0 24px 0;font-size:16px;line-height:1.6;color:#0d0e13">${body}</td></tr>
<tr><td style="border-top:1px solid #dadcdf;padding:16px 0 0 0;font-size:13px;color:#5a616b">CyBarq Technology LLC, Amman. Technology, done properly.</td></tr>
</table></td></tr></table></body></html>`;
}
