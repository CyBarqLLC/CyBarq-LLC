"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";

type MemberFormProps = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  candidates: Option[];
};

export function MemberForm({ action, candidates }: MemberFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("projects.members");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("added"));
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label={t("employee")} htmlFor="user_id" error={fieldError(result, "user_id")} required>
        <NativeSelect id="user_id" name="user_id" defaultValue="" required>
          <option value="" disabled>{t("choose")}</option>
          {candidates.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label={t("role")} htmlFor="role" error={fieldError(result, "role")} required>
        <NativeSelect id="role" name="role" defaultValue="member">
          <option value="member">{t("roles.member")}</option>
          <option value="manager">{t("roles.manager")}</option>
          <option value="viewer">{t("roles.viewer")}</option>
        </NativeSelect>
      </Field>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("add")}</SubmitButton>
      </div>
    </form>
  );
}
