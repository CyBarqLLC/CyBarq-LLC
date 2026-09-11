import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function PortalProjectNotFound() {
  const t = await getTranslations("portal");
  return (
    <NotFoundState
      title={t("projects.notFound")}
      description={t("projects.notFoundDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/portal/projects">{t("projects.back")}</Link>
        </Button>
      }
    />
  );
}
