"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { formToObject } from "@/lib/validation/common";
import { certificateSchema, issueCertificateSchema, revokeCertificateSchema, certificateIdSchema, type CertificateInput } from "@/lib/validation/certificates";
import { audit } from "@/lib/audit";
import { sendMail, mailLayout } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";
import { pick } from "@/i18n/bilingual";
import { CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";

type IdResult = ActionResult<{ id: string }>;
type Prev<T> = ActionResult<T> | null;

function revalidateCertificates() {
  revalidatePath("/[locale]/app/certificates", "layout");
}

function certificateRow(input: CertificateInput): Omit<TablesInsert<"certificates">, "created_by"> {
  return {
    type: input.type,
    language: input.language,
    recipient_name_en: input.recipient_name_en,
    recipient_name_ar: input.recipient_name_ar ?? null,
    recipient_email: input.recipient_email ?? null,
    recipient_user_id: input.recipient_user_id ?? null,
    title_en: input.title_en,
    title_ar: input.title_ar ?? null,
    description_en: input.description_en ?? null,
    description_ar: input.description_ar ?? null,
    program_name_en: input.program_name_en ?? null,
    program_name_ar: input.program_name_ar ?? null,
    role_title_en: input.role_title_en ?? null,
    role_title_ar: input.role_title_ar ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    hours: input.hours ?? null,
    signatory_name_en: input.signatory_name_en ?? null,
    signatory_name_ar: input.signatory_name_ar ?? null,
    signatory_title_en: input.signatory_title_en ?? null,
    signatory_title_ar: input.signatory_title_ar ?? null,
  };
}

async function loadCertificate(supabase: SupabaseServerClient, id: string): Promise<Tables<"certificates"> | null> {
  const { data, error } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function localePath(path: string): Promise<string> {
  const locale = await getLocale();
  return `/${locale}${path}`;
}

export async function createCertificate(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("certificates.issue", "action");
    const input = certificateSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("certificates").insert({ ...certificateRow(input), created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    revalidateCertificates();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/certificates/${result.data.id}`));
  return result;
}

export async function updateCertificate(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("certificates.issue", "action");
    const { id } = certificateIdSchema.parse({ id: formData.get("id") });
    const input = certificateSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const existing = await loadCertificate(supabase, id);
    if (!existing) return fail("Not found.", "NOT_FOUND");
    if (existing.status !== "draft") return fail("Issued certificates cannot be edited. Revoke it and issue a new one.", "CONFLICT");
    const { error } = await supabase.from("certificates").update(certificateRow(input)).eq("id", id).eq("status", "draft");
    if (error) throw error;
    revalidateCertificates();
    return ok({ id });
  });
}

export async function issueCertificate(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("certificates.issue", "action");
    const input = issueCertificateSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("issue_certificate", {
      _certificate_id: input.id,
      _expected_updated_at: input.expected_updated_at,
      _issue_date: input.issue_date,
    });
    if (error) throw error;
    revalidateCertificates();
    return ok({ id: data.id });
  });
}

export async function revokeCertificate(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("certificates.issue", "action");
    const input = revokeCertificateSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("revoke_certificate", { _certificate_id: input.id, _reason: input.reason });
    if (error) throw error;
    // The stored PDF predates the revocation stamp; drop it so the next download re-renders.
    await supabase.from("certificates").update({ pdf_path: null }).eq("id", data.id);
    revalidateCertificates();
    return ok({ id: data.id });
  });
}

export async function deleteDraftCertificate(_prev: Prev<undefined>, formData: FormData): Promise<ActionResult> {
  const result = await runAction<undefined>(async () => {
    await requirePermission("certificates.issue", "action");
    const { id } = certificateIdSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.from("certificates").delete().eq("id", id).eq("status", "draft").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Only drafts can be deleted.", "CONFLICT");
    revalidateCertificates();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/certificates"));
  return result;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Emails the recipient the verification link and the PDF link (sign in required for the PDF). */
export async function emailCertificate(_prev: Prev<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  return runAction<{ email: string }>(async () => {
    await requirePermission("certificates.issue", "action");
    const { id } = certificateIdSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const certificate = await loadCertificate(supabase, id);
    if (!certificate) return fail("Not found.", "NOT_FOUND");
    if (certificate.status !== "issued") return fail("Only issued certificates can be emailed.", "CONFLICT");
    const email = certificate.recipient_email?.trim();
    if (!email) return fail("The certificate has no recipient email.", "VALIDATION");

    const locale = certificate.language;
    const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    const verifyUrl = `${base}/${locale}/verify/${certificate.verification_code}`;
    const pdfUrl = `${base}/api/documents/certificates/${certificate.id}`;
    const name = escapeHtml(pick(certificate, "recipient_name", locale));
    const typeLabel = escapeHtml(label(CERTIFICATE_TYPE_LABELS, certificate.type, locale));
    const title = escapeHtml(pick(certificate, "title", locale));
    const number = escapeHtml(certificate.certificate_no ?? "");
    const subject = locale === "ar" ? `${label(CERTIFICATE_TYPE_LABELS, certificate.type, locale)} ${certificate.certificate_no ?? ""} من سايبرق`.trim() : `Your ${label(CERTIFICATE_TYPE_LABELS, certificate.type, locale).toLowerCase()} from CyBarq`;
    const body =
      locale === "ar"
        ? `<p>مرحباً ${name}،</p><p>أصدرنا لك ${typeLabel} رقم <strong>${number}</strong>: ${title}.</p><p>يمكن لأي جهة التحقق من الشهادة عبر الرابط التالي:<br><a href="${verifyUrl}">${verifyUrl}</a></p><p>ولتنزيل نسخة PDF بعد تسجيل الدخول إلى حسابك:<br><a href="${pdfUrl}">${pdfUrl}</a></p>`
        : `<p>Hello ${name},</p><p>Your ${typeLabel.toLowerCase()} <strong>${number}</strong> has been issued: ${title}.</p><p>Anyone can verify it at:<br><a href="${verifyUrl}">${verifyUrl}</a></p><p>To download the PDF after signing in to your account:<br><a href="${pdfUrl}">${pdfUrl}</a></p>`;
    const text = locale === "ar" ? `أصدرنا لك الشهادة رقم ${certificate.certificate_no ?? ""}. للتحقق: ${verifyUrl}. لتنزيل PDF: ${pdfUrl}` : `Your certificate ${certificate.certificate_no ?? ""} has been issued. Verify: ${verifyUrl}. PDF: ${pdfUrl}`;

    await sendMail({ to: email, subject, html: mailLayout(subject, body, locale), text });
    await audit("certificate.emailed", "certificate", certificate.id, { certificate_no: certificate.certificate_no, to: email });
    revalidateCertificates();
    return ok({ email });
  });
}
