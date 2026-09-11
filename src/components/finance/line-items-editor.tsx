"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils/format";
import { ITEM_FIELDS } from "@/lib/validation/finance";

export type LineItemDraft = {
  key: string;
  description_en: string;
  description_ar: string;
  quantity: string;
  unit_price: string;
};

let counter = 0;
export function newLineItem(partial: Partial<Omit<LineItemDraft, "key">> = {}): LineItemDraft {
  counter += 1;
  return { key: `row-${counter}`, description_en: "", description_ar: "", quantity: "1", unit_price: "", ...partial };
}

function num(v: string): number {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

type Props = {
  initial: LineItemDraft[];
  currency: string;
  locale: Locale;
};

/**
 * Editable line items. Rows are plain inputs with repeated names so the
 * enclosing server action form submits them without any client serialisation.
 */
export function LineItemsEditor({ initial, currency, locale }: Props) {
  const t = useTranslations("finance.items");
  // Deterministic first row so server and client render the same ids.
  const [rows, setRows] = React.useState<LineItemDraft[]>(() =>
    initial.length > 0 ? initial : [{ key: "row-initial", description_en: "", description_ar: "", quantity: "1", unit_price: "" }],
  );

  const update = (key: string, patch: Partial<LineItemDraft>) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) => setRows((prev) => (prev.length === 1 ? [newLineItem()] : prev.filter((r) => r.key !== key)));
  const add = () => setRows((prev) => [...prev, newLineItem()]);

  const subtotal = rows.reduce((sum, r) => sum + num(r.quantity) * num(r.unit_price), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden md:grid md:grid-cols-[1fr_6rem_8rem_8rem_2.75rem] md:gap-3 md:px-1 text-label text-slate">
        <span>{t("description")}</span>
        <span className="text-end">{t("quantity")}</span>
        <span className="text-end">{t("unitPrice")}</span>
        <span className="text-end">{t("amount")}</span>
        <span className="sr-only">{t("remove")}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const amount = num(row.quantity) * num(row.unit_price);
          const id = (field: string) => `item-${row.key}-${field}`;
          return (
            <li key={row.key} className="grid grid-cols-1 gap-3 border border-fog bg-white p-3 md:grid-cols-[1fr_6rem_8rem_8rem_2.75rem] md:items-start md:border-0 md:p-1">
              <div className="flex flex-col gap-2">
                <span className="text-label text-slate md:hidden">{t("line", { n: index + 1 })}</span>
                <Label htmlFor={id("en")} className="md:sr-only">{t("descriptionEn")}</Label>
                <Input id={id("en")} name={ITEM_FIELDS.description_en} value={row.description_en} onChange={(e) => update(row.key, { description_en: e.target.value })} placeholder={t("descriptionEn")} required maxLength={500} />
                <Label htmlFor={id("ar")} className="md:sr-only">{t("descriptionAr")}</Label>
                <Input id={id("ar")} name={ITEM_FIELDS.description_ar} value={row.description_ar} onChange={(e) => update(row.key, { description_ar: e.target.value })} placeholder={t("descriptionAr")} dir="rtl" maxLength={500} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={id("qty")} className="md:sr-only">{t("quantity")}</Label>
                <Input id={id("qty")} name={ITEM_FIELDS.quantity} value={row.quantity} onChange={(e) => update(row.key, { quantity: e.target.value })} inputMode="decimal" className="md:text-end" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={id("price")} className="md:sr-only">{t("unitPrice")}</Label>
                <Input id={id("price")} name={ITEM_FIELDS.unit_price} value={row.unit_price} onChange={(e) => update(row.key, { unit_price: e.target.value })} inputMode="decimal" className="md:text-end" required />
              </div>
              <div className="flex items-center justify-between gap-2 md:h-11 md:justify-end">
                <span className="text-label text-slate md:hidden">{t("amount")}</span>
                <span className="text-body tabular-nums">{formatMoney(amount, currency, locale)}</span>
              </div>
              <div className="flex md:h-11 md:items-center">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(row.key)} aria-label={t("remove")}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus aria-hidden /> {t("add")}
        </Button>
        <p className="text-small text-slate">
          {t("amount")}: <span className="font-medium text-graphite tabular-nums">{formatMoney(subtotal, currency, locale)}</span>
        </p>
      </div>
    </div>
  );
}
