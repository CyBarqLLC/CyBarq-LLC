"use client";

import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { fieldError } from "@/components/ui/form-message";
import { removePayment } from "@/lib/actions/finance";
import { ActionDialog } from "./action-form";

/** Removes a payment recorded by mistake. Asks for a reason, which is kept in the audit log. */
export function PaymentRemove({ paymentId }: { paymentId: string }) {
  const t = useTranslations("finance.payment");
  const ta = useTranslations("finance.actions");
  return (
    <ActionDialog
      action={removePayment}
      fields={{ payment_id: paymentId }}
      trigger={t("remove")}
      triggerVariant="ghost"
      title={t("removeTitle")}
      description={t("removeHint")}
      submitLabel={t("remove")}
      cancelLabel={ta("cancel")}
      submitVariant="danger"
    >
      {(result) => (
        <Field label={t("removeReason")} htmlFor={`reason-${paymentId}`} required error={fieldError(result, "reason")}>
          <Textarea id={`reason-${paymentId}`} name="reason" required minLength={3} maxLength={500} aria-invalid={!!fieldError(result, "reason")} />
        </Field>
      )}
    </ActionDialog>
  );
}
