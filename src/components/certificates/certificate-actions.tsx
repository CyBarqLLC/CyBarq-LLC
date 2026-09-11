"use client";

import { useTranslations } from "next-intl";
import { FileDown, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enums } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fieldError } from "@/components/ui/form-message";
import { issueCertificate, revokeCertificate, emailCertificate, deleteDraftCertificate } from "@/lib/actions/certificates";
import { ActionForm, ActionDialog } from "@/components/finance/action-form";

type Props = {
  certificate: { id: string; status: Enums<"certificate_status">; updated_at: string; hasEmail: boolean };
  canIssue: boolean;
  today: string;
};

/** Action bar for a certificate: PDF, edit, issue, email, revoke, delete draft. */
export function CertificateActions({ certificate, canIssue, today }: Props) {
  const t = useTranslations("certificates.actions");
  const isDraft = certificate.status === "draft";
  const isIssued = certificate.status === "issued";

  return (
    <div className="flex flex-wrap items-start gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/documents/certificates/${certificate.id}`} target="_blank" rel="noopener">
          <FileDown aria-hidden /> {t("pdf")}
        </a>
      </Button>

      {isDraft && canIssue ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/app/certificates/${certificate.id}/edit`}>
            <Pencil aria-hidden /> {t("edit")}
          </Link>
        </Button>
      ) : null}

      {isDraft && canIssue ? (
        <ActionDialog
          action={issueCertificate}
          fields={{ id: certificate.id, expected_updated_at: certificate.updated_at }}
          trigger={t("issue")}
          triggerVariant="primary"
          title={t("issue")}
          description={t("issueHint")}
          submitLabel={t("issue")}
          cancelLabel={t("cancel")}
        >
          {(result) => (
            <Field label={t("issueDate")} htmlFor="issue_date" error={fieldError(result, "issue_date")}>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={today} />
            </Field>
          )}
        </ActionDialog>
      ) : null}

      {isIssued && canIssue && certificate.hasEmail ? (
        <ActionForm action={emailCertificate} fields={{ id: certificate.id }} label={t("email")} variant="primary" confirm={t("emailHint")} successMessage={(d) => t("emailed", { email: d.email })} />
      ) : null}

      {isIssued && canIssue ? (
        <ActionDialog
          action={revokeCertificate}
          fields={{ id: certificate.id }}
          trigger={t("revoke")}
          title={t("revoke")}
          description={t("revokeHint")}
          submitLabel={t("revoke")}
          cancelLabel={t("cancel")}
          submitVariant="danger"
        >
          {(result) => (
            <Field label={t("revokeReason")} htmlFor="reason" required error={fieldError(result, "reason")}>
              <Textarea id="reason" name="reason" required minLength={3} maxLength={500} aria-invalid={!!fieldError(result, "reason")} />
            </Field>
          )}
        </ActionDialog>
      ) : null}

      {isDraft && canIssue ? (
        <ActionForm action={deleteDraftCertificate} fields={{ id: certificate.id }} label={t("deleteDraft")} variant="ghost" confirm={t("deleteConfirm")} />
      ) : null}
    </div>
  );
}
