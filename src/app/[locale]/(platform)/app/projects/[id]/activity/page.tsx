import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/platform/section-card";
import { ActivityList } from "@/components/platform/activity-list";
import { getProject } from "../project-data";

export default async function ProjectActivityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.activity");
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("activity")
    .select("id, project_id, entity_type, entity_id, action, metadata, created_at, actor:profiles!activity_actor_id_fkey(full_name, full_name_ar)")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <SectionCard title={t("title")} description={t("description")} flush>
      <ActivityList rows={rows ?? []} locale={locale} emptyText={t("empty")} />
    </SectionCard>
  );
}
