import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SupportRequestForm } from "@/components/portal/support-form";

export default async function NewSupportRequestPage() {
  const viewer = await requireClientUser();
  const t = await getTranslations("portal");
  const supabase = await createClient();
  const clientIds = viewer.clientIds.length > 0 ? viewer.clientIds : ["00000000-0000-0000-0000-000000000000"];
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("id, name_en, name_ar").in("id", clientIds).order("name_en"),
    supabase.from("projects").select("id, code, name_en, name_ar, client_id").neq("status", "cancelled").order("code"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={<Link href="/portal/support" className="hover:text-azure">{t("support.title")}</Link>}
        title={t("support.new")}
        description={t("support.newDescription")}
      />
      <SupportRequestForm clients={clients ?? []} projects={projects ?? []} />
    </div>
  );
}
