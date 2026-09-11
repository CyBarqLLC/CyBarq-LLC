"use client";

import * as React from "react";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitContact, type ContactResult } from "@/lib/actions/contact";
import { CONTACT_RATE_LIMITED, type ContactField } from "@/lib/validation/contact";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";

export type ServiceOptionGroup = { label: string; options: { value: string; label: string }[] };

type ContactFormProps = {
  /** Services grouped by practice, prepared by the server so the client bundle does not carry all copy. */
  serviceGroups: ServiceOptionGroup[];
  /** Preselected service slug (from ?service=). */
  defaultService?: string;
};

/** Contact form with a success state. `key` on the inner form resets it for another message. */
export function ContactForm(props: ContactFormProps) {
  const [resetKey, setResetKey] = React.useState(0);
  return <ContactFormInner key={resetKey} {...props} onReset={() => setResetKey((k) => k + 1)} />;
}

function ContactFormInner({ serviceGroups, defaultService, onReset }: ContactFormProps & { onReset: () => void }) {
  const [result, action] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const t = useTranslations("site.contact.form");
  const tc = useTranslations("common");
  const locale = useLocale();

  const errorFor = (field: ContactField): string | undefined => {
    if (!result || result.ok) return undefined;
    if (!result.fieldErrors?.[field]?.length) return undefined;
    if (field === "name" || field === "email" || field === "message") return t(`errors.${field}`);
    return t("errors.tooLong");
  };

  if (result?.ok) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4 border border-fog bg-ice p-6 sm:p-8">
        <h3 className="text-h2">{t("successTitle")}</h3>
        <p className="text-slate">{t("successBody")}</p>
        <div>
          <Button variant="outline" onClick={onReset}>{t("sendAnother")}</Button>
        </div>
      </div>
    );
  }

  const topError = result && !result.ok && !result.fieldErrors ? (result.error === CONTACT_RATE_LIMITED ? t("errors.rateLimited") : t("errors.generic")) : null;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} htmlFor="contact-name" required error={errorFor("name")}>
          <Input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={120} aria-invalid={!!errorFor("name")} />
        </Field>
        <Field label={t("email")} htmlFor="contact-email" required error={errorFor("email")}>
          <Input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={200} aria-invalid={!!errorFor("email")} />
        </Field>
        <Field label={`${t("company")} (${tc("optional")})`} htmlFor="contact-company" error={errorFor("company")}>
          <Input id="contact-company" name="company" type="text" autoComplete="organization" maxLength={200} aria-invalid={!!errorFor("company")} />
        </Field>
        <Field label={t("country")} htmlFor="contact-country" error={errorFor("country")}>
          <Input id="contact-country" name="country" type="text" autoComplete="country-name" maxLength={120} aria-invalid={!!errorFor("country")} />
        </Field>
      </div>

      <Field label={`${t("service")} (${tc("optional")})`} htmlFor="contact-service" error={errorFor("service")}>
        <NativeSelect id="contact-service" name="service" defaultValue={defaultService ?? ""} aria-invalid={!!errorFor("service")}>
          <option value="">{t("servicePlaceholder")}</option>
          {serviceGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
      </Field>

      <Field label={t("message")} htmlFor="contact-message" required hint={t("messageHint")} error={errorFor("message")}>
        <Textarea id="contact-message" name="message" required minLength={20} maxLength={4000} rows={6} aria-invalid={!!errorFor("message")} />
      </Field>

      {topError ? <p role="alert" className="border border-danger-soft bg-danger-soft px-3 py-2 text-small text-danger">{topError}</p> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton size="lg">{t("submit")}</SubmitButton>
        <p className="text-small text-slate">{t("promise")}</p>
      </div>
      <p className="text-small text-slate">
        {t.rich("privacy", {
          link: (chunks) => (
            <Link href="/privacy" className="text-azure underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
