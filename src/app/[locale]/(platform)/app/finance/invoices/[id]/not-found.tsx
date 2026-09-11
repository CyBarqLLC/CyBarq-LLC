import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function NotFound() {
  const [t, tc] = await Promise.all([getTranslations("finance"), getTranslations("common")]);
  return (
    <NotFoundState
      title={t("notFound.title")}
      description={t("notFound.description")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/finance">{tc("back")}</Link>
        </Button>
      }
    />
  );
}
