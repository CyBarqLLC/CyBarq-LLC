"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { requestPortalDocumentUpload, registerPortalDocument } from "@/lib/actions/portal";
import { FileUpload } from "@/components/ui/file-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Client side upload into a visible project. The server issues the ticket only for projects the client may see. */
export function PortalDocumentUpload({ projectId }: { projectId: string }) {
  const t = useTranslations("portal.documents");
  const tu = useTranslations("common.upload");
  const [title, setTitle] = React.useState("");
  return (
    <div className="flex flex-col gap-4 border border-fog bg-white p-5">
      <div>
        <h3 className="text-h3">{t("uploadTitle")}</h3>
        <p className="mt-1 text-small text-slate">{t("uploadHint")}</p>
      </div>
      <Field label={t("documentTitle")} htmlFor="portal-doc-title" hint={t("documentTitleHint")}>
        <Input id="portal-doc-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
      </Field>
      <FileUpload
        requestTicket={(file) => requestPortalDocumentUpload(projectId, file)}
        onUploaded={async (r) => {
          const saved = await registerPortalDocument({ project_id: projectId, path: r.path, name: r.name, size: r.size, type: r.type, title: title.trim() || undefined });
          if (saved.ok) setTitle("");
          return saved;
        }}
        maxSizeMb={50}
        labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove"), submit: tu("submit") }}
      />
    </div>
  );
}
