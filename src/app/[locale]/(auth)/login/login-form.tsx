"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn } from "@/lib/actions/auth";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

export function LoginForm({ next }: { next?: string }) {
  const [result, action] = useActionState(signIn, null);
  const t = useTranslations("auth");
  return (
    <ServerActionForm action={action} result={result} className="flex flex-col gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label={t("email")} htmlFor="email" error={fieldError(result, "email")}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required autoFocus aria-invalid={!!fieldError(result, "email")} />
      </Field>
      <Field label={t("password")} htmlFor="password" error={fieldError(result, "password")}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} aria-invalid={!!fieldError(result, "password")} />
      </Field>
      <FormMessage result={result} />
      <SubmitButton size="lg" className="w-full">{t("signIn")}</SubmitButton>
      <Link href="/forgot-password" className="text-small text-slate hover:text-azure">{t("forgot")}</Link>
    </ServerActionForm>
  );
}
