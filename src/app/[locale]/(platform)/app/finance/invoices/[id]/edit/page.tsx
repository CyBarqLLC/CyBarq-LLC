import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentForm } from "@/components/finance/document-form";
import type { LineItemDraft } from "@/components/finance/line-items-editor";
import { clientOptions, invoiceItems, projectOptions } from "../../../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requirePermission("finance.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();
  // Issued invoices are immutable: no edit UI, send the viewer to the detail page.
  if (invoice.status !== "draft") redirect(`/${locale}/app/finance/invoices/${invoice.id}`);

  const [items, clients, projects] = await Promise.all([invoiceItems(supabase, invoice.id), clientOptions(supabase, locale), projectOptions(supabase, locale)]);
  const drafts: LineItemDraft[] = items.map((it, i) => ({
    key: `init-${i}`,
    description_en: it.description_en,
    description_ar: it.description_ar ?? "",
    quantity: String(it.quantity),
    unit_price: String(it.unit_price),
  }));

  return (
    <div>
      <PageHeader title={t("invoices.edit")} eyebrow={<Link href={`/app/finance/invoices/${invoice.id}`} className="hover:text-azure">{invoice.number ?? t("invoices.draftLabel")}</Link>} />
      <DocumentForm
        kind="invoice"
        mode="edit"
        values={{
          id: invoice.id,
          client_id: invoice.client_id,
          project_id: invoice.project_id,
          language: invoice.language,
          currency: invoice.currency,
          tax_rate: invoice.tax_rate,
          title_en: invoice.title_en,
          title_ar: invoice.title_ar,
          notes_en: invoice.notes_en,
          notes_ar: invoice.notes_ar,
          terms_en: invoice.terms_en,
          terms_ar: invoice.terms_ar,
          date: invoice.due_date,
        }}
        items={drafts}
        clients={clients}
        projects={projects}
        locale={locale}
        cancelHref={`/app/finance/invoices/${invoice.id}`}
      />
    </div>
  );
}
