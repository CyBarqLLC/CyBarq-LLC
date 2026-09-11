"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { ImpactItem } from "@/lib/validation/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImpactEditorProps = { name: string; defaultItems: ImpactItem[]; error?: string };

/**
 * Rows of measurable outcomes for a case study. Serialised as JSON into one
 * hidden field; the action validates the structure before storing it as jsonb.
 */
export function ImpactEditor({ name, defaultItems, error }: ImpactEditorProps) {
  const t = useTranslations("content.form.impact");
  const [items, setItems] = React.useState<ImpactItem[]>(defaultItems);

  const update = (index: number, patch: Partial<ImpactItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const add = () => setItems((prev) => [...prev, { label_en: "", label_ar: "", value: "", verified: false }]);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length === 0 ? <p className="text-small text-slate">{t("empty")}</p> : null}
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="grid gap-3 border border-fog bg-white p-4 md:grid-cols-[1fr_1fr_8rem_auto_auto] md:items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`impact-${i}-label-en`}>{t("labelEn")}</Label>
              <Input id={`impact-${i}-label-en`} value={item.label_en} onChange={(e) => update(i, { label_en: e.target.value })} maxLength={120} dir="ltr" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`impact-${i}-label-ar`}>{t("labelAr")}</Label>
              <Input id={`impact-${i}-label-ar`} value={item.label_ar} onChange={(e) => update(i, { label_ar: e.target.value })} maxLength={120} dir="rtl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`impact-${i}-value`}>{t("value")}</Label>
              <Input id={`impact-${i}-value`} value={item.value} onChange={(e) => update(i, { value: e.target.value })} maxLength={60} dir="ltr" placeholder="40%" />
            </div>
            <label className="flex h-11 items-center gap-2 text-small">
              <input type="checkbox" checked={item.verified} onChange={(e) => update(i, { verified: e.target.checked })} className="size-4 accent-graphite" />
              {t("verified")}
            </label>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("remove")}>
              <Trash2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      {error ? <p role="alert" className="text-small text-danger">{error}</p> : null}
      <div>
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={items.length >= 20}>
          <Plus aria-hidden /> {t("add")}
        </Button>
      </div>
      <p className="text-small text-slate">{t("verifiedHint")}</p>
    </div>
  );
}
