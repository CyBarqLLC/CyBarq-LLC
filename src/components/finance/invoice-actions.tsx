"use client";

import { useTranslations } from "next-intl";
import { FileDown, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enums } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { fieldError } from "@/components/ui/form-message";
import { PAYMENT_METHODS } from "@/lib/validation/finance";
import { issueInvoice, voidInvoice, recordPayment, issueReplacement, sendInvoiceToClient, deleteDraftInvoice } from "@/lib/actions/finance";
import { ActionForm, ActionDialog } from "./action-form";

type Props = {
  invoice: {
    id: string;
    status: Enums<"invoice_status">;
    updated_at: string;
    due_date: string | null;
    total: number;
    amount_paid: number;
    itemCount: number;
  };
  canWrite: boolean;
  canIssue: boolean;
  today: string;
};

/** Action bar for an invoice. Only offers what the status and permissions allow. */
export function InvoiceActions({ invoice, canWrite, canIssue, today }: Props) {
  const t = useTranslations("finance.actions");
  const tp = useTranslations("finance.payment");
  const isDraft = invoice.status === "draft";
  const isVoid = invoice.status === "void";
  const payable = invoice.status === "issued" || invoice.status === "sent" || invoice.status === "partially_paid" || invoice.status === "overdue";
  const voidable = payable;
  const balance = Math.max(0, invoice.total - invoice.amount_paid);

  return (
    <div className="flex flex-wrap items-start gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/documents/invoices/${invoice.id}`} target="_blank" rel="noopener">
          <FileDown aria-hidden /> {t("pdf")}
        </a>
      </Button>

      {isDraft && canWrite ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/app/finance/invoices/${invoice.id}/edit`}>
            <Pencil aria-hidden /> {t("edit")}
          </Link>
        </Button>
      ) : null}

      {isDraft && canIssue ? (
        <ActionDialog
          action={issueInvoice}
          fields={{ id: invoice.id, expected_updated_at: invoice.updated_at }}
          trigger={t("issueInvoice")}
          triggerVariant="primary"
          title={t("issueInvoice")}
          description={invoice.itemCount === 0 ? t("issueNeedsItems") : t("issueHint")}
          submitLabel={t("issue")}
          cancelLabel={t("cancel")}
        >
          {(result) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("issueDate")} htmlFor="issue_date" error={fieldError(result, "issue_date")}>
                <Input id="issue_date" name="issue_date" type="date" defaultValue={today} />
              </Field>
              <Field label={t("dueDate")} htmlFor="due_date" error={fieldError(result, "due_date")}>
                <Input id="due_date" name="due_date" type="date" defaultValue={invoice.due_date ?? ""} />
              </Field>
            </div>
          )}
        </ActionDialog>
      ) : null}

      {(invoice.status === "issued" || invoice.status === "sent") && canWrite ? (
        <ActionForm action={sendInvoiceToClient} fields={{ id: invoice.id }} label={t("send")} variant="primary" confirm={t("sendHint")} successMessage={(d) => t("sent", { email: d.email })} />
      ) : null}

      {payable && canWrite ? (
        <ActionDialog
          action={recordPayment}
          fields={{ invoice_id: invoice.id }}
          trigger={t("recordPayment")}
          triggerVariant={invoice.status === "issued" ? "outline" : "primary"}
          title={t("recordPayment")}
          submitLabel={t("recordPayment")}
          cancelLabel={t("cancel")}
        >
          {(result) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={tp("amount")} htmlFor="amount" required error={fieldError(result, "amount")}>
                <Input id="amount" name="amount" inputMode="decimal" defaultValue={balance > 0 ? String(balance) : ""} required aria-invalid={!!fieldError(result, "amount")} />
              </Field>
              <Field label={tp("paidAt")} htmlFor="paid_at" required error={fieldError(result, "paid_at")}>
                <Input id="paid_at" name="paid_at" type="date" defaultValue={today} required />
              </Field>
              <Field label={tp("method")} htmlFor="method" error={fieldError(result, "method")}>
                <NativeSelect id="method" name="method" defaultValue="bank_transfer">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{tp(`methods.${m}`)}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={tp("reference")} htmlFor="reference" error={fieldError(result, "reference")}>
                <Input id="reference" name="reference" maxLength={120} />
              </Field>
              <Field label={tp("notes")} htmlFor="payment_notes" className="sm:col-span-2" error={fieldError(result, "notes")}>
                <Textarea id="payment_notes" name="notes" maxLength={500} className="min-h-20" />
              </Field>
            </div>
          )}
        </ActionDialog>
      ) : null}

      {voidable && canIssue ? (
        <ActionDialog
          action={voidInvoice}
          fields={{ id: invoice.id }}
          trigger={t("void")}
          title={t("voidInvoice")}
          description={t("voidHint")}
          submitLabel={t("void")}
          cancelLabel={t("cancel")}
          submitVariant="danger"
        >
          {(result) => (
            <Field label={t("voidReason")} htmlFor="reason" required error={fieldError(result, "reason")}>
              <Textarea id="reason" name="reason" required minLength={3} maxLength={500} aria-invalid={!!fieldError(result, "reason")} />
            </Field>
          )}
        </ActionDialog>
      ) : null}

      {isVoid && canWrite ? (
        <ActionForm action={issueReplacement} fields={{ id: invoice.id }} label={t("replace")} variant="primary" confirm={t("replaceHint")} />
      ) : null}

      {isDraft && canWrite ? (
        <ActionForm action={deleteDraftInvoice} fields={{ id: invoice.id }} label={t("deleteDraft")} variant="ghost" confirm={t("deleteConfirm")} />
      ) : null}
    </div>
  );
}
