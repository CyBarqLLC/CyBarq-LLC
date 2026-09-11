import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Json } from "@/lib/supabase/database.types";
import { formatDateTime } from "@/lib/utils/format";
import { label, PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/labels";
import { personName } from "./person";

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

function meta(value: Json, key: string): string | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value[key];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

function statusLabel(entity: string, value: string, locale: Locale): string {
  if (entity === "projects" && value in PROJECT_STATUS_LABELS) return label(PROJECT_STATUS_LABELS, value as keyof typeof PROJECT_STATUS_LABELS, locale);
  if (entity === "tasks" && value in TASK_STATUS_LABELS) return label(TASK_STATUS_LABELS, value as keyof typeof TASK_STATUS_LABELS, locale);
  return value;
}

/** Shared timeline used by the project activity tab and the dashboard. */
export async function ActivityList({ rows, locale, showProject = false, emptyText }: { rows: ActivityRow[]; locale: Locale; showProject?: boolean; emptyText: string }) {
  const t = await getTranslations("projects.activity");
  if (rows.length === 0) return <p className="px-4 py-6 text-center text-small text-slate">{emptyText}</p>;
  const knownActions = ["insert", "update", "status_changed", "delete"];
  const knownEntities = ["projects", "tasks", "milestones", "project_documents", "project_updates"];
  return (
    <ol className="divide-y divide-fog">
      {rows.map((row) => {
        const actor = personName(row.actor, locale, t("system"));
        const action = knownActions.includes(row.action) ? t(`actions.${row.action}`) : row.action;
        const entity = knownEntities.includes(row.entity_type) ? t(`entities.${row.entity_type}`) : row.entity_type;
        const title = meta(row.metadata, "title");
        const from = meta(row.metadata, "from");
        const to = meta(row.metadata, "to");
        const href =
          row.project_id && row.entity_type === "tasks" && row.entity_id
            ? `/app/projects/${row.project_id}/tasks/${row.entity_id}`
            : row.project_id
              ? `/app/projects/${row.project_id}`
              : null;
        return (
          <li key={row.id} className="flex flex-col gap-1 px-4 py-3 text-small sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="min-w-0">
              <span className="font-medium text-graphite">{actor}</span> <span className="text-slate">{action}</span> <span>{entity}</span>
              {title ? <span className="text-graphite"> {title}</span> : null}
              {from && to ? <span className="text-slate"> ({t("fromTo", { from: statusLabel(row.entity_type, from, locale), to: statusLabel(row.entity_type, to, locale) })})</span> : null}
              {showProject && row.project && href ? (
                <>
                  {" "}
                  <span aria-hidden>·</span>{" "}
                  <Link href={href} className="text-azure hover:underline">{locale === "ar" ? row.project.name_ar || row.project.name_en : row.project.name_en}</Link>
                </>
              ) : null}
            </span>
            <time dateTime={row.created_at} className="shrink-0 text-slate">{formatDateTime(row.created_at, locale)}</time>
          </li>
        );
      })}
    </ol>
  );
}
