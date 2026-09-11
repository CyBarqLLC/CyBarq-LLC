import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createTeam } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SectionCard } from "@/components/platform/section-card";
import { personName } from "@/components/platform/person";
import { TeamForm } from "./team-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.teams");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function TeamsPage() {
  await requirePermission("hr.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.teams");
  const th = await getTranslations("hr.record");
  const supabase = await createClient();
  const [{ data: teams }, { data: departments }, { data: directory }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name_en, name_ar, department:departments(name_en, name_ar), lead:profiles!teams_lead_user_id_fkey(full_name, full_name_ar), team_members(user_id)")
      .order("name_en"),
    supabase.from("departments").select("id, name_en, name_ar").order("position").order("name_en"),
    supabase.from("employee_directory").select("user_id, full_name, full_name_ar, email").order("full_name").limit(500),
  ]);
  type Row = NonNullable<typeof teams>[number];
  const rows: Row[] = teams ?? [];

  const columns: Column<Row>[] = [
    { key: "name", header: t("columns.name"), primary: true, cell: (r) => <span className="font-medium text-graphite">{pick(r, "name", locale)}</span> },
    { key: "department", header: t("columns.department"), cell: (r) => (r.department ? pick(r.department, "name", locale) : <span className="text-slate">{t("noDepartment")}</span>) },
    { key: "lead", header: t("columns.lead"), cell: (r) => personName(r.lead, locale, t("noLead")) },
    { key: "members", header: t("columns.members"), cell: (r) => t("memberCount", { count: r.team_members.length }) },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/employees">{th("back")}</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/${locale}/app/employees/teams/${r.id}`} emptyTitle={t("empty")} caption={t("title")} />
        <SectionCard title={t("add")}>
          <TeamForm
            mode="create"
            action={createTeam}
            defaults={{ name_en: "", name_ar: "", department_id: null, lead_user_id: null }}
            departments={(departments ?? []).map((d) => ({ value: d.id, label: pick(d, "name", locale) }))}
            leads={(directory ?? []).flatMap((p) => (p.user_id ? [{ value: p.user_id, label: personName(p, locale) }] : []))}
          />
        </SectionCard>
      </div>
    </>
  );
}
