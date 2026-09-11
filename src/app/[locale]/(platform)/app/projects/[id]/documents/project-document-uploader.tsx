"use client";

import { useTranslations } from "next-intl";
import { DocumentUploader } from "@/components/platform/document-uploader";
import { requestProjectDocumentUpload, registerProjectDocument } from "@/lib/actions/projects";
import type { Option } from "@/components/platform/enum-options";

export function ProjectDocumentUploader({ projectId, categories }: { projectId: string; categories: Option[] }) {
  const t = useTranslations("projects.documents");
  return (
    <DocumentUploader
      requestTicket={(file) => requestProjectDocumentUpload(projectId, file)}
      register={(meta) => registerProjectDocument({ projectId, path: meta.path, title: meta.title, category: meta.category, size: meta.size, mime: meta.type || undefined, client_visible: meta.clientVisible })}
      categories={categories}
      categoryLabel={t("category")}
      titleLabel={t("titleField")}
      clientVisibleLabel={t("clientVisible")}
      maxSizeMb={50}
      successMessage={t("uploaded")}
    />
  );
}
