"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { changeFindingStatus } from "@/lib/actions/security";
import { FINDING_TRANSITIONS } from "@/lib/validation/security";
import { FINDING_STATUS_LABELS, label } from "@/lib/labels";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

type Props = { findingId: string; engagementId: string; status: Enums<"finding_status">; canWrite: boolean };

export function FindingStatusActions({ findingId, engagementId, status, canWrite }: Props) {
  const [result, formAction] = useActionState(changeFindingStatus, null);
  const t = useTranslations("security.findings");
  const locale = useLocale() as Locale;
  const next = FINDING_TRANSITIONS[status];
  if (!canWrite || next.length === 0) return null;
  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={findingId} />
      <input type="hidden" name="engagement_id" value={engagementId} />
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <SubmitButton key={s} name="status" value={s} size="sm" variant={s === "verified" ? "primary" : "outline"}>
            {t("moveTo", { status: label(FINDING_STATUS_LABELS, s, locale) })}
          </SubmitButton>
        ))}
      </div>
      <FormMessage result={result} />
    </ServerActionForm>
  );
}
