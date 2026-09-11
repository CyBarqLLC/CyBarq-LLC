import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { createClientRecord } from "@/lib/actions/clients";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ClientForm } from "../client-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.clients");
  return { title: t("new"), robots: { index: false, follow: false } };
}

export default async function NewClientPage() {
  await requirePermission("clients.write");
  const t = await getTranslations("platform.clients");
  return (
    <>
      <PageHeader
        title={t("new")}
        actions={
          <Button asChild variant="ghost">
            <Link href="/app/clients">{t("back")}</Link>
          </Button>
        }
      />
      <div className="max-w-3xl border border-fog bg-white p-5 sm:p-8">
        <ClientForm
          mode="create"
          action={createClientRecord}
          defaults={{
            name_en: "",
            name_ar: null,
            legal_name: null,
            country: "Jordan",
            city: "Amman",
            address: null,
            tax_number: null,
            website: null,
            primary_contact_name: null,
            primary_contact_email: null,
            phone: null,
            status: "prospect",
            notes: null,
          }}
        />
      </div>
    </>
  );
}
