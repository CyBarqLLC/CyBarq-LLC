import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function TaskNotFound() {
  const [t, tp] = await Promise.all([getTranslations("common.errors"), getTranslations("projects")]);
  return (
    <NotFoundState
      title={t("notFound")}
      description={t("notFoundDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/tasks">{tp("myTasks.title")}</Link>
        </Button>
      }
    />
  );
}
