import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function ContentNotFound() {
  const t = await getTranslations("content");
  return (
    <NotFoundState
      title={t("notFound.title")}
      description={t("notFound.description")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/content/articles">{t("notFound.back")}</Link>
        </Button>
      }
    />
  );
}
