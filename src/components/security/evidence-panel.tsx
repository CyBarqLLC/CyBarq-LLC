"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Paperclip } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { requestEvidenceUpload, registerEvidence, deleteEvidence } from "@/lib/actions/security";
import { formatDate, displayFileName } from "@/lib/utils/format";
import { FileUpload } from "@/components/ui/file-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { ConfirmAction } from "./confirm-action";

export type EvidenceRow = { id: string; caption: string | null; mime_type: string | null; size_bytes: number | null; created_at: string; storage_path: string };

type Props = { findingId: string; evidence: EvidenceRow[]; canWrite: boolean };

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function EvidencePanel({ findingId, evidence, canWrite }: Props) {
  const t = useTranslations("security.evidence");
  const tc = useTranslations("common");
  const tu = useTranslations("common.upload");
  const locale = useLocale() as Locale;
  const [caption, setCaption] = React.useState("");

  return (
    <div className="flex flex-col gap-5">
      {evidence.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyDescription")} />
      ) : (
        <ul className="flex flex-col divide-y divide-fog border border-fog bg-white">
          {evidence.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <Paperclip className="size-4 shrink-0 text-slate" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="truncate text-body">{e.caption ?? displayFileName(e.storage_path)}</div>
                <div className="text-small text-slate">
                  {formatDate(e.created_at, locale)}
                  {e.size_bytes ? ` · ${formatSize(e.size_bytes)}` : ""}
                </div>
              </div>
              <a href={`/api/files/evidence/${e.id}`} className="touch inline-flex items-center gap-1 px-2 text-small text-azure hover:underline" rel="noopener">
                <Download className="size-4" aria-hidden /> {tc("download")}
              </a>
              {canWrite ? (
                <ConfirmAction action={deleteEvidence} fields={{ id: e.id }} title={t("deleteTitle")} confirmLabel={tc("delete")} triggerLabel={tc("delete")} triggerVariant="ghost" />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {canWrite ? (
        <div className="flex flex-col gap-4 border border-fog bg-white p-5">
          <h3 className="text-h3">{t("add")}</h3>
          <Field label={t("caption")} htmlFor="evidence-caption" hint={t("captionHint")}>
            <Input id="evidence-caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} />
          </Field>
          <FileUpload
            requestTicket={(file) => requestEvidenceUpload(findingId, file)}
            onUploaded={async (r) => {
              const saved = await registerEvidence({ finding_id: findingId, path: r.path, name: r.name, size: r.size, type: r.type, caption: caption.trim() || undefined });
              if (saved.ok) setCaption("");
              return saved;
            }}
            maxSizeMb={50}
            labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove"), submit: tu("submit") }}
          />
        </div>
      ) : null}
    </div>
  );
}
