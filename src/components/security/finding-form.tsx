"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ActionResult } from "@/lib/actions/result";
import type { Tables } from "@/lib/supabase/database.types";
import { FINDING_SEVERITIES } from "@/lib/validation/security";
import { SEVERITY_LABELS, label } from "@/lib/labels";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage, fieldError } from "@/components/ui/form-message";
import { businessToday } from "@/lib/time";

type FindingFormProps = {
  action: (prev: ActionResult<{ id: string }> | null, formData: FormData) => Promise<ActionResult<{ id: string }>>;
  engagementId: string;
  defaults: Partial<Tables<"findings">> & { ref_code: string };
  assets: { id: string; name: string }[];
  mode: "create" | "edit";
};

export function FindingForm({ action, engagementId, defaults, assets, mode }: FindingFormProps) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("security.findings.form");
  const locale = useLocale() as Locale;
  const invalid = (name: string) => !!fieldError(result, name);
  const showRemediation = mode === "edit";

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <input type="hidden" name="engagement_id" value={engagementId} />
      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("sections.identification")}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label={t("refCode")} htmlFor="ref_code" error={fieldError(result, "ref_code")} required>
            <Input id="ref_code" name="ref_code" defaultValue={defaults.ref_code} required maxLength={30} className="uppercase" aria-invalid={invalid("ref_code")} />
          </Field>
          <Field label={t("severity")} htmlFor="severity" error={fieldError(result, "severity")} required>
            <NativeSelect id="severity" name="severity" defaultValue={defaults.severity ?? "medium"}>
              {FINDING_SEVERITIES.map((s) => (
                <option key={s} value={s}>{label(SEVERITY_LABELS, s, locale)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("cvss")} htmlFor="cvss_score" hint={t("cvssHint")} error={fieldError(result, "cvss_score")}>
            <Input id="cvss_score" name="cvss_score" type="number" inputMode="decimal" min={0} max={10} step={0.1} defaultValue={defaults.cvss_score ?? ""} dir="ltr" aria-invalid={invalid("cvss_score")} />
          </Field>
          <Field label={t("title")} htmlFor="title" error={fieldError(result, "title")} required className="md:col-span-2">
            <Input id="title" name="title" defaultValue={defaults.title ?? ""} required maxLength={200} aria-invalid={invalid("title")} />
          </Field>
          <Field label={t("asset")} htmlFor="asset_id" error={fieldError(result, "asset_id")}>
            <NativeSelect id="asset_id" name="asset_id" defaultValue={defaults.asset_id ?? ""}>
              <option value="">{t("noAsset")}</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("discoveredAt")} htmlFor="discovered_at" error={fieldError(result, "discovered_at")}>
            <Input id="discovered_at" name="discovered_at" type="date" defaultValue={defaults.discovered_at ?? businessToday()} aria-invalid={invalid("discovered_at")} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-h3">{t("sections.details")}</h2>
        <Field label={t("description")} htmlFor="description" error={fieldError(result, "description")}>
          <Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={20000} className="min-h-36" aria-invalid={invalid("description")} />
        </Field>
        <Field label={t("impact")} htmlFor="impact" error={fieldError(result, "impact")}>
          <Textarea id="impact" name="impact" defaultValue={defaults.impact ?? ""} maxLength={10000} aria-invalid={invalid("impact")} />
        </Field>
        <Field label={t("evidenceSummary")} htmlFor="evidence_summary" hint={t("evidenceSummaryHint")} error={fieldError(result, "evidence_summary")}>
          <Textarea id="evidence_summary" name="evidence_summary" defaultValue={defaults.evidence_summary ?? ""} maxLength={10000} aria-invalid={invalid("evidence_summary")} />
        </Field>
        <Field label={t("recommendation")} htmlFor="recommendation" error={fieldError(result, "recommendation")}>
          <Textarea id="recommendation" name="recommendation" defaultValue={defaults.recommendation ?? ""} maxLength={10000} aria-invalid={invalid("recommendation")} />
        </Field>
      </section>

      {showRemediation ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-h3">{t("sections.remediation")}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("remediatedAt")} htmlFor="remediated_at" error={fieldError(result, "remediated_at")}>
              <Input id="remediated_at" name="remediated_at" type="date" defaultValue={defaults.remediated_at ?? ""} aria-invalid={invalid("remediated_at")} />
            </Field>
            <Field label={t("retestedAt")} htmlFor="retested_at" error={fieldError(result, "retested_at")}>
              <Input id="retested_at" name="retested_at" type="date" defaultValue={defaults.retested_at ?? ""} aria-invalid={invalid("retested_at")} />
            </Field>
          </div>
          <Field label={t("retestResult")} htmlFor="retest_result" error={fieldError(result, "retest_result")}>
            <Textarea id="retest_result" name="retest_result" defaultValue={defaults.retest_result ?? ""} maxLength={5000} className="min-h-20" aria-invalid={invalid("retest_result")} />
          </Field>
        </section>
      ) : null}

      <FormMessage result={result} />
      <div>
        <SubmitButton>{mode === "create" ? t("create") : t("save")}</SubmitButton>
      </div>
    </form>
  );
}
