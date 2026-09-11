"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateProfile } from "@/lib/actions/settings";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import { ServerActionForm } from "@/components/ui/server-action-form";

type ProfileFormProps = {
  defaults: { full_name: string; full_name_ar: string | null; phone: string | null; locale: "en" | "ar"; email: string };
};

export function ProfileForm({ defaults }: ProfileFormProps) {
  const [result, formAction] = useActionState(updateProfile, null);
  const t = useTranslations("platform.settings.profile");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("saved"));
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("fullName")} htmlFor="full_name" error={fieldError(result, "full_name")} required>
          <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required maxLength={200} autoComplete="name" />
        </Field>
        <Field label={t("fullNameAr")} htmlFor="full_name_ar" error={fieldError(result, "full_name_ar")}>
          <Input id="full_name_ar" name="full_name_ar" defaultValue={defaults.full_name_ar ?? ""} maxLength={200} dir="rtl" />
        </Field>
        <Field label={t("phone")} htmlFor="phone" error={fieldError(result, "phone")}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={defaults.phone ?? ""} maxLength={50} autoComplete="tel" dir="ltr" />
        </Field>
        <Field label={t("locale")} htmlFor="locale" error={fieldError(result, "locale")}>
          <NativeSelect id="locale" name="locale" defaultValue={defaults.locale}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </NativeSelect>
        </Field>
        <Field label={t("email")} htmlFor="email" hint={t("emailHint")}>
          <Input id="email" type="email" value={defaults.email} readOnly disabled dir="ltr" />
        </Field>
      </div>
      <FormMessage result={result} />
      <div>
        <SubmitButton>{t("save")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
