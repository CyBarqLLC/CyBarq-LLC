import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionToggle } from "./permission-toggle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.users.rolesPage");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function RolesPage() {
  const viewer = await requirePermission("users.manage");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.users.rolesPage");
  const tu = await getTranslations("platform.users");
  const supabase = await createClient();
  const canManage = viewer.can("roles.manage");

  const [{ data: roles }, { data: permissions }, { data: grants }] = await Promise.all([
    supabase.from("roles").select("key, name_en, name_ar, description").order("key"),
    supabase.from("permissions").select("key, description").order("key"),
    supabase.from("role_permissions").select("role_key, permission_key"),
  ]);
  const granted = new Set((grants ?? []).map((g) => `${g.role_key}:${g.permission_key}`));
  const roleList = roles ?? [];
  const permissionList = permissions ?? [];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={`${t("description")} ${canManage ? t("superAdminNote") : t("readOnly")}`}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/users">{tu("back")}</Link>
          </Button>
        }
      />
      <div className="border border-fog bg-white">
        <Table>
          <caption className="sr-only">{t("title")}</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky start-0 z-10 bg-white">{t("permission")}</TableHead>
              {roleList.map((role) => (
                <TableHead key={role.key} className="text-center">
                  <span className="block">{pick(role, "name", locale)}</span>
                  <span className="block font-mono text-[10px] font-normal text-slate" dir="ltr">{role.key}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionList.map((permission) => (
              <TableRow key={permission.key}>
                <TableCell className="sticky start-0 z-10 bg-white">
                  <span className="block font-mono text-small" dir="ltr">{permission.key}</span>
                  <span className="block max-w-xs text-label text-slate">{permission.description}</span>
                </TableCell>
                {roleList.map((role) => {
                  const has = granted.has(`${role.key}:${permission.key}`);
                  const editable = canManage && role.key !== "super_admin";
                  return (
                    <TableCell key={role.key} className="text-center">
                      {editable ? (
                        <PermissionToggle roleKey={role.key} permissionKey={permission.key} granted={has} label={`${t("toggle")}: ${role.key} ${permission.key}`} successMessage={t("saved")} />
                      ) : has ? (
                        <Check className="mx-auto size-4 text-graphite" aria-label="yes" />
                      ) : (
                        <span className="sr-only">no</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
