import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { PRACTICES, PROJECT_STATUSES } from "@/lib/validation/projects";
import { updateProject } from "@/lib/actions/projects";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { ProjectForm } from "../../project-form";
import { getProject, canManageProject } from "../project-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("edit"), robots: { index: false, follow: false } };
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  if (!(await canManageProject(viewer, project))) redirect({ href: "/app/forbidden", locale });
  const t = await getTranslations("projects");
  const supabase = await createClient();

  const [{ data: clients }, { data: employees }] = await Promise.all([
    supabase.from("clients").select("id, name_en, name_ar").order("name_en").limit(300),
    supabase.from("profiles").select("id, full_name, full_name_ar, email").eq("kind", "employee").eq("is_active", true).order("full_name").limit(300),
  ]);

  return (
    <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
      <h2 className="mb-6 text-h2">{t("edit")}</h2>
      <ProjectForm
        mode="edit"
        action={updateProject.bind(null, project.id)}
        defaults={{
          code: project.code,
          name_en: project.name_en,
          name_ar: project.name_ar,
          client_id: project.client?.id ?? null,
          practice: project.practice,
          status: project.status,
          description: project.description,
          manager_user_id: project.manager_user_id,
          start_date: project.start_date,
          end_date: project.end_date,
          client_visible: project.client_visible,
        }}
        clients={(clients ?? []).map((c) => ({ value: c.id, label: pick(c, "name", locale) }))}
        managers={(employees ?? []).map((e) => ({ value: e.id, label: personName(e, locale) }))}
        practices={enumOptions(PRACTICE_LABELS, locale, PRACTICES)}
        statuses={enumOptions(PROJECT_STATUS_LABELS, locale, PROJECT_STATUSES)}
      />
    </div>
  );
}
