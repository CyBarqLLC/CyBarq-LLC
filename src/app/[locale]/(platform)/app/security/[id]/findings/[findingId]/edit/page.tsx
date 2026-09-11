import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateFinding } from "@/lib/actions/security";
import { PageHeader } from "@/components/ui/page-header";
import { FindingForm } from "@/components/security/finding-form";

export default async function EditFindingPage({ params }: { params: Promise<{ id: string; findingId: string }> }) {
  await requirePermission("security.write");
  const { id, findingId } = await params;
  const t = await getTranslations("security");
  const supabase = await createClient();
  const [{ data: engagement }, { data: finding }, { data: assets }] = await Promise.all([
    supabase.from("security_engagements").select("id, code").eq("id", id).maybeSingle(),
    supabase.from("findings").select("*").eq("id", findingId).eq("engagement_id", id).maybeSingle(),
    supabase.from("engagement_assets").select("id, name").eq("engagement_id", id).order("name"),
  ]);
  if (!engagement || !finding) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/security" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/security/${id}?tab=findings`} className="hover:text-azure">{engagement.code}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/security/${id}/findings/${findingId}`} className="hover:text-azure">{finding.ref_code}</Link>
          </span>
        }
        title={t("findings.editTitle")}
        description={finding.title}
      />
      <FindingForm action={updateFinding.bind(null, findingId)} engagementId={id} defaults={finding} assets={assets ?? []} mode="edit" />
    </div>
  );
}
