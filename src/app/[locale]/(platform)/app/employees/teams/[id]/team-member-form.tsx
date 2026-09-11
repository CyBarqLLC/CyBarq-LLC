"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import type { Option } from "@/components/platform/enum-options";

export function TeamMemberForm({ action, candidates }: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>; candidates: Option[] }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("hr.teams");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("memberAdded"));
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label={t("chooseMember")} htmlFor="member-user_id" error={fieldError(result, "user_id")} required>
        <NativeSelect id="member-user_id" name="user_id" defaultValue="" required>
          <option value="" disabled>{t("chooseMember")}</option>
          {candidates.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </NativeSelect>
      </Field>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("addMember")}</SubmitButton>
      </div>
    </form>
  );
}
