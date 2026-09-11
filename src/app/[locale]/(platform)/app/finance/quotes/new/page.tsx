import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentForm } from "@/components/finance/document-form";
import { clientOptions, projectOptions } from "../../_lib/data";

export default async function NewQuotePage() {
  await requirePermission("finance.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();
  const [clients, projects] = await Promise.all([clientOptions(supabase, locale), projectOptions(supabase, locale)]);

  return (
    <div>
      <PageHeader title={t("quotes.new")} eyebrow={<Link href="/app/finance/quotes" className="hover:text-azure">{t("quotes.title")}</Link>} />
      <DocumentForm kind="quote" mode="create" values={null} items={[]} clients={clients} projects={projects} locale={locale} cancelHref="/app/finance/quotes" />
    </div>
  );
}
