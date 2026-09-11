import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { CertificateForm } from "@/components/certificates/certificate-form";
import { employeeOptions } from "../../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requirePermission("certificates.issue");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("certificates");
  const supabase = await createClient();

  const { data: certificate } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (!certificate) notFound();
  // Issued certificates are immutable: no edit UI, send the viewer back to the detail page.
  if (certificate.status !== "draft") redirect(`/${locale}/app/certificates/${certificate.id}`);

  const employees = await employeeOptions(supabase, locale);

  return (
    <div>
      <PageHeader title={t("edit")} eyebrow={<Link href={`/app/certificates/${certificate.id}`} className="hover:text-azure">{certificate.certificate_no ?? t("draftLabel")}</Link>} />
      <CertificateForm
        mode="edit"
        values={{
          id: certificate.id,
          type: certificate.type,
          language: certificate.language,
          recipient_name_en: certificate.recipient_name_en,
          recipient_name_ar: certificate.recipient_name_ar,
          recipient_email: certificate.recipient_email,
          recipient_user_id: certificate.recipient_user_id,
          title_en: certificate.title_en,
          title_ar: certificate.title_ar,
          description_en: certificate.description_en,
          description_ar: certificate.description_ar,
          program_name_en: certificate.program_name_en,
          program_name_ar: certificate.program_name_ar,
          role_title_en: certificate.role_title_en,
          role_title_ar: certificate.role_title_ar,
          start_date: certificate.start_date,
          end_date: certificate.end_date,
          hours: certificate.hours,
          signatory_name_en: certificate.signatory_name_en,
          signatory_name_ar: certificate.signatory_name_ar,
          signatory_title_en: certificate.signatory_title_en,
          signatory_title_ar: certificate.signatory_title_ar,
        }}
        employees={employees}
        locale={locale}
        cancelHref={`/app/certificates/${certificate.id}`}
      />
    </div>
  );
}
