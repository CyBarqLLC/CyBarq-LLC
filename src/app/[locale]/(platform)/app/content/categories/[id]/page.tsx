import { CategoryEditPage } from "@/components/content/taxonomy-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CategoryEditPage params={params} />;
}
