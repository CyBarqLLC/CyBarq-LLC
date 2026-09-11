import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { QUOTE_STATUS_LABELS, currencyOption, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { DocumentItems } from "@/components/finance/document-items";
import { DetailList, ImmutableNotice, Section } from "@/components/finance/detail-blocks";
import { HistoryList } from "@/components/finance/history-list";
import { QuoteActions } from "@/components/finance/quote-actions";
import { documentHistory, quoteItems, todayIso } from "../../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const viewer = await requirePermission("finance.read");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const supabase = await createClient();

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) notFound();

  const [items, { data: client }, { data: project }, { data: invoices }, history] = await Promise.all([
    quoteItems(supabase, quote.id),
    supabase.from("clients").select("id, name_en, name_ar").eq("id", quote.client_id).maybeSingle(),
    quote.project_id ? supabase.from("projects").select("id, code, name_en, name_ar").eq("id", quote.project_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("invoices").select("id, number, status").eq("quote_id", quote.id).order("created_at", { ascending: false }),
    documentHistory(supabase, "quote", quote.id, viewer.can("audit.read")),
  ]);

  const title = quote.number ?? t("quotes.draftLabel");
  const isDraft = quote.status === "draft";

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={title}
        description={pick(quote, "title", locale) || undefined}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/finance/quotes" className="hover:text-azure">{t("quotes.title")}</Link>
            <Status value={quote.status} label={label(QUOTE_STATUS_LABELS, quote.status, locale)} />
          </span>
        }
        actions={
          <QuoteActions
            quote={{ id: quote.id, status: quote.status, updated_at: quote.updated_at, valid_until: quote.valid_until, itemCount: items.length }}
            canWrite={viewer.can("finance.write")}
            canIssue={viewer.can("finance.issue")}
            today={todayIso()}
          />
        }
      />

      {!isDraft ? <ImmutableNotice title={t("immutable.title")} body={t("immutable.quote")} /> : null}

      <Section title={t("detail.overview")}>
        <DetailList
          items={[
            { label: t("detail.client"), value: client ? <Link href={`/app/clients/${client.id}`} className="text-azure hover:underline">{pick(client, "name", locale)}</Link> : null },
            { label: t("detail.project"), value: project ? <Link href={`/app/projects/${project.id}`} className="text-azure hover:underline">{`${project.code} · ${pick(project, "name", locale)}`}</Link> : null },
            { label: t("detail.issueDate"), value: formatDate(quote.issue_date, locale, "long") },
            { label: t("detail.validUntil"), value: formatDate(quote.valid_until, locale, "long") },
            { label: t("detail.currency"), value: currencyOption(quote.currency, locale) },
            { label: t("detail.language"), value: t(`languages.${quote.language}`) },
            { label: t("detail.created"), value: formatDateTime(quote.created_at, locale) },
            {
              label: t("invoices.title"),
              value:
                invoices && invoices.length > 0 ? (
                  <span className="flex flex-wrap gap-2">
                    {invoices.map((inv) => (
                      <Link key={inv.id} href={`/app/finance/invoices/${inv.id}`} className="text-azure hover:underline">
                        {inv.number ?? t("invoices.draftLabel")}
                      </Link>
                    ))}
                  </span>
                ) : null,
            },
          ]}
        />
      </Section>

      <Section title={t("detail.items")}>
        <DocumentItems items={items} currency={quote.currency} totals={{ subtotal: quote.subtotal, tax_rate: quote.tax_rate, tax_amount: quote.tax_amount, total: quote.total }} />
      </Section>

      {pick(quote, "notes", locale) || pick(quote, "terms", locale) ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {pick(quote, "notes", locale) ? (
            <Section title={t("detail.notes")}>
              <p className="whitespace-pre-line text-body">{pick(quote, "notes", locale)}</p>
            </Section>
          ) : null}
          {pick(quote, "terms", locale) ? (
            <Section title={t("detail.terms")}>
              <p className="whitespace-pre-line text-body">{pick(quote, "terms", locale)}</p>
            </Section>
          ) : null}
        </div>
      ) : null}

      {viewer.can("audit.read") ? (
        <Section title={t("history.title")}>
          <HistoryList rows={history} locale={locale} emptyLabel={t("history.empty")} actorLabel={t("history.actor")} entityType="quote" transitionLabel={(from, to) => t("history.transition", { from, to })} />
        </Section>
      ) : null}
    </div>
  );
}
