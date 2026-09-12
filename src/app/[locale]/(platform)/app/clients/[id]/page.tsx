import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Reference } from "@/components/platform/reference";
import { CLIENT_STATUS_LABELS, label, labelOf, PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { createContact, updateContact, deleteContact, inviteClientUser, resendClientInvitation, setClientUserActive } from "@/lib/actions/clients";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SectionCard } from "@/components/platform/section-card";
import { DetailList } from "@/components/platform/detail-list";
import { Person } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { ActionButton } from "@/components/platform/action-button";
import { getClientRecord } from "./client-data";
import { ContactForm, ContactItem } from "./contact-forms";
import { InviteClientUserForm } from "./invite-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientRecord(id);
  const locale = (await getLocale()) as Locale;
  return { title: client ? pick(client, "name", locale) : "", robots: { index: false, follow: false } };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const client = await getClientRecord(id);
  if (!client) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.clients");
  const tp = await getTranslations("projects");
  const tc = await getTranslations("common");
  const supabase = await createClient();
  const canWrite = viewer.can("clients.write");

  const [{ data: contacts }, { data: projects }, { data: portalUsers }] = await Promise.all([
    supabase.from("client_contacts").select("id, name, email, phone, title").eq("client_id", client.id).order("name"),
    supabase.from("projects").select("id, code, name_en, name_ar, practice, status, end_date").eq("client_id", client.id).order("updated_at", { ascending: false }).limit(50),
    supabase
      .from("client_users")
      .select("user_id, is_active, is_primary, created_at, profile:profiles!client_users_user_id_fkey(id, full_name, full_name_ar, email, avatar_path)")
      .eq("client_id", client.id)
      .order("created_at"),
  ]);

  type ProjectRow = NonNullable<typeof projects>[number];
  const projectColumns: Column<ProjectRow>[] = [
    { key: "name", header: tp("columns.name"), primary: true, cell: (p) => (
      <span className="block">
        <span className="block font-medium text-graphite">{pick(p, "name", locale)}</span>
        <span className="block text-small text-slate">{p.code}</span>
      </span>
    ) },
    { key: "practice", header: tp("columns.practice"), cell: (p) => label(PRACTICE_LABELS, p.practice, locale) },
    { key: "status", header: tp("columns.status"), cell: (p) => <Status value={p.status} label={label(PROJECT_STATUS_LABELS, p.status, locale)} /> },
    { key: "end", header: tp("columns.endDate"), cell: (p) => formatDate(p.end_date, locale) },
  ];

  type PortalRow = NonNullable<typeof portalUsers>[number];
  const portalColumns: Column<PortalRow>[] = [
    { key: "person", header: t("portal.columns.person"), primary: true, cell: (u) => (
      <Person person={u.profile} locale={locale} fallback={t("portal.user")} secondary={u.profile?.email ?? null} />
    ) },
    { key: "status", header: t("portal.columns.status"), cell: (u) => <Badge variant={u.is_active ? "success" : "outline"}>{u.is_active ? t("portal.active") : t("portal.inactive")}</Badge> },
    { key: "since", header: t("portal.columns.since"), cell: (u) => <span className="text-slate">{formatDate(u.created_at, locale)}</span> },
  ];
  if (canWrite) {
    portalColumns.push({
      key: "actions",
      header: "",
      align: "end",
      cell: (u) => (
        <span className="inline-flex flex-wrap justify-end gap-1">
          {u.is_active ? (
            <>
              <ActionButton action={resendClientInvitation.bind(null, client.id, u.user_id)} variant="ghost" size="sm" successMessage={t("portal.invited")}>
                {t("portal.resend")}
              </ActionButton>
              <ConfirmAction
                action={setClientUserActive.bind(null, client.id, u.user_id, false)}
                title={t("portal.deactivateTitle")}
                description={t("portal.deactivateDescription")}
                confirmLabel={t("portal.deactivate")}
                triggerLabel={t("portal.deactivate")}
                triggerVariant="ghost"
                destructive
                successMessage={t("portal.updated")}
              />
            </>
          ) : (
            <ActionButton action={setClientUserActive.bind(null, client.id, u.user_id, true)} variant="ghost" size="sm" successMessage={t("portal.updated")}>
              {t("portal.reactivate")}
            </ActionButton>
          )}
        </span>
      ),
    });
  }

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/clients" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Status value={client.status} label={labelOf(CLIENT_STATUS_LABELS, client.status, locale)} />
          </span>
        }
        title={pick(client, "name", locale)}
        description={client.legal_name ?? undefined}
        actions={canWrite ? (
          <>
            <Button asChild variant="outline">
              <Link href={`/app/clients/${client.id}/edit`}>{t("edit")}</Link>
            </Button>
            {viewer.can("projects.write") ? (
              <Button asChild>
                <Link href="/app/projects/new">{t("detail.newProject")}</Link>
              </Button>
            ) : null}
          </>
        ) : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title={t("detail.info")}>
            <DetailList
              items={[
                { label: tc("reference"), value: <Reference value={client.reference} /> },
                { label: t("fields.nameEn"), value: <span dir="ltr">{client.name_en}</span> },
                { label: t("fields.nameAr"), value: client.name_ar ? <span dir="rtl">{client.name_ar}</span> : "" },
                { label: t("fields.legalName"), value: client.legal_name },
                { label: t("fields.taxNumber"), value: client.tax_number ? <span dir="ltr">{client.tax_number}</span> : "" },
                { label: t("fields.website"), value: client.website ? <a href={client.website} className="text-azure hover:underline" target="_blank" rel="noopener noreferrer" dir="ltr">{client.website}</a> : "" },
                { label: t("fields.phone"), value: client.phone ? <span dir="ltr">{client.phone}</span> : "" },
                { label: t("fields.primaryContactName"), value: client.primary_contact_name },
                { label: t("fields.primaryContactEmail"), value: client.primary_contact_email ? <a href={`mailto:${client.primary_contact_email}`} className="text-azure hover:underline" dir="ltr">{client.primary_contact_email}</a> : "" },
                { label: t("fields.country"), value: [client.city, client.country].filter(Boolean).join(", ") },
                { label: t("fields.address"), value: client.address, wide: true },
                { label: t("fields.notes"), value: client.notes ? <p className="whitespace-pre-line">{client.notes}</p> : "", wide: true },
                { label: t("detail.created"), value: formatDateTime(client.created_at, locale) },
                { label: t("detail.updated"), value: formatDateTime(client.updated_at, locale) },
              ]}
            />
          </SectionCard>

          <SectionCard title={t("detail.projects")} flush>
            <DataTable
              rows={projects ?? []}
              columns={projectColumns}
              rowKey={(p) => p.id}
              rowHref={(p) => `/app/projects/${p.id}`}
              emptyTitle={t("detail.projectsEmpty")}
              caption={t("detail.projects")}
              className="[&>ul]:p-4 [&>div]:border-0"
            />
          </SectionCard>

          <SectionCard title={t("portal.title")} description={t("portal.description")} flush>
            <DataTable rows={portalUsers ?? []} columns={portalColumns} rowKey={(u) => u.user_id} emptyTitle={t("portal.empty")} caption={t("portal.title")} className="[&>ul]:p-4 [&>div]:border-0" />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title={t("contacts.title")}>
            {(contacts ?? []).length === 0 ? <p className="text-small text-slate">{t("contacts.empty")}</p> : null}
            <ul className="flex flex-col gap-3">
              {(contacts ?? []).map((c) => (
                <ContactItem
                  key={c.id}
                  contactId={c.id}
                  values={{ name: c.name, email: c.email, phone: c.phone, title: c.title }}
                  updateAction={updateContact.bind(null, client.id, c.id)}
                  canEdit={canWrite}
                  summary={
                    <>
                      <span className="block text-body font-medium">{c.name}</span>
                      {c.title ? <span className="block text-small text-slate">{c.title}</span> : null}
                      {c.email ? <a href={`mailto:${c.email}`} className="block text-small text-azure hover:underline" dir="ltr">{c.email}</a> : null}
                      {c.phone ? <span className="block text-small" dir="ltr">{c.phone}</span> : null}
                    </>
                  }
                  deleteControl={
                    <ConfirmAction
                      action={deleteContact.bind(null, client.id, c.id)}
                      title={t("contacts.deleteTitle")}
                      confirmLabel={t("contacts.delete")}
                      triggerLabel={t("contacts.delete")}
                      triggerVariant="ghost"
                      destructive
                      successMessage={t("contacts.deleted")}
                    />
                  }
                />
              ))}
            </ul>
            {canWrite ? (
              <div className="mt-5 border-t border-fog pt-5">
                <h3 className="mb-3 text-body font-medium">{t("contacts.add")}</h3>
                <ContactForm action={createContact.bind(null, client.id)} defaults={{ name: "", email: null, phone: null, title: null }} submitLabel={t("contacts.add")} idPrefix="c-new" />
              </div>
            ) : null}
          </SectionCard>

          {canWrite ? (
            <SectionCard title={t("portal.invite")}>
              <InviteClientUserForm action={inviteClientUser.bind(null, client.id)} />
            </SectionCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
