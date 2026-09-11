import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function ProjectsNotFound() {
  const [t, tp] = await Promise.all([getTranslations("common.errors"), getTranslations("projects")]);
  return (
    <NotFoundState
      title={t("notFound")}
      description={t("notFoundDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/projects">{tp("back")}</Link>
        </Button>
      }
    />
  );
}
