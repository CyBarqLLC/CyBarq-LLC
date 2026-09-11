import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatRelative } from "@/lib/utils/format";
import { LOCALE_LABELS, USER_KIND_LABELS, label } from "@/lib/labels";
import { setUserRoles, setUserActive, resendInvitation } from "@/lib/actions/users";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/platform/section-card";
import { DetailList } from "@/components/platform/detail-list";
import { Person, personName } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { ActionButton } from "@/components/platform/action-button";
import { RoleCheckboxes } from "../role-checkboxes";
import { UserRolesForm } from "./roles-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.users");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission("users.manage");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.users");
  const supabase = await createClient();

  const [{ data: user }, { data: userRoles }, { data: roles }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, full_name_ar, kind, locale, is_active, avatar_path, created_at").eq("id", id).maybeSingle(),
    supabase.from("user_roles").select("role_key").eq("user_id", id),
    supabase.from("roles").select("key, name_en, name_ar, description").neq("key", "client").order("key"),
    supabase.from("client_users").select("client_id, is_active, client:clients(id, name_en, name_ar)").eq("user_id", id),
  ]);
  if (!user) notFound();

  const selected = new Set<string>((userRoles ?? []).map((r) => r.role_key));
  const isSelf = user.id === viewer.userId;
  const stateLabel = user.is_active ? t("states.active") : t("states.inactive");

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/users" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Badge variant={user.is_active ? "success" : "outline"}>{stateLabel}</Badge>
            <Badge variant="outline">{label(USER_KIND_LABELS, user.kind, locale)}</Badge>
          </span>
        }
        title={personName(user, locale, user.email)}
        description={user.email}
        actions={
          <>
            {user.is_active && user.kind === "employee" ? (
              <ActionButton action={resendInvitation.bind(null, user.id)} variant="outline" successMessage={t("detail.invitationSent")}>
                {t("detail.resendInvitation")}
              </ActionButton>
            ) : null}
            {user.is_active ? (
              <ConfirmAction
                action={setUserActive.bind(null, user.id, false)}
                title={t("detail.deactivateTitle")}
                description={t("detail.deactivateDescription")}
                confirmLabel={t("detail.deactivate")}
                triggerLabel={t("detail.deactivate")}
                triggerVariant="danger"
                triggerSize="md"
                destructive
                disabled={isSelf}
                successMessage={t("detail.stateSaved")}
              />
            ) : (
              <ActionButton action={setUserActive.bind(null, user.id, true)} variant="primary" successMessage={t("detail.stateSaved")}>
                {t("detail.reactivate")}
              </ActionButton>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <SectionCard title={t("detail.account")}>
          <div className="mb-5">
            <Person person={user} locale={locale} secondary={user.email} size="md" />
          </div>
          <DetailList
            columns={1}
            items={[
              { label: t("detail.email"), value: <span dir="ltr">{user.email}</span> },
              { label: t("detail.kind"), value: label(USER_KIND_LABELS, user.kind, locale) },
              { label: t("detail.locale"), value: label(LOCALE_LABELS, user.locale, locale) },
              { label: t("detail.state"), value: <Badge variant={user.is_active ? "success" : "outline"}>{stateLabel}</Badge> },
              {
                label: t("detail.invitedOn"),
                value: (
                  <span className="flex flex-col">
                    <time dateTime={user.created_at}>{formatDateTime(user.created_at, locale)}</time>
                    <span className="text-small text-slate">{t("detail.invitedRelative", { when: formatRelative(user.created_at, locale) })}</span>
                  </span>
                ),
              },
            ]}
          />
          {user.kind === "employee" ? <p className="mt-4 text-small text-slate">{t("detail.signInNote")}</p> : null}
          {user.kind === "client" && (memberships ?? []).length > 0 ? (
            <div className="mt-5 border-t border-fog pt-4">
              <h3 className="text-label text-slate">{t("detail.clientOf")}</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {(memberships ?? []).map((m) => (
                  <li key={m.client_id} className="flex items-center gap-2 text-body">
                    {m.client ? (
                      <Link href={`/app/clients/${m.client.id}`} className="text-azure hover:underline">{pick(m.client, "name", locale)}</Link>
                    ) : (
                      <span className="text-slate" title={m.client_id}>{t("detail.clientUnavailable")}</span>
                    )}
                    {!m.is_active ? <Badge variant="outline">{t("states.inactive")}</Badge> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </SectionCard>
        <SectionCard title={t("detail.rolesTitle")} description={user.kind === "employee" ? t("detail.rolesDescription") : t("detail.clientRolesNote")}>
          {user.kind === "employee" ? (
            <UserRolesForm action={setUserRoles.bind(null, user.id)}>
              <RoleCheckboxes roles={roles ?? []} selected={selected} locale={locale} canGrantSuperAdmin={viewer.roles.includes("super_admin")} />
            </UserRolesForm>
          ) : (
            <p className="text-small text-slate">{t("detail.clientRolesNote")}</p>
          )}
        </SectionCard>
      </div>
    </>
  );
}
