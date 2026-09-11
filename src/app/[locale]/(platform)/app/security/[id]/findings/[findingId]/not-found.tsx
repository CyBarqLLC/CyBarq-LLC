import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function FindingNotFound() {
  const t = await getTranslations("security");
  return (
    <NotFoundState
      title={t("findings.notFound")}
      description={t("notFound.description")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/security">{t("notFound.back")}</Link>
        </Button>
      }
    />
  );
}
