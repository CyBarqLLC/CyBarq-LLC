import type { SearchParams } from "@/lib/data/paginate";
import { EditorialListPage } from "@/components/content/editorial-pages";

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <EditorialListPage table="articles" searchParams={searchParams} />;
}
