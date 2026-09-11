import type { SearchParams } from "@/lib/data/paginate";
import { ShowcaseListPage } from "@/components/content/showcase-pages";

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <ShowcaseListPage table="public_projects" searchParams={searchParams} />;
}
