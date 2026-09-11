import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { CertificateForm } from "@/components/certificates/certificate-form";
import { employeeOptions } from "../_lib/data";

export default async function NewCertificatePage() {
  await requirePermission("certificates.issue");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("certificates");
  const supabase = await createClient();
  const employees = await employeeOptions(supabase, locale);

  return (
    <div>
      <PageHeader title={t("new")} eyebrow={<Link href="/app/certificates" className="hover:text-azure">{t("title")}</Link>} />
      <CertificateForm mode="create" values={null} employees={employees} locale={locale} cancelHref="/app/certificates" />
    </div>
  );
}
