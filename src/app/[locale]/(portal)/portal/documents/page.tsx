import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pagination, withPage, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { DOCUMENT_CATEGORY_LABELS, labelOf } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  title: string;
  category: string;
  size_bytes: number | null;
  created_at: string;
  project: { id: string; code: string; name_en: string; name_ar: string | null } | null;
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function PortalDocumentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const { page, pageSize, from, to } = pagination(sp);
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("project_documents")
    .select("id, title, category, size_bytes, created_at, project:projects(id, code, name_en, name_ar)", { count: "exact" })
    .eq("client_visible", true)
    .order("created_at", { ascending: false })
    .range(from, to);
  const rows: Row[] = data ?? [];

  const columns: Column<Row>[] = [
    { key: "title", header: t("documents.columns.title"), primary: true, cell: (r) => <span className="font-medium">{r.title}</span> },
    { key: "project", header: t("documents.columns.project"), cell: (r) => (r.project ? pick(r.project, "name", locale) : "") },
    { key: "category", header: t("documents.columns.category"), cell: (r) => <Badge variant="outline">{labelOf(DOCUMENT_CATEGORY_LABELS, r.category, locale)}</Badge> },
    { key: "size", header: t("documents.columns.size"), cell: (r) => <span dir="ltr">{formatSize(r.size_bytes)}</span> },
    { key: "date", header: tc("date"), cell: (r) => formatDate(r.created_at, locale) },
    {
      key: "download",
      header: tc("download"),
      hideOnCard: false,
      cell: (r) => (
        <a href={`/api/files/project-documents/${r.id}`} className="relative z-10 inline-flex items-center gap-1 text-small text-azure hover:underline" rel="noopener">
          <Download className="size-4" aria-hidden /> {tc("download")}
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("documents.title")} description={t("documents.description")} />
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} emptyTitle={t("documents.empty")} emptyDescription={t("documents.emptyDescription")} caption={t("documents.title")} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={count ?? 0}
        hrefFor={(p) => withPage(`/${locale}/portal/documents`, {}, p)}
        labels={{ previous: tc("pagination.previous"), next: tc("pagination.next"), summary: (f, tt, total) => tc("pagination.summary", { from: f, to: tt, total }) }}
      />
    </div>
  );
}
