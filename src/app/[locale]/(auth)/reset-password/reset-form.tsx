"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updatePassword } from "@/lib/actions/auth";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";

export function ResetForm() {
  const [result, action] = useActionState(updatePassword, null);
  const t = useTranslations("auth");
  const router = useRouter();
  useEffect(() => {
    if (result?.ok) router.replace("/app");
  }, [result, router]);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field label={t("newPassword")} htmlFor="password" hint={t("passwordHint")} error={fieldError(result, "password")}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </Field>
      <Field label={t("confirmPassword")} htmlFor="confirm" error={fieldError(result, "confirm")}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} />
      </Field>
      <FormMessage result={result} />
      <SubmitButton size="lg" className="w-full">{t("setPassword")}</SubmitButton>
    </form>
  );
}
