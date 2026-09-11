import { TagEditPage } from "@/components/content/taxonomy-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <TagEditPage params={params} />;
}
