"use client";

import { useTranslations } from "next-intl";
import { FileDown, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enums } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fieldError } from "@/components/ui/form-message";
import { issueQuote, setQuoteStatus, voidQuote, duplicateQuote, convertQuoteToInvoice, deleteDraftQuote } from "@/lib/actions/finance";
import { ActionForm, ActionDialog } from "./action-form";

type Props = {
  quote: { id: string; status: Enums<"quote_status">; updated_at: string; valid_until: string | null; itemCount: number };
  canWrite: boolean;
  canIssue: boolean;
  today: string;
};

/** Action bar for a quote. Only offers what the status and permissions allow. */
export function QuoteActions({ quote, canWrite, canIssue, today }: Props) {
  const t = useTranslations("finance.actions");
  const isDraft = quote.status === "draft";
  const isSent = quote.status === "sent";
  const voidable = isSent || quote.status === "accepted" || quote.status === "declined" || quote.status === "expired";

  return (
    <div className="flex flex-wrap items-start gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/documents/quotes/${quote.id}`} target="_blank" rel="noopener">
          <FileDown aria-hidden /> {t("pdf")}
        </a>
      </Button>

      {isDraft && canWrite ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/app/finance/quotes/${quote.id}/edit`}>
            <Pencil aria-hidden /> {t("edit")}
          </Link>
        </Button>
      ) : null}

      {isDraft && canIssue ? (
        <ActionDialog
          action={issueQuote}
          fields={{ id: quote.id, expected_updated_at: quote.updated_at }}
          trigger={t("issueQuote")}
          triggerVariant="primary"
          title={t("issueQuote")}
          description={quote.itemCount === 0 ? t("issueNeedsItems") : t("issueHint")}
          submitLabel={t("issue")}
          cancelLabel={t("cancel")}
        >
          {(result) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("issueDate")} htmlFor="issue_date" error={fieldError(result, "issue_date")}>
                <Input id="issue_date" name="issue_date" type="date" defaultValue={today} />
              </Field>
              <Field label={t("validUntil")} htmlFor="valid_until" error={fieldError(result, "valid_until")}>
                <Input id="valid_until" name="valid_until" type="date" defaultValue={quote.valid_until ?? ""} />
              </Field>
            </div>
          )}
        </ActionDialog>
      ) : null}

      {isSent && canWrite ? (
        <>
          <ActionForm action={setQuoteStatus} fields={{ id: quote.id, status: "accepted" }} label={t("markAccepted")} variant="primary" />
          <ActionForm action={setQuoteStatus} fields={{ id: quote.id, status: "declined" }} label={t("markDeclined")} />
          <ActionForm action={setQuoteStatus} fields={{ id: quote.id, status: "expired" }} label={t("markExpired")} />
        </>
      ) : null}

      {quote.status === "accepted" && canWrite ? (
        <ActionForm action={convertQuoteToInvoice} fields={{ id: quote.id }} label={t("convert")} variant="primary" confirm={t("convertHint")} />
      ) : null}

      {canWrite ? <ActionForm action={duplicateQuote} fields={{ id: quote.id }} label={t("duplicate")} /> : null}

      {voidable && canIssue ? (
        <ActionDialog
          action={voidQuote}
          fields={{ id: quote.id }}
          trigger={t("void")}
          title={t("voidQuote")}
          description={t("voidQuoteHint")}
          submitLabel={t("void")}
          cancelLabel={t("cancel")}
          submitVariant="danger"
        />
      ) : null}

      {isDraft && canWrite ? (
        <ActionForm action={deleteDraftQuote} fields={{ id: quote.id }} label={t("deleteDraft")} variant="ghost" confirm={t("deleteConfirm")} />
      ) : null}
    </div>
  );
}
