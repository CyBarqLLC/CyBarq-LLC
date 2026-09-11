import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireAnyPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils/format";
import { CERTIFICATE_STATUS_LABELS, CERTIFICATE_TYPE_LABELS, label } from "@/lib/labels";
import { certificateVerificationUrl } from "@/lib/pdf/documents";
import { qrDataUrl } from "@/lib/pdf/qr";
import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { DetailList, ImmutableNotice, Section } from "@/components/finance/detail-blocks";
import { HistoryList } from "@/components/finance/history-list";
import { CertificateActions } from "@/components/certificates/certificate-actions";
import { documentHistory } from "../../finance/_lib/data";
import { todayIso } from "../_lib/data";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const viewer = await requireAnyPermission(["certificates.read", "certificates.issue"]);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("certificates");
  const supabase = await createClient();

  const { data: certificate } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (!certificate) notFound();

  const verifyUrl = certificateVerificationUrl(certificate);
  const isDraft = certificate.status === "draft";
  const [qr, { data: recipient }, { data: issuer }, history] = await Promise.all([
    isDraft ? Promise.resolve(null) : qrDataUrl(verifyUrl),
    certificate.recipient_user_id ? supabase.from("profiles").select("id, full_name, full_name_ar, email").eq("id", certificate.recipient_user_id).maybeSingle() : Promise.resolve({ data: null }),
    certificate.issued_by ? supabase.from("profiles").select("id, full_name, full_name_ar").eq("id", certificate.issued_by).maybeSingle() : Promise.resolve({ data: null }),
    documentHistory(supabase, "certificate", certificate.id, viewer.can("audit.read")),
  ]);

  const title = certificate.certificate_no ?? t("draftLabel");
  const period = certificate.start_date
    ? certificate.end_date
      ? t("detail.periodRange", { start: formatDate(certificate.start_date, locale, "long"), end: formatDate(certificate.end_date, locale, "long") })
      : formatDate(certificate.start_date, locale, "long")
    : null;
  const personName = (p: { full_name: string; full_name_ar: string | null }) => (locale === "ar" ? p.full_name_ar || p.full_name : p.full_name);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={title}
        description={pick(certificate, "recipient_name", locale)}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/certificates" className="hover:text-azure">{t("title")}</Link>
            <Status value={certificate.status} label={label(CERTIFICATE_STATUS_LABELS, certificate.status, locale)} />
            <span className="text-slate">{label(CERTIFICATE_TYPE_LABELS, certificate.type, locale)}</span>
          </span>
        }
        actions={
          <CertificateActions
            certificate={{ id: certificate.id, status: certificate.status, updated_at: certificate.updated_at, hasEmail: Boolean(certificate.recipient_email) }}
            canIssue={viewer.can("certificates.issue")}
            today={todayIso()}
          />
        }
      />

      {!isDraft ? <ImmutableNotice title={t("immutable.title")} body={t("immutable.body")} /> : null}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-10">
          <Section title={t("detail.overview")}>
            <DetailList
              items={[
                { label: t("detail.recipient"), value: pick(certificate, "recipient_name", locale) },
                { label: t("detail.email"), value: certificate.recipient_email },
                { label: t("detail.employee"), value: recipient ? <Link href={`/app/employees/${recipient.id}`} className="text-azure hover:underline">{personName(recipient)}</Link> : null },
                { label: t("columns.title"), value: pick(certificate, "title", locale) },
                { label: t("detail.program"), value: pick(certificate, "program_name", locale) },
                { label: t("detail.role"), value: pick(certificate, "role_title", locale) },
                { label: t("detail.period"), value: period },
                { label: t("detail.hours"), value: certificate.hours === null ? null : formatNumber(certificate.hours, locale, Number.isInteger(Number(certificate.hours)) ? 0 : 1) },
                { label: t("detail.language"), value: t(`languages.${certificate.language}`) },
                { label: t("detail.issueDate"), value: formatDate(certificate.issue_date, locale, "long") },
                { label: t("detail.issuedBy"), value: issuer ? personName(issuer) : null },
                { label: t("detail.signatory"), value: [pick(certificate, "signatory_name", locale), pick(certificate, "signatory_title", locale)].filter(Boolean).join(", ") },
                { label: t("detail.revokedAt"), value: certificate.revoked_at ? formatDateTime(certificate.revoked_at, locale) : null },
                { label: t("detail.revokeReason"), value: certificate.revoke_reason },
                { label: t("detail.created"), value: formatDateTime(certificate.created_at, locale) },
              ]}
            />
          </Section>

          {pick(certificate, "description", locale) ? (
            <Section title={t("detail.description")}>
              <p className="whitespace-pre-line text-body">{pick(certificate, "description", locale)}</p>
            </Section>
          ) : null}

          {viewer.can("audit.read") ? (
            <Section title={t("history.title")}>
              <HistoryList rows={history} locale={locale} emptyLabel={t("history.empty")} actorLabel={t("history.actor")} statusLabel={(s) => (s in CERTIFICATE_STATUS_LABELS ? label(CERTIFICATE_STATUS_LABELS, s as keyof typeof CERTIFICATE_STATUS_LABELS, locale) : s)} />
            </Section>
          ) : null}
        </div>

        <Section title={t("detail.verification")}>
          <div className="flex flex-col gap-3 border border-fog bg-white p-4">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={t("detail.qr")} width={160} height={160} className="size-40 self-center" />
            ) : null}
            <p className="text-small text-slate">{isDraft ? t("detail.verificationInactive") : t("detail.verificationHint")}</p>
            {!isDraft ? (
              <a href={verifyUrl} target="_blank" rel="noopener" className="break-all text-small text-azure hover:underline">
                {verifyUrl}
              </a>
            ) : null}
          </div>
        </Section>
      </div>
    </div>
  );
}
