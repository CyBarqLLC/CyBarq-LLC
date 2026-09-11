import type { Json } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/utils/format";

export type HistoryRow = { id: number; action: string; actor_email: string | null; created_at: string; metadata: Json };

function meta(value: Json, key: string): string | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value[key];
    if (typeof v === "string" || typeof v === "number") return String(v);
  }
  return null;
}

/** Compact audit trail for a document. Only rendered for audit.read holders. */
export function HistoryList({ rows, locale, emptyLabel, actorLabel, statusLabel }: { rows: HistoryRow[]; locale: Locale; emptyLabel: string; actorLabel: string; statusLabel: (status: string) => string }) {
  if (rows.length === 0) return <p className="text-small text-slate">{emptyLabel}</p>;
  return (
    <ol className="flex flex-col divide-y divide-fog border border-fog bg-white">
      {rows.map((r) => {
        const from = meta(r.metadata, "from");
        const to = meta(r.metadata, "to");
        const reason = meta(r.metadata, "reason");
        return (
          <li key={r.id} className="flex flex-col gap-1 px-4 py-3 text-small sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-graphite">{r.action.replaceAll(".", " ").replaceAll("_", " ")}</span>
              {from && to ? <span className="text-slate">{statusLabel(from)} → {statusLabel(to)}</span> : null}
              {reason ? <span className="text-slate">{reason}</span> : null}
            </div>
            <div className="text-slate tabular-nums">
              {r.actor_email ? <span>{actorLabel} {r.actor_email} · </span> : null}
              <time dateTime={r.created_at}>{formatDateTime(r.created_at, locale)}</time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
