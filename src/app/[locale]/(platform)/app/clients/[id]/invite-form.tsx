"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

export function InviteClientUserForm({ action }: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult> }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("platform.clients.portal");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("invited"));
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label={t("email")} htmlFor="invite-email" error={fieldError(result, "email")} required>
        <Input id="invite-email" name="email" type="email" inputMode="email" autoComplete="off" required maxLength={200} dir="ltr" aria-invalid={!!fieldError(result, "email")} />
      </Field>
      <Field label={t("fullName")} htmlFor="invite-name" error={fieldError(result, "full_name")} required>
        <Input id="invite-name" name="full_name" required maxLength={200} />
      </Field>
      <Field label={t("fullNameAr")} htmlFor="invite-name-ar" error={fieldError(result, "full_name_ar")}>
        <Input id="invite-name-ar" name="full_name_ar" maxLength={200} dir="rtl" />
      </Field>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("send")}</SubmitButton>
      </div>
    </form>
  );
}
