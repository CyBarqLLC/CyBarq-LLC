import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { PRACTICE_LABELS, PROJECT_STATUS_LABELS, label } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Status } from "@/components/ui/status";

type Row = {
  id: string;
  code: string;
  name_en: string;
  name_ar: string | null;
  practice: Enums<"practice">;
  status: Enums<"project_status">;
  start_date: string | null;
  end_date: string | null;
  client: { name_en: string; name_ar: string | null } | null;
};

export default async function PortalProjectsPage() {
  const viewer = await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, code, name_en, name_ar, practice, status, start_date, end_date, client:clients(name_en, name_ar)")
    .order("status")
    .order("updated_at", { ascending: false });
  const rows: Row[] = data ?? [];
  const multiClient = viewer.clientIds.length > 1;

  const columns: Column<Row>[] = [
    { key: "name", header: t("projects.columns.name"), primary: true, cell: (r) => <span className="font-medium">{pick(r, "name", locale)}</span> },
    { key: "code", header: t("projects.columns.code"), cell: (r) => <span className="font-mono text-small" dir="ltr">{r.code}</span> },
    ...(multiClient ? [{ key: "client", header: t("projects.columns.client"), cell: (r: Row) => (r.client ? pick(r.client, "name", locale) : "") } satisfies Column<Row>] : []),
    { key: "practice", header: t("projects.columns.practice"), cell: (r) => label(PRACTICE_LABELS, r.practice, locale) },
    { key: "status", header: tc("status"), cell: (r) => <Status value={r.status} label={label(PROJECT_STATUS_LABELS, r.status, locale)} /> },
    { key: "dates", header: t("projects.columns.dates"), cell: (r) => <span className="whitespace-nowrap text-small">{formatDate(r.start_date, locale) || "…"} → {formatDate(r.end_date, locale) || "…"}</span> },
  ];

  return (
    <div>
      <PageHeader title={t("projects.title")} description={t("projects.description")} />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} rowHref={(r) => `/portal/projects/${r.id}`} emptyTitle={t("projects.empty")} emptyDescription={t("projects.emptyDescription")} caption={t("projects.title")} />
    </div>
  );
}
