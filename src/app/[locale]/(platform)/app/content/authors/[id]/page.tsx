import { AuthorEditPage } from "@/components/content/taxonomy-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AuthorEditPage params={params} />;
}
