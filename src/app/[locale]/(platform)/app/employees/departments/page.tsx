import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createDepartment, updateDepartment, deleteDepartment } from "@/lib/actions/employees";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SectionCard } from "@/components/platform/section-card";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { DepartmentForm, DepartmentItem } from "./department-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hr.departments");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function DepartmentsPage() {
  await requirePermission("hr.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hr.departments");
  const th = await getTranslations("hr.record");
  const supabase = await createClient();
  const [{ data: departments }, { data: employees }] = await Promise.all([
    supabase.from("departments").select("id, name_en, name_ar, position").order("position").order("name_en"),
    supabase.from("employees").select("department_id").limit(2000),
  ]);
  const counts = new Map<string, number>();
  for (const e of employees ?? []) if (e.department_id) counts.set(e.department_id, (counts.get(e.department_id) ?? 0) + 1);
  const list = departments ?? [];

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
        {list.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((d) => (
              <DepartmentItem
                key={d.id}
                departmentId={d.id}
                values={{ name_en: d.name_en, name_ar: d.name_ar, position: d.position }}
                updateAction={updateDepartment.bind(null, d.id)}
                summary={
                  <>
                    <span className="block text-body font-medium">{pick(d, "name", locale)}</span>
                    <span className="block text-small text-slate">
                      <span dir="ltr">{d.name_en}</span> · {d.name_ar} · {t("members", { count: counts.get(d.id) ?? 0 })}
                    </span>
                  </>
                }
                deleteControl={
                  <ConfirmAction
                    action={deleteDepartment.bind(null, d.id)}
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
            ))}
          </ul>
        )}
        <SectionCard title={t("add")}>
          <DepartmentForm action={createDepartment} defaults={{ name_en: "", name_ar: "", position: list.length + 1 }} submitLabel={t("add")} idPrefix="d-new" />
        </SectionCard>
      </div>
    </>
  );
}
