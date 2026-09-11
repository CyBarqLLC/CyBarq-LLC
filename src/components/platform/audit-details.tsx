import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Json } from "@/lib/supabase/database.types";
import { formatMoney } from "@/lib/utils/format";
import {
  auditStatusLabel,
  CERTIFICATE_TYPE_LABELS,
  DOCUMENT_KIND_LABELS,
  ENGAGEMENT_TYPE_LABELS,
  humanizeKey,
  labelOf,
  PAYMENT_METHOD_LABELS,
  permissionLabel,
  roleLabel,
  SEVERITY_LABELS,
  USER_KIND_LABELS,
} from "@/lib/labels";

/** Identifiers that only make sense to the database; they stay in the raw view. */
const HIDDEN_KEYS = new Set(["engagement_id", "payment_id", "client_id", "employee_user_id", "project_id", "bucket"]);

/** Keys the details cell knows how to phrase. Anything else falls back to the raw view. */
const KNOWN_KEYS = new Set([
  "from", "to", "number", "total", "amount", "currency", "reason", "roles", "added", "removed", "email_sent", "certificate_no", "type",
  "code", "slug", "role", "permission", "kind", "method", "severity", "status", "source", "linked_existing", "client_changed", "lead_changed",
  "authorisation_changed", "client_visible",
]);

type Meta = Record<string, Json | undefined>;

function asObject(value: Json): Meta | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function text(value: Json | undefined): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function list(value: Json | undefined): string[] {
  return Array.isArray(value) ? value.flatMap((v) => (typeof v === "string" ? [v] : [])) : [];
}

function typeLabel(entityType: string, value: string, locale: Locale): string {
  if (entityType === "certificate") return labelOf(CERTIFICATE_TYPE_LABELS, value, locale);
  if (entityType === "security_engagement") return labelOf(ENGAGEMENT_TYPE_LABELS, value, locale);
  return humanizeKey(value);
}

function kindLabel(entityType: string, value: string, locale: Locale): string {
  if (entityType === "user" || entityType === "client_user") return labelOf(USER_KIND_LABELS, value, locale);
  if (entityType === "employee_document" || entityType === "employee_documents") return labelOf(DOCUMENT_KIND_LABELS, value, locale);
  return humanizeKey(value);
}

type AuditDetailsProps = { value: Json; entityType: string; locale: Locale };

/**
 * Reads the metadata of an audit entry as short human lines: statuses,
 * money, roles and permissions in the viewer's language. Keys the component
 * does not recognise are kept behind a "raw data" disclosure so nothing is
 * lost and nothing raw is shown by default.
 */
