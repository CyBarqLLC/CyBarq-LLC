import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { formatMoney, formatNumber } from "@/lib/utils/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ItemRow = {
  id: string;
  description_en: string;
  description_ar: string | null;
  quantity: number;
  unit_price: number;
  amount: number | null;
};

type Totals = {
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  /** Invoices only. */
  amount_paid?: number;
};

/** Read only line items with the totals block. Server component. */
export async function DocumentItems({ items, currency, totals, showPaid = false }: { items: ItemRow[]; currency: string; totals: Totals; showPaid?: boolean }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finance");
  const money = (n: number) => formatMoney(n, currency, locale);
  const paid = totals.amount_paid ?? 0;
  const balance = Math.max(0, totals.total - paid);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="border border-fog bg-white px-4 py-6 text-center text-small text-slate">{t("items.empty")}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {items.map((it) => (
              <li key={it.id} className="border border-fog bg-white p-4">
                <p className="text-body">{pick(it, "description", locale)}</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
                  <dt className="text-slate">{t("items.quantity")}</dt>
                  <dd className="tabular-nums">{formatNumber(it.quantity, locale, Number.isInteger(it.quantity) ? 0 : 2)}</dd>
                  <dt className="text-slate">{t("items.unitPrice")}</dt>
                  <dd className="tabular-nums">{money(it.unit_price)}</dd>
                  <dt className="text-slate">{t("items.amount")}</dt>
                  <dd className="font-medium tabular-nums">{money(it.amount ?? it.quantity * it.unit_price)}</dd>
                </dl>
              </li>
            ))}
          </ul>
          <div className="hidden border border-fog bg-white md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("items.description")}</TableHead>
                  <TableHead className="text-end">{t("items.quantity")}</TableHead>
                  <TableHead className="text-end">{t("items.unitPrice")}</TableHead>
                  <TableHead className="text-end">{t("items.amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{pick(it, "description", locale)}</TableCell>
                    <TableCell className="text-end tabular-nums">{formatNumber(it.quantity, locale, Number.isInteger(it.quantity) ? 0 : 2)}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(it.unit_price)}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(it.amount ?? it.quantity * it.unit_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <dl className="ms-auto grid w-full max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 border border-fog bg-white p-4 text-small">
        <dt className="text-slate">{t("totals.subtotal")}</dt>
        <dd className="text-end tabular-nums">{money(totals.subtotal)}</dd>
        <dt className="text-slate">{t("totals.tax", { rate: formatNumber(totals.tax_rate, locale, Number.isInteger(totals.tax_rate) ? 0 : 2) })}</dt>
        <dd className="text-end tabular-nums">{money(totals.tax_amount)}</dd>
        <dt className="border-t border-graphite pt-2 text-body font-medium text-graphite">{t("totals.total")}</dt>
        <dd className="border-t border-graphite pt-2 text-end text-body font-medium tabular-nums">{money(totals.total)}</dd>
        {showPaid ? (
          <>
            <dt className="text-slate">{t("totals.paid")}</dt>
            <dd className="text-end tabular-nums">{money(paid)}</dd>
            <dt className="font-medium text-graphite">{t("totals.balance")}</dt>
            <dd className="text-end font-medium tabular-nums">{money(balance)}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
