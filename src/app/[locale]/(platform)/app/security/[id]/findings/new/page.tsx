import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createFinding } from "@/lib/actions/security";
import { nextRefCode } from "@/lib/validation/security";
import { PageHeader } from "@/components/ui/page-header";
import { FindingForm } from "@/components/security/finding-form";

export default async function NewFindingPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("security.write");
  const { id } = await params;
  const t = await getTranslations("security");
  const supabase = await createClient();
  const [{ data: engagement }, { data: assets }, { data: existing }] = await Promise.all([
    supabase.from("security_engagements").select("id, code, title").eq("id", id).maybeSingle(),
    supabase.from("engagement_assets").select("id, name").eq("engagement_id", id).order("name"),
    supabase.from("findings").select("ref_code").eq("engagement_id", id),
  ]);
  if (!engagement) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/security" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/security/${id}?tab=findings`} className="hover:text-azure">{engagement.code}</Link>
          </span>
        }
        title={t("findings.new")}
        description={engagement.title}
      />
      <FindingForm action={createFinding} engagementId={id} defaults={{ ref_code: nextRefCode(existing ?? []) }} assets={assets ?? []} mode="create" />
    </div>
  );
}
