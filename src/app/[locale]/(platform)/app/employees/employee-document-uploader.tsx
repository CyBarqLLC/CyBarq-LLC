"use client";

import { useTranslations } from "next-intl";
import { DocumentUploader } from "@/components/platform/document-uploader";
import { requestEmployeeDocumentUpload, registerEmployeeDocument } from "@/lib/actions/employees";
import type { Option } from "@/components/platform/enum-options";

export function EmployeeDocumentUploader({ employeeUserId, kinds }: { employeeUserId: string; kinds: Option[] }) {
  const t = useTranslations("hr.record");
  return (
    <DocumentUploader
      requestTicket={(file) => requestEmployeeDocumentUpload(employeeUserId, file)}
      register={(meta) => registerEmployeeDocument({ employeeUserId, path: meta.path, title: meta.title, kind: meta.category, size: meta.size, mime: meta.type || undefined })}
      categories={kinds}
      categoryLabel={t("documentKind")}
      titleLabel={t("documentTitle")}
      maxSizeMb={25}
      successMessage={t("uploaded")}
    />
  );
}
