"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { actionError } from "@/lib/actions/messages";
import { formToObject } from "@/lib/validation/common";
import { certificateSchema, issueCertificateSchema, revokeCertificateSchema, certificateIdSchema, type CertificateInput } from "@/lib/validation/certificates";
import { audit } from "@/lib/audit";
import { sendMail, renderEmail } from "@/lib/email/resend";
import { siteUrl } from "@/lib/env";
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
    if (!existing) return fail(await actionError("notFound"), "NOT_FOUND");
    if (existing.status !== "draft") return fail(await actionError("certificateIssued"), "CONFLICT");
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
    // The database clears the stored PDF on revocation, so the next download shows the revoked stamp.
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
    if (!data || data.length === 0) return fail(await actionError("onlyDraftsDeletable"), "CONFLICT");
    revalidateCertificates();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/certificates"));
  return result;
}

export async function emailCertificate(_prev: Prev<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  return runAction<{ email: string }>(async () => {
    await requirePermission("certificates.issue", "action");
    const { id } = certificateIdSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const certificate = await loadCertificate(supabase, id);
    if (!certificate) return fail(await actionError("notFound"), "NOT_FOUND");
    if (certificate.status !== "issued") return fail(await actionError("certificateNotEmailable"), "CONFLICT");
    const email = certificate.recipient_email?.trim();
    if (!email) return fail(await actionError("noRecipientEmail"), "VALIDATION");

    const locale = certificate.language;
    const base = siteUrl();
    const verifyUrl = `${base}/${locale}/verify/${certificate.verification_code}`;
    const pdfUrl = `${base}/api/verify/${certificate.verification_code}/pdf`;
    const name = pick(certificate, "recipient_name", locale);
    const typeLabel = label(CERTIFICATE_TYPE_LABELS, certificate.type, locale);
    const title = pick(certificate, "title", locale);
    const number = certificate.certificate_no ?? "";
    const copy =
      locale === "ar"
        ? {
            subject: `${typeLabel} ${number} من سايبرق`.trim(),
            heading: `${typeLabel} من سايبرق`,
            paragraphs: [`مرحباً ${name}،`, `يسعدنا أن نرسل إليك ${typeLabel} رقم ${number}: «${title}».`, `يمكنك تنزيل نسخة PDF من الرابط أدناه، ويمكن لأي جهة التحقق من صحة الشهادة عبر: ${verifyUrl}`],
            action: "تنزيل الشهادة",
          }
        : {
            subject: `Your ${typeLabel.toLowerCase()} from CyBarq`,
            heading: `Your ${typeLabel.toLowerCase()} from CyBarq`,
            paragraphs: [`Hello ${name},`, `We are pleased to send you ${typeLabel.toLowerCase()} ${number}: "${title}".`, `Download your PDF copy below. Anyone can confirm it is genuine at ${verifyUrl}`],
            action: "Download certificate",
          };
    const { html, text } = renderEmail({ locale, title: copy.heading, paragraphs: copy.paragraphs, action: { label: copy.action, url: pdfUrl } });
    const mail = await sendMail({ to: email, subject: copy.subject, html, text, idempotencyKey: `certificate-emailed/${certificate.id}/${number}` });
    if (!mail.sent) return fail(await actionError("emailNotSent"), "ERROR");
    await audit("certificate.emailed", "certificate", certificate.id, { certificate_no: certificate.certificate_no, to: email });
    revalidateCertificates();
    return ok({ email });
  });
}
