import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ForbiddenState } from "@/components/ui/states";

export default async function ForbiddenPage() {
  const t = await getTranslations("common.errors");
  return (
    <ForbiddenState
      title={t("forbidden")}
      description={t("forbiddenDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/app">{t("goHome")}</Link>
        </Button>
      }
    />
  );
}
