"use client";

import { useActionState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { completeAccountSetup, updatePassword } from "@/lib/actions/auth";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

type Props =
  /** From an invitation or reset email: the one time token is verified on submit. */
  | { mode: "token"; token: string; type: "invite" | "recovery"; submitLabel?: string }
  /** Already signed in: changes the current password. */
  | { mode: "session"; submitLabel?: string };

export function ResetForm(props: Props) {
  const [result, action] = useActionState(props.mode === "token" ? completeAccountSetup : updatePassword, null);
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  useEffect(() => {
    // Token mode redirects on the server; session mode returns to the platform.
    if (props.mode === "session" && result?.ok) router.replace("/app");
  }, [props.mode, result, router]);
  return (
    <ServerActionForm action={action} result={result} className="flex flex-col gap-5" noValidate>
      {props.mode === "token" ? (
        <>
          <input type="hidden" name="token" value={props.token} />
          <input type="hidden" name="type" value={props.type} />
          <input type="hidden" name="locale" value={locale} />
        </>
      ) : null}
      <Field label={t("newPassword")} htmlFor="password" hint={t("passwordHint")} error={fieldError(result, "password")}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} autoFocus aria-invalid={!!fieldError(result, "password")} />
      </Field>
      <Field label={t("confirmPassword")} htmlFor="confirm" error={fieldError(result, "confirm")}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} aria-invalid={!!fieldError(result, "confirm")} />
      </Field>
      <FormMessage result={result} />
      <SubmitButton size="lg" className="w-full">{props.submitLabel ?? t("setPassword")}</SubmitButton>
    </ServerActionForm>
  );
}
