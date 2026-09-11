import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RoleCheckboxes } from "../role-checkboxes";
import { InviteEmployeeForm } from "./invite-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.users");
  return { title: t("invite"), robots: { index: false, follow: false } };
}

export default async function InviteEmployeePage() {
  const viewer = await requirePermission("users.manage");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.users");
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("key, name_en, name_ar, description").neq("key", "client").order("key");

  return (
    <>
      <PageHeader
        title={t("invite")}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/users">{t("back")}</Link>
          </Button>
        }
      />
      <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
        <InviteEmployeeForm>
          <RoleCheckboxes roles={roles ?? []} selected={new Set(["employee"])} locale={locale} canGrantSuperAdmin={viewer.roles.includes("super_admin")} idPrefix="invite-role" />
        </InviteEmployeeForm>
      </div>
    </>
  );
}
