import { ShowcaseEditPage } from "@/components/content/showcase-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ShowcaseEditPage table="case_studies" params={params} />;
}
