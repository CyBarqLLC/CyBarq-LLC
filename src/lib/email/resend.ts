import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env.server";
import { siteUrl } from "@/lib/env";

type Mail = { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string; idempotencyKey?: string };

export type MailResult = { sent: true; id: string | null } | { sent: false; reason: "not_configured" | "provider_error" };

/**
 * Transactional email through Resend. When RESEND_API_KEY is absent (local
 * development) the message is logged instead of sent and the result says so,
 * so callers can tell the person that nothing went out.
 * An idempotency key makes a retried or double-submitted send deliver once.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    console.info("[mail:skipped]", mail.subject);
    return { sent: false, reason: "not_configured" };
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    {
      from: env.EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    },
    mail.idempotencyKey ? { idempotencyKey: mail.idempotencyKey } : undefined,
  );
  if (error) {
    console.error("[mail] failed", error.name, error.message);
    return { sent: false, reason: "provider_error" };
  }
  return { sent: true, id: data?.id ?? null };
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export type EmailContent = {
  locale: "en" | "ar";
  /** Plain text, escaped here. */
  title: string;
  /** Plain text paragraphs, escaped here. */
  paragraphs: string[];
  action?: { label: string; url: string };
  /** Plain text shown under the button (for example the link expiry). */
  note?: string;
  /** Pre-rendered, already escaped HTML blocks (tables, summaries). */
  extraHtml?: string;
};

const FOOTER = {
  en: "CyBarq Technology LLC · cybarq.com",
  ar: "سايبرق للتكنولوجيا · cybarq.com",
};
const AUTOMATED = {
  en: "This message was sent automatically. Replies to this address are not monitored.",
  ar: "أُرسلت هذه الرسالة تلقائياً، ولا تتم متابعة الردود على هذا العنوان.",
};

/**
 * Brand email: the official logo image (never typed text), a quiet layout that
 * renders in every mail client, and direction and language set per locale.
 */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const { locale } = content;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "right" : "left";
  const base = siteUrl();
  const logo = `${base}/brand/logo/email-logo.png`;
  const paragraphs = content.paragraphs.map((p) => `<p style="margin:0 0 16px 0">${escapeHtml(p)}</p>`).join("");
  const button = content.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0"><tr><td style="background:#0d0e13">
<a href="${escapeHtml(content.action.url)}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">${escapeHtml(content.action.label)}</a>
</td></tr></table>
<p style="margin:0 0 16px 0;font-size:13px;color:#5a616b;word-break:break-all">${escapeHtml(content.action.url)}</p>`
    : "";
  const note = content.note ? `<p style="margin:0 0 16px 0;font-size:13px;color:#5a616b">${escapeHtml(content.note)}</p>` : "";
  const html = `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(content.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f6;font-family:'Thmanyah Sans',-apple-system,'Segoe UI',Tahoma,Arial,sans-serif;color:#0d0e13;direction:${dir}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f6"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;text-align:${align}">
<tr><td style="padding:28px 32px 20px 32px;border-bottom:1px solid #e6e8ea"><img src="${logo}" width="116" height="28" alt="CyBarq" style="display:block;border:0;height:28px;width:auto"></td></tr>
<tr><td style="padding:28px 32px 4px 32px;font-size:22px;line-height:1.35;font-weight:600">${escapeHtml(content.title)}</td></tr>
<tr><td style="padding:12px 32px 12px 32px;font-size:15px;line-height:1.7">${paragraphs}${content.extraHtml ?? ""}${button}${note}</td></tr>
<tr><td style="padding:20px 32px 28px 32px;border-top:1px solid #e6e8ea;font-size:12px;line-height:1.6;color:#5a616b">${escapeHtml(FOOTER[locale])}<br>${escapeHtml(AUTOMATED[locale])}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [content.title, "", ...content.paragraphs, content.action ? `${content.action.label}: ${content.action.url}` : "", content.note ?? "", "", FOOTER[locale]]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
  return { html, text };
}
