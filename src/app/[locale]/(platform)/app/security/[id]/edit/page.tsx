import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateEngagement } from "@/lib/actions/security";
import { PageHeader } from "@/components/ui/page-header";
import { EngagementForm } from "@/components/security/engagement-form";
import { loadEngagementFormOptions } from "@/components/security/data";

export default async function EditEngagementPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("security.write");
  const { id } = await params;
  const t = await getTranslations("security");
  const supabase = await createClient();
  const [{ data: engagement }, options] = await Promise.all([
    supabase.from("security_engagements").select("*").eq("id", id).maybeSingle(),
    loadEngagementFormOptions(supabase),
  ]);
  if (!engagement) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/security" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/security/${id}`} className="hover:text-azure">{engagement.code}</Link>
          </span>
        }
        title={t("form.editTitle")}
        description={engagement.title}
      />
      <EngagementForm action={updateEngagement.bind(null, id)} defaults={engagement} mode="edit" {...options} />
    </div>
  );
}
