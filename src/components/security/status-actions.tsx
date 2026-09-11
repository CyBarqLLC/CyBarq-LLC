"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { changeEngagementStatus } from "@/lib/actions/security";
import { nextEngagementStatuses } from "@/lib/validation/security";
import { ENGAGEMENT_STATUS_LABELS, label } from "@/lib/labels";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { ConfirmAction } from "./confirm-action";

type StatusActionsProps = {
  engagementId: string;
  status: Enums<"engagement_status">;
  canWrite: boolean;
};

/** Explicit lifecycle moves. Cancel asks for confirmation; forward moves submit directly. */
export function StatusActions({ engagementId, status, canWrite }: StatusActionsProps) {
  const [result, formAction] = useActionState(changeEngagementStatus, null);
  const t = useTranslations("security.status");
  const locale = useLocale() as Locale;
  const next = nextEngagementStatuses(status);
  const forward = next.filter((s) => s !== "cancelled");
  const canCancel = next.includes("cancelled");

  if (!canWrite || next.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {forward.length > 0 ? (
          <form action={formAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={engagementId} />
            {forward.map((s) => (
              <SubmitButton key={s} name="status" value={s} size="sm" variant={s === "closed" ? "secondary" : "primary"}>
                {t("moveTo", { status: label(ENGAGEMENT_STATUS_LABELS, s, locale) })}
              </SubmitButton>
            ))}
          </form>
        ) : null}
        {canCancel ? (
          <ConfirmAction
            action={changeEngagementStatus}
            fields={{ id: engagementId, status: "cancelled" }}
            title={t("cancelTitle")}
            description={t("cancelDescription")}
            confirmLabel={t("cancelConfirm")}
            triggerLabel={t("cancel")}
            triggerVariant="ghost"
          />
        ) : null}
      </div>
      <FormMessage result={result} />
    </div>
  );
}
