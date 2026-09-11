import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createEngagement } from "@/lib/actions/security";
import { defaultEngagementCode } from "@/lib/validation/security";
import { PageHeader } from "@/components/ui/page-header";
import { EngagementForm } from "@/components/security/engagement-form";
import { loadEngagementFormOptions } from "@/components/security/data";

export default async function NewEngagementPage() {
  await requirePermission("security.write");
  const t = await getTranslations("security");
  const supabase = await createClient();
  const options = await loadEngagementFormOptions(supabase);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={<Link href="/app/security" className="hover:text-azure">{t("title")}</Link>}
        title={t("new")}
        description={t("form.newDescription")}
      />
      <EngagementForm action={createEngagement} defaults={{ code: defaultEngagementCode() }} mode="create" {...options} />
    </div>
  );
}
