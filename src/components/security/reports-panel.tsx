"use client";

import * as React from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Tables } from "@/lib/supabase/database.types";
import { requestReportUpload, registerReport, finaliseReport, setReportClientVisible, deleteReport } from "@/lib/actions/security";
import { formatDateTime } from "@/lib/utils/format";
import { FileUpload } from "@/components/ui/file-upload";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { EmptyState } from "@/components/ui/states";
import { ConfirmAction } from "./confirm-action";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type ReportRow = Pick<Tables<"engagement_reports">, "id" | "version" | "title" | "status" | "client_visible" | "issued_at" | "created_at"> & {
  uploader: string | null;
};

type Props = { engagementId: string; reports: ReportRow[]; canWrite: boolean; canReport: boolean };

export function ReportsPanel({ engagementId, reports, canWrite, canReport }: Props) {
  const t = useTranslations("security.reports");
  const tc = useTranslations("common");
  const tu = useTranslations("common.upload");
  const locale = useLocale() as Locale;
  const [title, setTitle] = React.useState("");
  const nextVersion = reports.reduce((max, r) => Math.max(max, r.version), 0) + 1;

  return (
    <div className="flex flex-col gap-5">
      {reports.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyDescription")} />
      ) : (
        <ul className="flex flex-col divide-y divide-fog border border-fog bg-white">
          {reports.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
              <FileText className="hidden size-5 shrink-0 text-slate lg:block" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body font-medium">{r.title}</span>
                  <Badge variant="outline">{t("version", { n: r.version })}</Badge>
                  <Status value={r.status} label={r.status === "final" ? t("final") : t("draft")} />
                  <Badge variant={r.client_visible ? "blue" : "neutral"}>{r.client_visible ? t("visibleToClient") : t("internalOnly")}</Badge>
                </div>
                <div className="mt-1 text-small text-slate">
                  {r.issued_at ? t("issuedAt", { date: formatDateTime(r.issued_at, locale) }) : t("uploadedAt", { date: formatDateTime(r.created_at, locale) })}
                  {r.uploader ? ` · ${r.uploader}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a href={`/api/files/reports/${r.id}`} className="touch inline-flex items-center gap-1 border border-fog px-3 text-small hover:bg-surface" rel="noopener">
                  <Download className="size-4" aria-hidden /> {tc("download")}
                </a>
                {canWrite && (r.status === "draft" || canReport) ? <VisibilityToggle engagementId={engagementId} report={r} /> : null}
                {canReport && r.status === "draft" ? (
                  <ConfirmAction
                    action={finaliseReport}
                    fields={{ id: r.id, engagement_id: engagementId }}
                    title={t("finaliseTitle")}
                    description={t("finaliseDescription")}
                    confirmLabel={t("finalise")}
                    triggerLabel={t("finalise")}
                    triggerVariant="primary"
                    destructive={false}
                  />
                ) : null}
                {canWrite && r.status === "draft" ? (
                  <ConfirmAction action={deleteReport} fields={{ id: r.id, engagement_id: engagementId }} title={t("deleteTitle")} confirmLabel={tc("delete")} triggerLabel={tc("delete")} triggerVariant="ghost" />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {canWrite ? (
        <div className="flex flex-col gap-4 border border-fog bg-white p-5">
          <div>
            <h3 className="text-h3">{t("upload")}</h3>
            <p className="mt-1 text-small text-slate">{t("uploadHint", { n: nextVersion })}</p>
          </div>
          <Field label={t("title")} htmlFor="report-title" required>
            <Input id="report-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
          </Field>
          <FileUpload
            requestTicket={async (file) => {
              if (!title.trim()) return { ok: false, error: t("titleRequired") };
              return requestReportUpload(engagementId, file);
            }}
            onUploaded={async (r) => {
              const saved = await registerReport({ engagement_id: engagementId, title: title.trim(), path: r.path });
              if (saved.ok) setTitle("");
              return saved;
            }}
            accept="application/pdf"
            maxSizeMb={100}
            labels={{ choose: tu("choose"), drop: tu("drop"), uploading: tu("uploading"), done: tu("done"), tooLarge: tu("tooLarge"), remove: tu("remove"), submit: tu("submit") }}
          />
        </div>
      ) : null}
    </div>
  );
}

function VisibilityToggle({ engagementId, report }: { engagementId: string; report: ReportRow }) {
  const [result, formAction] = useActionState(setReportClientVisible, null);
  const t = useTranslations("security.reports");
  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={report.id} />
      <input type="hidden" name="engagement_id" value={engagementId} />
      {report.client_visible ? null : <input type="hidden" name="client_visible" value="true" />}
      <SubmitButton size="sm" variant="outline">{report.client_visible ? t("hideFromClient") : t("shareWithClient")}</SubmitButton>
      <FormMessage result={result} />
    </ServerActionForm>
  );
}
