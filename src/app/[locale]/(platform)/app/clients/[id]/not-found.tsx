import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function ClientNotFound() {
  const [t, tc] = await Promise.all([getTranslations("common.errors"), getTranslations("platform.clients")]);
  return (
    <NotFoundState
      title={t("notFound")}
      description={t("notFoundDescription")}
      action={
        <Button asChild variant="outline">
          <Link href="/app/clients">{tc("back")}</Link>
        </Button>
      }
    />
  );
}
