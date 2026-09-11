"use client";

import * as React from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { createAsset, updateAsset, deleteAsset } from "@/lib/actions/security";
import { ASSET_TYPES } from "@/lib/validation/security";
import { ASSET_TYPE_LABELS, label } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ConfirmAction } from "./confirm-action";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type AssetRow = Pick<Tables<"engagement_assets">, "id" | "name" | "type" | "identifier" | "in_scope" | "notes">;

export function assetTypeLabel(type: Tables<"engagement_assets">["type"], locale: Locale): string {
  return label(ASSET_TYPE_LABELS, type, locale);
}

type AssetsPanelProps = { engagementId: string; assets: AssetRow[]; canWrite: boolean };

export function AssetsPanel({ engagementId, assets, canWrite }: AssetsPanelProps) {
  const t = useTranslations("security.scope");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  return (
    <div className="flex flex-col gap-4">
      {canWrite ? (
        <div className="flex justify-end">
          <AssetDialog engagementId={engagementId} trigger={<Button size="sm"><Plus aria-hidden /> {t("add")}</Button>} />
        </div>
      ) : null}
      {assets.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyDescription")} />
      ) : (
        <ul className="flex flex-col divide-y divide-fog border border-fog bg-white">
          {assets.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body font-medium">{a.name}</span>
                  <Badge variant="outline">{assetTypeLabel(a.type, locale)}</Badge>
                  <Badge variant={a.in_scope ? "success" : "neutral"}>{a.in_scope ? t("inScope") : t("outOfScope")}</Badge>
                </div>
                {a.identifier ? <div className="mt-1 truncate font-mono text-small text-slate" dir="ltr">{a.identifier}</div> : null}
                {a.notes ? <p className="mt-1 text-small text-slate">{a.notes}</p> : null}
              </div>
              {canWrite ? (
                <div className="flex shrink-0 gap-2">
                  <AssetDialog engagementId={engagementId} asset={a} trigger={<Button size="sm" variant="ghost" aria-label={tc("edit")}><Pencil aria-hidden /> {tc("edit")}</Button>} />
                  <ConfirmAction
                    action={deleteAsset}
                    fields={{ id: a.id, engagement_id: engagementId }}
                    title={t("deleteTitle")}
                    description={t("deleteDescription")}
                    confirmLabel={tc("delete")}
                    triggerLabel={tc("delete")}
                    triggerVariant="ghost"
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetDialog({ engagementId, asset, trigger }: { engagementId: string; asset?: AssetRow; trigger: React.ReactNode }) {
  const t = useTranslations("security.scope");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [open, setOpen] = React.useState(false);
  const boundAction = React.useMemo(
    () => (asset ? (prev: ActionResult | null, fd: FormData) => updateAsset(asset.id, prev, fd) : createAsset),
    [asset],
  );
  const [result, formAction] = useActionState(boundAction, null);
  const invalid = (name: string) => !!fieldError(result, name);

  React.useEffect(() => {
    if (result?.ok) setOpen(false);
  }, [result]);

  const prefix = asset ? `asset-${asset.id}` : "asset-new";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={asset ? t("editTitle") : t("addTitle")}>
        <ServerActionForm action={formAction} result={result} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="engagement_id" value={engagementId} />
          <Field label={t("name")} htmlFor={`${prefix}-name`} error={fieldError(result, "name")} required>
            <Input id={`${prefix}-name`} name="name" defaultValue={asset?.name ?? ""} required maxLength={200} aria-invalid={invalid("name")} />
          </Field>
          <Field label={t("type")} htmlFor={`${prefix}-type`} error={fieldError(result, "type")} required>
            <NativeSelect id={`${prefix}-type`} name="type" defaultValue={asset?.type ?? "web_app"}>
              {ASSET_TYPES.map((v) => (
                <option key={v} value={v}>{ASSET_TYPE_LABELS[v][locale]}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("identifier")} htmlFor={`${prefix}-identifier`} hint={t("identifierHint")} error={fieldError(result, "identifier")}>
            <Input id={`${prefix}-identifier`} name="identifier" defaultValue={asset?.identifier ?? ""} maxLength={500} dir="ltr" className="font-mono" aria-invalid={invalid("identifier")} />
          </Field>
          <label className="flex items-center gap-3 text-body">
            <input type="checkbox" name="in_scope" defaultChecked={asset ? asset.in_scope : true} className="size-5 accent-graphite" />
            {t("inScope")}
          </label>
          <Field label={tc("notes")} htmlFor={`${prefix}-notes`} error={fieldError(result, "notes")}>
            <Textarea id={`${prefix}-notes`} name="notes" defaultValue={asset?.notes ?? ""} maxLength={2000} className="min-h-20" aria-invalid={invalid("notes")} />
          </Field>
          <FormMessage result={result} />
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">{tc("cancel")}</Button>
            </DialogClose>
            <SubmitButton>{asset ? tc("saveChanges") : t("addSubmit")}</SubmitButton>
          </DialogFooter>
        </ServerActionForm>
      </DialogContent>
    </Dialog>
  );
}
