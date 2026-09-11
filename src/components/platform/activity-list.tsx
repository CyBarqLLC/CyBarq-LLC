import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Json } from "@/lib/supabase/database.types";
import { formatDateTime } from "@/lib/utils/format";
import { humanizeKey, labelOf, MILESTONE_STATUS_LABELS, PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { EmptyText } from "@/components/ui/states";
import { displayName } from "./person";

export type ActivityRow = {
  id: number;
  project_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Json;
  created_at: string;
  actor: { full_name: string; full_name_ar: string | null } | null;
  project?: { name_en: string; name_ar: string | null } | null;
};

const ACTIONS = ["insert", "update", "status_changed", "delete"] as const;
type ActivityAction = (typeof ACTIONS)[number];
const ENTITIES = ["projects", "tasks", "milestones", "project_documents", "project_updates"] as const;
type ActivityEntity = (typeof ENTITIES)[number];

function isAction(value: string): value is ActivityAction {
  return (ACTIONS as readonly string[]).includes(value);
}
function isEntity(value: string): value is ActivityEntity {
  return (ENTITIES as readonly string[]).includes(value);
}

function meta(value: Json, key: string): string | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value[key];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

function statusLabel(entity: string, value: string, locale: Locale): string {
  if (entity === "projects") return labelOf(PROJECT_STATUS_LABELS, value, locale);
  if (entity === "tasks") return labelOf(TASK_STATUS_LABELS, value, locale);
  if (entity === "milestones") return labelOf(MILESTONE_STATUS_LABELS, value, locale);
  return humanizeKey(value);
}

/**
 * Shared timeline used by the project activity tab and the dashboard. Each
 * row is one sentence built from a typed verb, the entity noun and the
 * actor's name, so nothing from the database is shown as a raw key.
 */
export async function ActivityList({ rows, locale, showProject = false, emptyText }: { rows: ActivityRow[]; locale: Locale; showProject?: boolean; emptyText: string }) {
  const t = await getTranslations("projects.activity");
  if (rows.length === 0) return <EmptyText>{emptyText}</EmptyText>;
  return (
    <ol className="divide-y divide-fog">
      {rows.map((row) => {
        const actor = displayName(row.actor, locale) || t("system");
        const entity = isEntity(row.entity_type) ? t(`entities.${row.entity_type}`) : humanizeKey(row.entity_type);
        const title = meta(row.metadata, "title");
        const from = meta(row.metadata, "from");
        const to = meta(row.metadata, "to");
        const action: ActivityAction | "unknown" = isAction(row.action) ? row.action : "unknown";
        const key = action === "status_changed" && !(from && to) ? "update" : action;
        const sentenceKey = `sentences.${key}${title ? "" : "NoTitle"}`;
        const href =
          row.project_id && row.entity_type === "tasks" && row.entity_id
            ? `/app/projects/${row.project_id}/tasks/${row.entity_id}`
            : row.project_id
              ? `/app/projects/${row.project_id}`
              : null;
        const sentence = t.rich(sentenceKey, {
          actor,
          entity,
          title: title ?? "",
          action: humanizeKey(row.action).toLowerCase(),
          from: from ? statusLabel(row.entity_type, from, locale) : "",
          to: to ? statusLabel(row.entity_type, to, locale) : "",
          strong: (chunks) => <span className="font-medium text-graphite">{chunks}</span>,
          em: (chunks) => <span className="text-graphite">{chunks}</span>,
        });
        return (
          <li key={row.id} className="flex flex-col gap-1 px-4 py-3 text-small sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="min-w-0 text-slate">
              {sentence}
              {showProject && row.project && href ? (
                <>
                  {" "}
                  <span aria-hidden>·</span>{" "}
                  <Link href={href} className="text-azure hover:underline">{locale === "ar" ? row.project.name_ar || row.project.name_en : row.project.name_en}</Link>
                </>
              ) : null}
            </span>
            <time dateTime={row.created_at} className="shrink-0 text-slate tabular-nums">{formatDateTime(row.created_at, locale)}</time>
          </li>
        );
      })}
    </ol>
  );
}
