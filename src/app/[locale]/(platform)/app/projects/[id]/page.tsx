import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { label, PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils/format";
import { PROJECT_STATUSES } from "@/lib/validation/projects";
import { setProjectStatus, setProjectClientVisibility, deleteProject } from "@/lib/actions/projects";
import { Status } from "@/components/ui/status";
import { SectionCard } from "@/components/platform/section-card";
import { DetailList } from "@/components/platform/detail-list";
import { Person, personName } from "@/components/platform/person";
import { StatusSelectForm } from "@/components/platform/status-select-form";
import { ActionButton } from "@/components/platform/action-button";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { enumOptions } from "@/components/platform/enum-options";
import { getProject, canManageProject } from "./project-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  const locale = (await getLocale()) as Locale;
  return { title: project ? pick(project, "name", locale) : "", robots: { index: false, follow: false } };
}

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects");
  const supabase = await createClient();
  const manage = await canManageProject(viewer, project);
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: openTasks }, { count: overdueTasks }, { count: members }, { count: milestones }] = await Promise.all([
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("project_id", project.id).in("status", ["todo", "in_progress", "review"]),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("project_id", project.id).in("status", ["todo", "in_progress", "review"]).lt("due_date", today),
    supabase.from("project_members").select("user_id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("milestones").select("id", { count: "exact", head: true }).eq("project_id", project.id),
  ]);

  const canDelete = viewer.can("projects.write") && (project.status === "draft" || project.status === "cancelled");

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <SectionCard title={t("overview.details")}>
          <DetailList
            items={[
              { label: t("fields.code"), value: <span className="font-mono">{project.code}</span> },
              { label: t("fields.practice"), value: label(PRACTICE_LABELS, project.practice, locale) },
              { label: t("fields.client"), value: project.client ? pick(project.client, "name", locale) : t("fields.noClient") },
              { label: t("fields.status"), value: <Status value={project.status} label={label(PROJECT_STATUS_LABELS, project.status, locale)} /> },
              { label: t("fields.manager"), value: project.manager ? <Person person={project.manager} locale={locale} /> : t("fields.noManager") },
              { label: t("fields.startDate"), value: formatDate(project.start_date, locale) },
              { label: t("fields.endDate"), value: formatDate(project.end_date, locale) },
              { label: t("overview.clientVisibility"), value: project.client_visible ? t("overview.visible") : t("overview.hidden") },
              { label: t("fields.description"), value: project.description ? <p className="whitespace-pre-line">{project.description}</p> : t("overview.noDescription"), wide: true },
            ]}
          />
        </SectionCard>
        <SectionCard title={t("overview.summary")}>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: t("overview.openTasks"), value: openTasks ?? 0 },
              { label: t("overview.overdueTasks"), value: overdueTasks ?? 0 },
              { label: t("overview.members"), value: members ?? 0 },
              { label: t("overview.milestones"), value: milestones ?? 0 },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-label text-slate">{item.label}</dt>
                <dd className="mt-1 text-h2 font-light tabular-nums">{formatNumber(item.value, locale)}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>

      <div className="flex flex-col gap-6">
        {manage ? (
          <SectionCard title={t("overview.changeStatus")} description={t("overview.statusHint")}>
            <StatusSelectForm
              action={setProjectStatus.bind(null, project.id)}
              name="status"
              options={enumOptions(PROJECT_STATUS_LABELS, locale, PROJECT_STATUSES)}
              defaultValue={project.status}
              submitLabel={t("overview.update")}
              successMessage={t("overview.statusSaved")}
              ariaLabel={t("fields.status")}
              className="flex flex-col gap-2"
            />
          </SectionCard>
        ) : null}
        {manage ? (
          <SectionCard title={t("overview.clientVisibility")} description={project.client_visible ? t("overview.visible") : t("overview.hidden")}>
            <ActionButton action={setProjectClientVisibility.bind(null, project.id, !project.client_visible)} variant="outline" size="sm" successMessage={t("overview.visibilitySaved")}>
              {project.client_visible ? t("overview.makeHidden") : t("overview.makeVisible")}
            </ActionButton>
          </SectionCard>
        ) : null}
        <SectionCard title={t("overview.created")}>
          <DetailList
            columns={1}
            items={[
              { label: t("overview.created"), value: `${formatDateTime(project.created_at, locale)}${project.creator ? ` · ${personName(project.creator, locale)}` : ""}` },
              { label: t("overview.updated"), value: formatDateTime(project.updated_at, locale) },
            ]}
          />
        </SectionCard>
        {viewer.can("projects.write") ? (
          <SectionCard title={t("overview.delete")} description={t("overview.deleteHint")}>
            <ConfirmAction
              action={deleteProject.bind(null, project.id)}
              title={t("overview.deleteTitle")}
              description={t("overview.deleteDescription")}
              confirmLabel={t("overview.delete")}
              triggerLabel={t("overview.delete")}
              triggerVariant="danger"
              destructive
              disabled={!canDelete}
              redirectTo="/app/projects"
              successMessage={t("overview.deleted")}
            />
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
