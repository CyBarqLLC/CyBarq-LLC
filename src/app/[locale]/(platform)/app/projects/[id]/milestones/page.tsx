import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { MILESTONE_STATUSES } from "@/lib/validation/projects";
import { createMilestone, updateMilestone, deleteMilestone } from "@/lib/actions/projects";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { SectionCard } from "@/components/platform/section-card";
import { ConfirmAction } from "@/components/platform/confirm-action";
import type { Option } from "@/components/platform/enum-options";
import { getProject, canManageProject } from "../project-data";
import { MilestoneForm } from "./milestone-form";
import { MilestoneItem } from "./milestone-item";

export default async function ProjectMilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.milestones");
  const tp = await getTranslations("projects");
  const manage = await canManageProject(viewer, project);
  const supabase = await createClient();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, title_en, title_ar, description, due_date, status, client_visible, position")
    .eq("project_id", project.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at");
  const today = new Date().toISOString().slice(0, 10);
  const statuses: Option[] = MILESTONE_STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) }));

  const list = milestones ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        {list.length === 0 ? (
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((m) => {
              const overdue = m.status !== "completed" && m.due_date !== null && m.due_date < today;
              const summary = (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-medium">{pick(m, "title", locale)}</span>
                    <Status value={m.status} label={t(`statuses.${m.status}`)} />
                    {overdue ? <Badge variant="danger">{t("overdue")}</Badge> : null}
                    {m.client_visible ? <Badge variant="outline">{tp("updates.clientBadge")}</Badge> : null}
                  </div>
                  <p className="mt-1 text-small text-slate">{m.due_date ? formatDate(m.due_date, locale) : t("noDate")}</p>
                  {m.description ? <p className="mt-2 whitespace-pre-line text-small">{m.description}</p> : null}
                </>
              );
              if (!manage) {
                return <li key={m.id} className="border border-fog bg-white p-4 sm:p-5">{summary}</li>;
              }
              return (
                <MilestoneItem
                  key={m.id}
                  milestoneId={m.id}
                  values={{ title_en: m.title_en, title_ar: m.title_ar, description: m.description, due_date: m.due_date, status: m.status, client_visible: m.client_visible }}
                  statuses={statuses}
                  updateAction={updateMilestone.bind(null, project.id, m.id)}
                  summary={summary}
                  deleteControl={
                    <ConfirmAction
                      action={deleteMilestone.bind(null, project.id, m.id)}
                      title={t("deleteTitle")}
                      description={t("deleteDescription")}
                      confirmLabel={t("delete")}
                      triggerLabel={t("delete")}
                      triggerVariant="ghost"
                      destructive
                      successMessage={t("deleted")}
                    />
                  }
                />
              );
            })}
          </ul>
        )}
      </div>
      {manage ? (
        <SectionCard title={t("add")}>
          <MilestoneForm
            action={createMilestone.bind(null, project.id)}
            defaults={{ title_en: "", title_ar: null, description: null, due_date: null, status: "planned", client_visible: true }}
            statuses={statuses}
            submitLabel={t("add")}
            idPrefix="m-new"
          />
        </SectionCard>
      ) : null}
    </div>
  );
}