export async function AuditDetails({ value, entityType, locale }: AuditDetailsProps) {
  const t = await getTranslations("platform.audit.meta");
  const meta = asObject(value);
  if (!meta) return null;
  const entries = Object.entries(meta).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return null;

  const yesNo = (v: Json | undefined) => (v === true ? t("yes") : t("no"));
  const currency = text(meta.currency);
  const lines: { key: string; label: string; value: string }[] = [];

  const from = text(meta.from);
  const to = text(meta.to);
  if (from && to) {
    lines.push({ key: "transition", label: t("statusChange"), value: t("transition", { from: auditStatusLabel(entityType, from, locale), to: auditStatusLabel(entityType, to, locale) }) });
  } else if (to && to.includes("@")) {
    lines.push({ key: "to", label: t("sentTo"), value: to });
  } else if (to) {
    lines.push({ key: "to", label: t("to"), value: auditStatusLabel(entityType, to, locale) });
  }

  const number = text(meta.number);
  if (number) lines.push({ key: "number", label: t("number"), value: number });
  const certificateNo = text(meta.certificate_no);
  if (certificateNo) lines.push({ key: "certificate_no", label: t("certificateNo"), value: certificateNo });
  const code = text(meta.code);
  if (code) lines.push({ key: "code", label: t("code"), value: code });
  const slug = text(meta.slug);
  if (slug) lines.push({ key: "slug", label: t("slug"), value: slug });

  const total = text(meta.total);
  if (total) lines.push({ key: "total", label: t("total"), value: currency ? formatMoney(total, currency, locale) : total });
  const amount = text(meta.amount);
  if (amount) lines.push({ key: "amount", label: t("amount"), value: currency ? formatMoney(amount, currency, locale) : amount });
  const method = text(meta.method);
  if (method) lines.push({ key: "method", label: t("method"), value: labelOf(PAYMENT_METHOD_LABELS, method, locale) });

  const type = text(meta.type);
  if (type) lines.push({ key: "type", label: t("type"), value: typeLabel(entityType, type, locale) });
  const kind = text(meta.kind);
  if (kind) lines.push({ key: "kind", label: t("kind"), value: kindLabel(entityType, kind, locale) });
  const severity = text(meta.severity);
  if (severity) lines.push({ key: "severity", label: t("severity"), value: labelOf(SEVERITY_LABELS, severity, locale) });
  const status = text(meta.status);
  if (status && !(from && to)) lines.push({ key: "status", label: t("status"), value: auditStatusLabel(entityType, status, locale) });

  const role = text(meta.role);
  if (role) lines.push({ key: "role", label: t("role"), value: roleLabel(role, locale) });
  const permission = text(meta.permission);
  if (permission) lines.push({ key: "permission", label: t("permission"), value: permissionLabel(permission, locale) });
  const roles = list(meta.roles);
  if (roles.length > 0) lines.push({ key: "roles", label: t("roles"), value: roles.map((r) => roleLabel(r, locale)).join(t("separator")) });
  const added = list(meta.added);
  if (added.length > 0) lines.push({ key: "added", label: t("added"), value: added.map((r) => roleLabel(r, locale)).join(t("separator")) });
  const removed = list(meta.removed);
  if (removed.length > 0) lines.push({ key: "removed", label: t("removed"), value: removed.map((r) => roleLabel(r, locale)).join(t("separator")) });

  const reason = text(meta.reason);
  if (reason) lines.push({ key: "reason", label: t("reason"), value: reason });
  const source = text(meta.source);
  if (source) lines.push({ key: "source", label: t("source"), value: humanizeKey(source) });

  if (typeof meta.email_sent === "boolean") lines.push({ key: "email_sent", label: t("emailSent"), value: yesNo(meta.email_sent) });
  if (typeof meta.linked_existing === "boolean") lines.push({ key: "linked_existing", label: t("linkedExisting"), value: yesNo(meta.linked_existing) });
  if (typeof meta.client_visible === "boolean") lines.push({ key: "client_visible", label: t("clientVisible"), value: yesNo(meta.client_visible) });
  if (meta.client_changed === true) lines.push({ key: "client_changed", label: t("changed"), value: t("clientChanged") });
  if (meta.lead_changed === true) lines.push({ key: "lead_changed", label: t("changed"), value: t("leadChanged") });
  if (meta.authorisation_changed === true) lines.push({ key: "authorisation_changed", label: t("changed"), value: t("authorisationChanged") });

  const unknown = entries.filter(([k]) => !KNOWN_KEYS.has(k) && !HIDDEN_KEYS.has(k));
  const raw = unknown.length > 0 ? Object.fromEntries(unknown) : null;

  if (lines.length === 0 && !raw) return null;
  return (
    <div className="max-w-sm text-small">
      {lines.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          {lines.map((line) => (
            <div key={line.key} className="contents">
              <dt className="text-slate">{line.label}</dt>
              <dd className="min-w-0 break-words text-graphite">{line.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {raw ? (
        <details className={lines.length > 0 ? "mt-1" : undefined}>
          <summary className="cursor-pointer text-label text-slate">{t("raw")}</summary>
          <pre className="mt-2 max-h-48 overflow-auto bg-surface p-2 text-label leading-relaxed" dir="ltr">{JSON.stringify(raw, null, 2)}</pre>
        </details>
      ) : null}
    </div>
  );
}
