import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { DOCUMENT_CATEGORIES } from "@/lib/validation/projects";
import { deleteProjectDocument } from "@/lib/actions/projects";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/platform/section-card";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { personName } from "@/components/platform/person";
import { formatBytes } from "@/components/platform/format-bytes";
import { getProject, canManageProject } from "../project-data";
import { ProjectDocumentUploader } from "./project-document-uploader";

export default async function ProjectDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.documents");
  const tc = await getTranslations("common");
  const manage = await canManageProject(viewer, project);
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("project_documents")
    .select("id, title, category, size_bytes, mime_type, client_visible, created_at, uploader:profiles!project_documents_uploaded_by_fkey(full_name, full_name_ar)")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(200);
  type Row = NonNullable<typeof rows>[number];
  const documents: Row[] = rows ?? [];
  const categoryLabel = (value: string) => (DOCUMENT_CATEGORIES.includes(value as (typeof DOCUMENT_CATEGORIES)[number]) ? t(`categories.${value}`) : value);

  const columns: Column<Row>[] = [
    { key: "title", header: t("columns.title"), primary: true, cell: (d) => (
      <a href={`/api/files/project-documents/${d.id}`} className="font-medium text-graphite hover:text-azure" rel="noopener">{d.title}</a>
    ) },
    { key: "category", header: t("columns.category"), cell: (d) => categoryLabel(d.category) },
    { key: "size", header: t("columns.size"), cell: (d) => formatBytes(d.size_bytes, locale) },
    { key: "visibility", header: t("columns.visibility"), cell: (d) => <Badge variant={d.client_visible ? "blue" : "neutral"}>{d.client_visible ? t("clientBadge") : t("internalBadge")}</Badge> },
    { key: "uploader", header: t("columns.uploadedBy"), cell: (d) => personName(d.uploader, locale) },
    { key: "date", header: t("columns.date"), cell: (d) => formatDate(d.created_at, locale) },
    { key: "actions", header: "", align: "end", cell: (d) => (
      <span className="inline-flex gap-1">
        <a href={`/api/files/project-documents/${d.id}`} className="touch inline-flex items-center px-2 text-small text-azure hover:underline" rel="noopener">{tc("download")}</a>
        {manage ? (
          <ConfirmAction
            action={deleteProjectDocument.bind(null, project.id, d.id)}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            confirmLabel={t("delete")}
            triggerLabel={t("delete")}
            triggerVariant="ghost"
            destructive
            successMessage={t("deleted")}
          />
        ) : null}
      </span>
    ) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <DataTable rows={documents} columns={columns} rowKey={(d) => d.id} emptyTitle={t("empty")} emptyDescription={t("emptyHint")} caption={t("title")} />
      <SectionCard title={t("upload")} description={t("description")}>
        <ProjectDocumentUploader projectId={project.id} categories={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`) }))} />
      </SectionCard>
    </div>
  );
}
