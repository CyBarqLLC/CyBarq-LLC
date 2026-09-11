import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentForm } from "@/components/finance/document-form";
import type { LineItemDraft } from "@/components/finance/line-items-editor";
import { clientOptions, projectOptions, quoteItems } from "../../../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requirePermission("finance.write");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) notFound();
  // Issued quotes are immutable: no edit UI, send the viewer to the detail page.
  if (quote.status !== "draft") redirect(`/${locale}/app/finance/quotes/${quote.id}`);

  const [items, clients, projects] = await Promise.all([quoteItems(supabase, quote.id), clientOptions(supabase, locale), projectOptions(supabase, locale)]);
  const drafts: LineItemDraft[] = items.map((it, i) => ({
    key: `init-${i}`,
    description_en: it.description_en,
    description_ar: it.description_ar ?? "",
    quantity: String(it.quantity),
    unit_price: String(it.unit_price),
  }));

  return (
    <div>
      <PageHeader title={t("quotes.edit")} eyebrow={<Link href={`/app/finance/quotes/${quote.id}`} className="hover:text-azure">{quote.number ?? t("quotes.draftLabel")}</Link>} />
      <DocumentForm
        kind="quote"
        mode="edit"
        values={{
          id: quote.id,
          client_id: quote.client_id,
          project_id: quote.project_id,
          language: quote.language,
          currency: quote.currency,
          tax_rate: quote.tax_rate,
          title_en: quote.title_en,
          title_ar: quote.title_ar,
          notes_en: quote.notes_en,
          notes_ar: quote.notes_ar,
          terms_en: quote.terms_en,
          terms_ar: quote.terms_ar,
          date: quote.valid_until,
        }}
        items={drafts}
        clients={clients}
        projects={projects}
        locale={locale}
        cancelHref={`/app/finance/quotes/${quote.id}`}
      />
    </div>
  );
}
