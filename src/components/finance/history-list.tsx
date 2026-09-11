import type { Json } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/routing";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import { auditActionLabel, auditStatusLabel, labelOf, PAYMENT_METHOD_LABELS } from "@/lib/labels";

export type HistoryRow = { id: number; action: string; actor_email: string | null; created_at: string; metadata: Json };

function meta(value: Json, key: string): string | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value[key];
    if (typeof v === "string" || typeof v === "number") return String(v);
  }
  return null;
}

type HistoryListProps = {
  rows: HistoryRow[];
  locale: Locale;
  /** Audited entity, used to translate the statuses in each entry. */
  entityType: "invoice" | "quote" | "certificate";
  emptyLabel: string;
  actorLabel: string;
  /** "{from} → {to}" phrasing in the viewer's language. */
  transitionLabel: (from: string, to: string) => string;
};

/** Compact audit trail for a document. Only rendered for audit.read holders. */
export function HistoryList({ rows, locale, entityType, emptyLabel, actorLabel, transitionLabel }: HistoryListProps) {
  if (rows.length === 0) return <p className="text-small text-slate">{emptyLabel}</p>;
  return (
    <ol className="flex flex-col divide-y divide-fog border border-fog bg-white">
      {rows.map((r) => {
        const from = meta(r.metadata, "from");
        const to = meta(r.metadata, "to");
        const reason = meta(r.metadata, "reason");
        const amount = meta(r.metadata, "amount");
        const currency = meta(r.metadata, "currency");
        const method = meta(r.metadata, "method");
        const sentTo = to && to.includes("@") ? to : null;
        const details: string[] = [];
        if (from && to && !sentTo) details.push(transitionLabel(auditStatusLabel(entityType, from, locale), auditStatusLabel(entityType, to, locale)));
        if (sentTo) details.push(sentTo);
        if (amount) details.push(currency ? formatMoney(amount, currency, locale) : amount);
        if (method) details.push(labelOf(PAYMENT_METHOD_LABELS, method, locale));
        if (reason) details.push(reason);
        return (
          <li key={r.id} className="flex flex-col gap-1 px-4 py-3 text-small sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-graphite">{auditActionLabel(r.action, locale)}</span>
              {details.length > 0 ? <span className="text-slate">{details.join(" · ")}</span> : null}
            </div>
            <div className="shrink-0 text-slate tabular-nums">
              {r.actor_email ? (
                <span>
                  {actorLabel} <span dir="ltr">{r.actor_email}</span> ·{" "}
                </span>
              ) : null}
              <time dateTime={r.created_at}>{formatDateTime(r.created_at, locale)}</time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
