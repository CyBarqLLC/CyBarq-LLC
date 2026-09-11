"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { changeFindingStatus } from "@/lib/actions/security";
import { FINDING_TRANSITIONS } from "@/lib/validation/security";
import { FINDING_STATUS_LABELS, label } from "@/lib/labels";
import { FormMessage } from "@/components/ui/form-message";
import { ActionChoices } from "@/components/platform/action-choices";

type Props = { findingId: string; engagementId: string; status: Enums<"finding_status">; canWrite: boolean };

export function FindingStatusActions({ findingId, engagementId, status, canWrite }: Props) {
  const [result, formAction] = useActionState(changeFindingStatus, null);
  const t = useTranslations("security.findings");
  const locale = useLocale() as Locale;
  const next = FINDING_TRANSITIONS[status];
  if (!canWrite || next.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <ActionChoices
        action={formAction}
        result={result}
        name="status"
        fields={{ id: findingId, engagement_id: engagementId }}
        choices={next.map((s) => ({ value: s, label: t("moveTo", { status: label(FINDING_STATUS_LABELS, s, locale) }), variant: s === "verified" ? "primary" : "outline" }))}
      />
      <FormMessage result={result} />
    </div>
  );
}
