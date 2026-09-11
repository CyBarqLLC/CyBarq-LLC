import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function TeamNotFound() {
  const [t, tt] = await Promise.all([getTranslations("common.errors"), getTranslations("hr.teams")]);
  return (
    <NotFoundState
      title={t("notFound")}
      description={t("notFoundDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/employees/teams">{tt("back")}</Link>
        </Button>
      }
    />
  );
}
