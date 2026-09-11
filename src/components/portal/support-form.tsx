"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { createSupportRequest } from "@/lib/actions/portal";
import { pick } from "@/i18n/bilingual";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

export type PortalClientOption = { id: string; name_en: string; name_ar: string | null };
export type PortalProjectOption = { id: string; code: string; name_en: string; name_ar: string | null; client_id: string | null };

export function SupportRequestForm({ clients, projects }: { clients: PortalClientOption[]; projects: PortalProjectOption[] }) {
  const [result, formAction] = useActionState(createSupportRequest, null);
  const t = useTranslations("portal.support.form");
  const locale = useLocale() as Locale;
  const single = clients.length === 1 ? clients[0] : undefined;
  const invalid = (name: string) => !!fieldError(result, name);

  return (
    <ServerActionForm action={formAction} result={result} className="flex flex-col gap-5" noValidate>
      {single ? (
        <input type="hidden" name="client_id" value={single.id} />
      ) : (
        <Field label={t("client")} htmlFor="client_id" error={fieldError(result, "client_id")} required>
          <NativeSelect id="client_id" name="client_id" defaultValue={clients[0]?.id ?? ""} aria-invalid={invalid("client_id")}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{pick(c, "name", locale)}</option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field label={t("project")} htmlFor="project_id" hint={t("projectHint")} error={fieldError(result, "project_id")}>
        <NativeSelect id="project_id" name="project_id" defaultValue="" aria-invalid={invalid("project_id")}>
          <option value="">{t("noProject")}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.code} · {pick(p, "name", locale)}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label={t("subject")} htmlFor="subject" error={fieldError(result, "subject")} required>
        <Input id="subject" name="subject" required maxLength={200} aria-invalid={invalid("subject")} />
      </Field>
      <Field label={t("body")} htmlFor="body" hint={t("bodyHint")} error={fieldError(result, "body")} required>
        <Textarea id="body" name="body" required maxLength={5000} className="min-h-40" aria-invalid={invalid("body")} />
      </Field>
      <FormMessage result={result} />
      <div>
        <SubmitButton>{t("submit")}</SubmitButton>
      </div>
    </ServerActionForm>
  );
}
