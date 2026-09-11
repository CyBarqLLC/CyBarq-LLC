import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/env";
import { renderEmail, sendMail, type MailResult } from "@/lib/email/resend";
import type { Locale } from "@/i18n/routing";

export type AccountKind = "employee" | "client";

export type ProvisionInput = {
  email: string;
  fullName: string;
  fullNameAr?: string | null;
  kind: AccountKind;
  locale: Locale;
};

export type ProvisionResult =
  | { status: "created"; userId: string }
  | { status: "exists"; userId: string; kind: AccountKind; confirmed: boolean };

/**
 * Creates a platform account. The account kind is written to app_metadata,
 * which only the service role can set, so the database trigger creates the
 * profile with the right kind from the first moment. Nobody can choose their
 * own kind by signing up (public sign up is disabled as well).
 * Callers must have checked the actor's permission first.
 */
export async function provisionAccount(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await admin.from("profiles").select("id, kind").eq("email", email).maybeSingle();
  if (existing) {
    const { data: authUser } = await admin.auth.admin.getUserById(existing.id);
    return { status: "exists", userId: existing.id, kind: existing.kind, confirmed: Boolean(authUser.user?.email_confirmed_at) };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { full_name: input.fullName, full_name_ar: input.fullNameAr ?? null, locale: input.locale },
    app_metadata: { kind: input.kind },
  });
  if (error || !data.user) {
    throw new ProvisioningError(error?.code === "email_exists" ? "exists" : "failed", error?.message);
  }
  return { status: "created", userId: data.user.id };
}

export class ProvisioningError extends Error {
  constructor(
    readonly reason: "exists" | "failed" | "link",
    detail?: string,
  ) {
    super(detail ?? reason);
  }
}

type LinkType = "invite" | "recovery";

/**
 * Generates a one time sign in token for the account and returns the URL of
 * the page where the person sets their password. The token is verified only
 * when the person submits that page, so link scanners that open URLs in
 * advance cannot use it up.
 */
async function accountLink(email: string, type: LinkType, locale: Locale): Promise<string> {
  const admin = createAdminClient();
  const attempt = (t: LinkType) =>
    t === "invite" ? admin.auth.admin.generateLink({ type: "invite", email }) : admin.auth.admin.generateLink({ type: "recovery", email });
  let { data, error } = await attempt(type);
  // An account that already confirmed its email cannot receive an invitation: fall back to a password link.
  if ((error || !data.properties?.hashed_token) && type === "invite") {
    ({ data, error } = await attempt("recovery"));
    type = "recovery";
  }
  const token = data.properties?.hashed_token;
  if (error || !token) throw new ProvisioningError("link", error?.message);
  const page = type === "invite" ? "welcome" : "reset-password";
  return `${siteUrl()}/${locale}/${page}?token=${encodeURIComponent(token)}&type=${type}`;
}

const COPY = {
  invite: {
    en: {
      subject: "Your CyBarq account is ready",
      title: "Welcome to CyBarq",
      body: (name: string, kind: AccountKind) => [
        name ? `Hello ${name},` : "Hello,",
        kind === "client"
          ? "An account has been created for you on the CyBarq client portal. From there you can follow your projects, download documents and invoices, and reach our team."
          : "An account has been created for you on the CyBarq platform.",
        "Choose a password to activate it.",
      ],
      action: "Set your password",
      note: "For your security this link works once and expires after a short time. If it has expired, ask your CyBarq contact to send a new invitation.",
    },
    ar: {
      subject: "حسابك لدى سايبرق جاهز",
      title: "أهلاً بك في سايبرق",
      body: (name: string, kind: AccountKind) => [
        name ? `مرحباً ${name}،` : "مرحباً،",
        kind === "client"
          ? "أنشأنا لكم حساباً على بوابة عملاء سايبرق، حيث يمكنكم متابعة مشاريعكم وتنزيل المستندات والفواتير والتواصل مع فريقنا."
          : "أنشأنا لك حساباً على منصة سايبرق.",
        "اختر كلمة مرور لتفعيل الحساب.",
      ],
      action: "تعيين كلمة المرور",
      note: "حرصاً على أمان حسابك، يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته بعد مدة قصيرة. إن انتهت صلاحيته فاطلب دعوة جديدة من جهة الاتصال لدى سايبرق.",
    },
  },
  recovery: {
    en: {
      subject: "Reset your CyBarq password",
      title: "Reset your password",
      body: (name: string, _kind: AccountKind) => [name ? `Hello ${name},` : "Hello,", "We received a request to set a new password for your CyBarq account."],
      action: "Choose a new password",
      note: "This link works once and expires soon. If you did not ask for it, you can ignore this email and your password stays the same.",
    },
    ar: {
      subject: "إعادة تعيين كلمة المرور في سايبرق",
      title: "إعادة تعيين كلمة المرور",
      body: (name: string, _kind: AccountKind) => [name ? `مرحباً ${name}،` : "مرحباً،", "تلقّينا طلباً لتعيين كلمة مرور جديدة لحسابك في سايبرق."],
      action: "اختيار كلمة مرور جديدة",
      note: "يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته قريباً. إن لم تطلب ذلك فتجاهل هذه الرسالة وستبقى كلمة مرورك كما هي.",
    },
  },
} as const;

/** Sends the invitation (or a password link for accounts that already exist). */
export async function sendAccountEmail(opts: { email: string; name: string; kind: AccountKind; locale: Locale; type: LinkType }): Promise<MailResult> {
  const url = await accountLink(opts.email, opts.type, opts.locale);
  const isInvite = url.includes("/welcome?");
  const copy = isInvite ? COPY.invite[opts.locale] : COPY.recovery[opts.locale];
  const { html, text } = renderEmail({
    locale: opts.locale,
    title: copy.title,
    paragraphs: [...copy.body(opts.name, opts.kind)],
    action: { label: copy.action, url },
    note: copy.note,
  });
  return sendMail({ to: opts.email, subject: copy.subject, html, text });
}
