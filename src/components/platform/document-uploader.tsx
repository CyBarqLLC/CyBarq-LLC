"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileUpload, type UploadTicket } from "@/components/ui/file-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "./enum-options";

export type DocumentMeta = { path: string; name: string; size: number; type: string; title: string; category: string; clientVisible: boolean };

type DocumentUploaderProps = {
  requestTicket: (file: { name: string; size: number; type: string }) => Promise<ActionResult<UploadTicket>>;
  register: (meta: DocumentMeta) => Promise<ActionResult<unknown>>;
  categories: Option[];
  categoryLabel: string;
  titleLabel: string;
  /** Show the client visibility checkbox (project documents only). */
  clientVisibleLabel?: string;
  maxSizeMb?: number;
  accept?: string;
  successMessage: string;
};

/**
 * Title and category are captured next to the file picker; the metadata row is
 * written only after the bytes are stored. The page refreshes on success.
 */
export function DocumentUploader({ requestTicket, register, categories, categoryLabel, titleLabel, clientVisibleLabel, maxSizeMb, accept, successMessage }: DocumentUploaderProps) {
  const t = useTranslations("common.upload");
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState(categories[0]?.value ?? "other");
  const [clientVisible, setClientVisible] = React.useState(false);
  const titleId = React.useId();
  const categoryId = React.useId();
  const visibleId = React.useId();

  const labels = { choose: t("choose"), drop: t("drop"), uploading: t("uploading"), done: t("done"), tooLarge: t("tooLarge"), remove: t("remove"), submit: t("submit") };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={titleLabel} htmlFor={titleId}>
          <Input id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </Field>
        <Field label={categoryLabel} htmlFor={categoryId}>
          <NativeSelect id={categoryId} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      {clientVisibleLabel ? (
        <div className="flex items-center gap-2">
          <Checkbox id={visibleId} checked={clientVisible} onCheckedChange={(v) => setClientVisible(v === true)} />
          <Label htmlFor={visibleId}>{clientVisibleLabel}</Label>
        </div>
      ) : null}
      <FileUpload
        accept={accept}
        maxSizeMb={maxSizeMb}
        labels={labels}
        requestTicket={async (file) => {
          const result = await requestTicket(file);
          return result.ok ? { ok: true, data: result.data } : { ok: false, error: result.error };
        }}
        onUploaded={async (file) => {
          const result = await register({ ...file, title: title.trim() || file.name, category, clientVisible });
          if (!result.ok) return { ok: false, error: result.error };
          setTitle("");
          toast.success(successMessage);
          router.refresh();
          return { ok: true };
        }}
      />
    </div>
  );
}
