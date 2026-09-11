import { EditorialEditPage } from "@/components/content/editorial-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditorialEditPage table="articles" params={params} />;
}
