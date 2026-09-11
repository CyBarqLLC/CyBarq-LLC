import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/pagination";

type ListPaginationProps = { page: number; pageSize: number; total: number; hrefFor: (page: number) => string };

/** Pagination with the shared common labels. Server component. */
export async function ListPagination({ page, pageSize, total, hrefFor }: ListPaginationProps) {
  const t = await getTranslations("common.pagination");
  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      hrefFor={hrefFor}
      labels={{ previous: t("previous"), next: t("next"), summary: (from, to, all) => t("summary", { from, to, total: all }) }}
    />
  );
}
