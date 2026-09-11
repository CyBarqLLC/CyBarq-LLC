"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

type InviteResult = ActionResult<{ emailSent: boolean }>;

export function InviteClientUserForm({ action }: { action: (prev: InviteResult | null, formData: FormData) => Promise<InviteResult> }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("platform.clients.portal");
  const locale = useLocale();
  const router = useRouter();
  const handled = useRef<InviteResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      if (result.data.emailSent) toast.success(t("invited"));
      else toast.success(t("linked"));
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
      <Field label={t("inviteLanguage")} htmlFor="invite-locale">
        <NativeSelect id="invite-locale" name="locale" defaultValue={locale}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </NativeSelect>
      </Field>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("send")}</SubmitButton>
      </div>
    </form>
  );
}
