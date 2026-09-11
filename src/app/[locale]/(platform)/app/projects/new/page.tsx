import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { suggestProjectCode, PRACTICES, PROJECT_STATUSES } from "@/lib/validation/projects";
import { createProject } from "@/lib/actions/projects";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { enumOptions } from "@/components/platform/enum-options";
import { personName } from "@/components/platform/person";
import { ProjectForm } from "../project-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("new"), robots: { index: false, follow: false } };
}

export default async function NewProjectPage() {
  const viewer = await requirePermission("projects.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects");
  const supabase = await createClient();

  const [{ data: clients }, { data: employees }] = await Promise.all([
    supabase.from("clients").select("id, name_en, name_ar").order("name_en").limit(300),
    supabase.from("profiles").select("id, full_name, full_name_ar, email").eq("kind", "employee").eq("is_active", true).order("full_name").limit(300),
  ]);

  return (
    <>
      <PageHeader
        title={t("new")}
        eyebrow={<Link href="/app/projects" className="hover:text-azure">{t("back")}</Link>}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/projects">{t("back")}</Link>
          </Button>
        }
      />
      <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
        <ProjectForm
          mode="create"
          action={createProject}
          defaults={{
            code: suggestProjectCode(),
            name_en: "",
            name_ar: null,
            client_id: null,
            practice: "mixed",
            status: "draft",
            description: null,
            manager_user_id: viewer.userId,
            start_date: null,
            end_date: null,
            client_visible: false,
          }}
          clients={(clients ?? []).map((c) => ({ value: c.id, label: pick(c, "name", locale) }))}
          managers={(employees ?? []).map((e) => ({ value: e.id, label: personName(e, locale) }))}
          practices={enumOptions(PRACTICE_LABELS, locale, PRACTICES)}
          statuses={enumOptions(PROJECT_STATUS_LABELS, locale, PROJECT_STATUSES)}
        />
      </div>
    </>
  );
}
