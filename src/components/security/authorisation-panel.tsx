"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { getAuthorisationDownloadUrl, requestAuthorisationUpload, setAuthorisationDocument } from "@/lib/actions/security";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

type AuthorisationPanelProps = {
  engagementId: string;
  hasDocument: boolean;
  fileName: string | null;
  canWrite: boolean;
};

/** Signed authorisation letter: private upload and a short lived signed download. */
export function AuthorisationPanel({ engagementId, hasDocument, fileName, canWrite }: AuthorisationPanelProps) {
  const t = useTranslations("security.authorisation");
  const tu = useTranslations("common.upload");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const download = async () => {
    setBusy(true);
    setError(null);
    const result = await getAuthorisationDownloadUrl(engagementId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.assign(result.data.url);
  };

  return (
    <div className="flex flex-col gap-4">
      {hasDocument ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-fog bg-white px-4 py-3">
          <span className="min-w-0 truncate text-small">{fileName ?? t("document")}</span>
          <Button type="button" size="sm" variant="outline" onClick={download} loading={busy}>
            <Download aria-hidden /> {t("download")}
          </Button>
        </div>
      ) : (
        <p className="text-small text-slate">{t("none")}</p>
      )}
      {error ? <p role="alert" className="text-small text-danger">{error}</p> : null}
      {canWrite ? (
        <FileUpload
          requestTicket={(file) => requestAuthorisationUpload(engagementId, file)}
          onUploaded={(r) => setAuthorisationDocument(engagementId, { path: r.path })}
          accept="application/pdf,image/*"
          maxSizeMb={25}
          labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove"), submit: tu("submit") }}
        />
      ) : null}
    </div>
  );
}
