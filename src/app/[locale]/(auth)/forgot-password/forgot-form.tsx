"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

export function ForgotForm() {
  const [result, action] = useActionState(requestPasswordReset, null);
  const t = useTranslations("auth");
  if (result?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="border border-success-soft bg-success-soft px-3 py-2 text-small text-success">{t("forgotSent")}</p>
        <Link href="/login" className="text-small text-slate hover:text-azure">{t("backToSignIn")}</Link>
      </div>
    );
  }
  return (
    <ServerActionForm action={action} result={result} className="flex flex-col gap-5" noValidate>
      <Field label={t("email")} htmlFor="email" error={fieldError(result, "email")}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required autoFocus />
      </Field>
      <FormMessage result={result} />
      <SubmitButton size="lg" className="w-full">{t("sendLink")}</SubmitButton>
      <Link href="/login" className="text-small text-slate hover:text-azure">{t("backToSignIn")}</Link>
    </ServerActionForm>
  );
}
