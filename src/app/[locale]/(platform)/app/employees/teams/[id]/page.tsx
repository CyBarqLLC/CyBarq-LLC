import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateTeam, deleteTeam, addTeamMember, removeTeamMember } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SectionCard } from "@/components/platform/section-card";
import { Person, personName } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { TeamForm } from "../team-form";
import { TeamMemberForm } from "./team-member-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.teams");
  return { title: t("edit"), robots: { index: false, follow: false } };
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("hr.write");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.teams");
  const supabase = await createClient();
  const [{ data: team }, { data: members }, { data: departments }, { data: directory }] = await Promise.all([
    supabase.from("teams").select("id, name_en, name_ar, department_id, lead_user_id").eq("id", id).maybeSingle(),
    supabase.from("team_members").select("user_id, profile:profiles!team_members_user_id_fkey(id, full_name, full_name_ar, email, avatar_path)").eq("team_id", id),
    supabase.from("departments").select("id, name_en, name_ar").order("position").order("name_en"),
    supabase.from("employee_directory").select("user_id, full_name, full_name_ar, email, job_title_en, job_title_ar").order("full_name").limit(500),
  ]);
  if (!team) notFound();

  type Member = NonNullable<typeof members>[number];
  const memberRows: Member[] = members ?? [];
  const memberIds = new Set(memberRows.map((m) => m.user_id));
  const people = (directory ?? []).flatMap((p) => (p.user_id ? [{ ...p, user_id: p.user_id }] : []));
  const leads = people.map((p) => ({ value: p.user_id, label: personName(p, locale) }));
  const candidates = people.filter((p) => !memberIds.has(p.user_id)).map((p) => ({ value: p.user_id, label: `${personName(p, locale)} · ${pick(p, "job_title", locale)}` }));

  const columns: Column<Member>[] = [
    { key: "person", header: t("membersTitle"), primary: true, cell: (m) => <Person person={m.profile} locale={locale} secondary={m.profile?.email ?? null} /> },
    { key: "actions", header: "", align: "end", cell: (m) => (
      <ConfirmAction
        action={removeTeamMember.bind(null, team.id, m.user_id)}
        title={t("removeTitle")}
        confirmLabel={t("remove")}
        triggerLabel={t("remove")}
        triggerVariant="ghost"
        destructive
        successMessage={t("removed")}
      />
    ) },
  ];

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/employees/teams" className="hover:text-azure">{t("back")}</Link>}
        title={pick(team, "name", locale)}
        actions={
          <ConfirmAction
            action={deleteTeam.bind(null, team.id)}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            confirmLabel={t("delete")}
            triggerLabel={t("delete")}
            triggerVariant="danger"
            triggerSize="md"
            destructive
            redirectTo="/app/employees/teams"
            successMessage={t("deleted")}
          />
        }
      />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title={t("edit")}>
            <TeamForm
              mode="edit"
              action={updateTeam.bind(null, team.id)}
              defaults={{ name_en: team.name_en, name_ar: team.name_ar, department_id: team.department_id, lead_user_id: team.lead_user_id }}
              departments={(departments ?? []).map((d) => ({ value: d.id, label: pick(d, "name", locale) }))}
              leads={leads}
            />
          </SectionCard>
          <SectionCard title={t("membersTitle")} flush>
            <DataTable rows={memberRows} columns={columns} rowKey={(m) => m.user_id} emptyTitle={t("membersEmpty")} caption={t("membersTitle")} className="[&>ul]:p-4 [&>div]:border-0" />
          </SectionCard>
        </div>
        <SectionCard title={t("addMember")}>
          <TeamMemberForm action={addTeamMember.bind(null, team.id)} candidates={candidates} />
        </SectionCard>
      </div>
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/app/employees/teams">{t("back")}</Link>
      </Button>
    </>
  );
}
