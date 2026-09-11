"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { inviteEmployee } from "@/lib/actions/users";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

/** Roles are rendered by the server (RoleCheckboxes) and passed as children so the list stays server driven. */
export function InviteEmployeeForm({ children }: { children: React.ReactNode }) {
  const [result, formAction] = useActionState(inviteEmployee, null);
  const t = useTranslations("platform.users");
  const router = useRouter();
  const handled = useRef<ActionResult<{ userId: string }> | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("form.invited"));
      router.push(`/app/users/${result.data.userId}`);
    }
  }, [result, router, t]);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("form.email")} htmlFor="email" error={fieldError(result, "email")} required className="sm:col-span-2">
          <Input id="email" name="email" type="email" inputMode="email" autoComplete="off" required maxLength={200} dir="ltr" aria-invalid={!!fieldError(result, "email")} />
        </Field>
        <Field label={t("form.fullName")} htmlFor="full_name" error={fieldError(result, "full_name")} required>
          <Input id="full_name" name="full_name" required maxLength={200} />
        </Field>
        <Field label={t("form.fullNameAr")} htmlFor="full_name_ar" error={fieldError(result, "full_name_ar")}>
          <Input id="full_name_ar" name="full_name_ar" maxLength={200} dir="rtl" />
        </Field>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label text-graphite">{t("detail.rolesTitle")}</span>
        <p className="text-small text-slate">{t("form.rolesHint")}</p>
        {children}
        {fieldError(result, "roles") ? <p role="alert" className="text-small text-danger">{fieldError(result, "roles")}</p> : null}
      </div>
      <FormMessage result={result} />
      <div>
        <SubmitButton>{t("form.send")}</SubmitButton>
      </div>
    </form>
  );
}
