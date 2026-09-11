import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { addProjectMember, removeProjectMember } from "@/lib/actions/projects";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/platform/section-card";
import { Person, personName } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { getProject, getProjectMembers, canManageProject, type ProjectMember } from "../project-data";
import { MemberForm } from "./member-form";

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.members");
  const manage = await canManageProject(viewer, project);
  const members = await getProjectMembers(project.id);

  let candidates: { value: string; label: string }[] = [];
  if (manage) {
    const supabase = await createClient();
    const { data: directory } = await supabase.from("employee_directory").select("user_id, full_name, full_name_ar, email").order("full_name").limit(300);
    const existing = new Set(members.map((m) => m.user_id));
    candidates = (directory ?? [])
      .filter((d) => d.user_id && !existing.has(d.user_id))
      .map((d) => ({ value: d.user_id ?? "", label: personName(d, locale) }));
  }

  const roleLabel = (role: ProjectMember["role"]) => t(`roles.${role}`);

  const columns: Column<ProjectMember>[] = [
    { key: "person", header: t("columns.person"), primary: true, cell: (m) => <Person person={m.profile} locale={locale} secondary={m.profile?.email ?? null} /> },
    { key: "role", header: t("columns.role"), cell: (m) => <Badge variant={m.role === "manager" ? "blue" : "neutral"}>{roleLabel(m.role)}</Badge> },
    { key: "since", header: t("columns.since"), cell: (m) => formatDate(m.created_at, locale) },
  ];
  if (manage) {
    columns.push({
      key: "actions",
      header: "",
      align: "end",
      cell: (m) => (
        <ConfirmAction
          action={removeProjectMember.bind(null, project.id, m.user_id)}
          title={t("removeTitle")}
          description={t("removeDescription")}
          confirmLabel={t("remove")}
          triggerLabel={t("remove")}
          triggerVariant="ghost"
          destructive
          successMessage={t("removed")}
        />
      ),
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        {project.manager ? (
          <div className="flex items-center gap-3 border border-fog bg-white p-4">
            <Person person={project.manager} locale={locale} secondary={t("projectManager")} size="md" />
          </div>
        ) : null}
        <DataTable rows={members} columns={columns} rowKey={(m) => m.user_id} emptyTitle={t("empty")} emptyDescription={t("emptyHint")} caption={t("title")} />
      </div>
      {manage ? (
        <SectionCard title={t("add")} description={t("description")}>
          <MemberForm action={addProjectMember.bind(null, project.id)} candidates={candidates} />
        </SectionCard>
      ) : null}
    </div>
  );
}
