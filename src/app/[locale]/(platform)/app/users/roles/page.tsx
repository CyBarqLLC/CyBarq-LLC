import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { permissionDescription, permissionLabel, roleDescription } from "@/lib/labels";
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
              <TableHead className="sticky start-0 z-10 min-w-56 bg-white">{t("permission")}</TableHead>
              {roleList.map((role) => {
                const name = pick(role, "name", locale);
                return (
                  <TableHead key={role.key} className="text-center align-bottom">
                    <span className="block whitespace-normal text-graphite" title={roleDescription(role.key, locale) ?? role.description ?? undefined}>{name}</span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionList.map((permission) => {
              const name = permissionLabel(permission.key, locale);
              const description = permissionDescription(permission.key, locale) ?? permission.description;
              return (
                <TableRow key={permission.key}>
                  <TableCell className="sticky start-0 z-10 bg-white">
                    <span className="block font-medium text-graphite">{name}</span>
                    {description ? <span className="block max-w-xs text-small text-slate">{description}</span> : null}
                  </TableCell>
                  {roleList.map((role) => {
                    const has = granted.has(`${role.key}:${permission.key}`);
                    const editable = canManage && role.key !== "super_admin";
                    const roleName = pick(role, "name", locale);
                    return (
                      <TableCell key={role.key} className="text-center">
                        {editable ? (
                          <PermissionToggle roleKey={role.key} permissionKey={permission.key} granted={has} label={t("toggleLabel", { role: roleName, permission: name })} successMessage={t("saved")} />
                        ) : has ? (
                          <Check className="mx-auto size-4 text-graphite" aria-label={t("granted", { role: roleName, permission: name })} />
                        ) : (
                          <span className="sr-only">{t("notGranted", { role: roleName, permission: name })}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
