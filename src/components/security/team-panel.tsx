"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { addEngagementMember, removeEngagementMember } from "@/lib/actions/security";
import { MEMBER_ROLES, type MemberRole } from "@/lib/validation/security";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/states";
import { employeeName, type EmployeeOption } from "./engagement-form";

export type MemberRow = { user_id: string; role: string; full_name: string; full_name_ar: string | null; email: string | null };

type TeamPanelProps = {
  engagementId: string;
  members: MemberRow[];
  employees: EmployeeOption[];
  leadUserId: string | null;
  canWrite: boolean;
};

export function TeamPanel({ engagementId, members, employees, leadUserId, canWrite }: TeamPanelProps) {
  const [result, formAction] = useActionState(addEngagementMember, null);
  const t = useTranslations("security.team");
  const locale = useLocale() as Locale;
  const memberIds = new Set(members.map((m) => m.user_id));
  const candidates = employees.filter((e) => !memberIds.has(e.user_id));

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div>
        {members.length === 0 ? (
          <EmptyState title={t("empty")} description={t("emptyDescription")} />
        ) : (
          <ul className="flex flex-col divide-y divide-fog border border-fog bg-white">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={employeeName(m, locale)} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body">{employeeName(m, locale)}</div>
                  {m.email ? <div className="truncate text-small text-slate">{m.email}</div> : null}
                </div>
                <Badge variant={m.role === "lead" ? "blue" : "outline"}>{t(`roles.${m.role as MemberRole}`)}</Badge>
                {canWrite && m.user_id !== leadUserId ? <RemoveMember engagementId={engagementId} userId={m.user_id} label={t("remove")} /> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      {canWrite ? (
        <form action={formAction} className="flex h-fit flex-col gap-4 border border-fog bg-white p-5" noValidate>
          <h3 className="text-h3">{t("add")}</h3>
          <input type="hidden" name="engagement_id" value={engagementId} />
          <Field label={t("member")} htmlFor="member_user_id" error={fieldError(result, "user_id")} required>
            <NativeSelect id="member_user_id" name="user_id" required defaultValue="">
              <option value="" disabled>{t("pick")}</option>
              {candidates.map((e) => (
                <option key={e.user_id} value={e.user_id}>{employeeName(e, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("role")} htmlFor="member_role" error={fieldError(result, "role")} required>
            <NativeSelect id="member_role" name="role" defaultValue="tester">
              {MEMBER_ROLES.map((r) => (
                <option key={r} value={r}>{t(`roles.${r}`)}</option>
              ))}
            </NativeSelect>
          </Field>
          <FormMessage result={result} />
          <SubmitButton size="sm" disabled={candidates.length === 0}>{t("addSubmit")}</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

function RemoveMember({ engagementId, userId, label }: { engagementId: string; userId: string; label: string }) {
  const [result, formAction] = useActionState(removeEngagementMember, null);
  return (
    <form action={formAction} className="flex items-center">
      <input type="hidden" name="engagement_id" value={engagementId} />
      <input type="hidden" name="user_id" value={userId} />
      <SubmitButton variant="ghost" size="icon-sm" aria-label={label} title={result && !result.ok ? result.error : undefined}>
        <X aria-hidden />
      </SubmitButton>
    </form>
  );
}
