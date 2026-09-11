import { EditorialEditPage } from "@/components/content/editorial-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditorialEditPage table="news_posts" params={params} />;
}
