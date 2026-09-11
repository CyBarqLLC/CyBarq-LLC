"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

export function UpdateForm({ action }: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult> }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("projects.updates");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("posted"));
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label={t("titleField")} htmlFor="update-title" error={fieldError(result, "title")} required>
        <Input id="update-title" name="title" required maxLength={200} />
      </Field>
      <Field label={t("body")} htmlFor="update-body" error={fieldError(result, "body")} required>
        <Textarea id="update-body" name="body" required maxLength={10000} />
      </Field>
      <label htmlFor="update-visible" className="flex items-center gap-3 text-body">
        <input id="update-visible" name="client_visible" type="checkbox" className="size-5 accent-graphite" />
        {t("clientVisible")}
      </label>
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("post")}</SubmitButton>
      </div>
    </form>
  );
}
