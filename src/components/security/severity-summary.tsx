import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import { FINDING_SEVERITIES } from "@/lib/validation/security";
import { SEVERITY_LABELS, label } from "@/lib/labels";
import { Status } from "@/components/ui/status";

export type SeverityCounts = Record<Enums<"finding_severity">, number>;

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
}

/**
 * Aggregates one flat `findings` selection (engagement_id, severity, status)
 * into per engagement counts. False positives are excluded from the summary.
 */
export function aggregateSeverity(rows: { engagement_id: string; severity: Enums<"finding_severity">; status: Enums<"finding_status"> }[]): Map<string, SeverityCounts> {
  const map = new Map<string, SeverityCounts>();
  for (const row of rows) {
    if (row.status === "false_positive") continue;
    const counts = map.get(row.engagement_id) ?? emptySeverityCounts();
    counts[row.severity] += 1;
    map.set(row.engagement_id, counts);
  }
  return map;
}

/** Compact severity badges with counts; zero counts are omitted. */
export function SeveritySummary({ counts, locale, emptyLabel }: { counts: SeverityCounts | undefined; locale: Locale; emptyLabel: string }) {
  const entries = FINDING_SEVERITIES.filter((s) => (counts?.[s] ?? 0) > 0);
  if (entries.length === 0) return <span className="text-small text-slate">{emptyLabel}</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {entries.map((s) => (
        <Status key={s} value={s} label={`${counts?.[s] ?? 0} ${label(SEVERITY_LABELS, s, locale)}`} />
      ))}
    </span>
  );
}
