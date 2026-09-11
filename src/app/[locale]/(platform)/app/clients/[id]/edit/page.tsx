import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requirePermission } from "@/lib/auth/session";
import { updateClientRecord } from "@/lib/actions/clients";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ClientForm } from "../../client-form";
import { getClientRecord } from "../client-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.clients");
  return { title: t("edit"), robots: { index: false, follow: false } };
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("clients.write");
  const { id } = await params;
  const client = await getClientRecord(id);
  if (!client) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("platform.clients");
  return (
    <>
      <PageHeader
        eyebrow={<Link href={`/app/clients/${client.id}`} className="hover:text-azure">{pick(client, "name", locale)}</Link>}
        title={t("edit")}
        actions={
          <Button asChild variant="ghost">
            <Link href={`/app/clients/${client.id}`}>{t("back")}</Link>
          </Button>
        }
      />
      <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
        <ClientForm
          mode="edit"
          action={updateClientRecord.bind(null, client.id)}
          defaults={{
            name_en: client.name_en,
            name_ar: client.name_ar,
            legal_name: client.legal_name,
            country: client.country,
            city: client.city,
            address: client.address,
            tax_number: client.tax_number,
            website: client.website,
            primary_contact_name: client.primary_contact_name,
            primary_contact_email: client.primary_contact_email,
            phone: client.phone,
            status: client.status,
            notes: client.notes,
          }}
        />
      </div>
    </>
  );
}
