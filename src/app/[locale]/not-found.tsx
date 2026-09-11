import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export default async function NotFound() {
  const t = await getTranslations("common.errors");
  return (
    <main className="container-page section">
      <NotFoundState
        title={t("notFound")}
        description={t("notFoundDescription")}
        action={
          <Button asChild variant="outline">
            <Link href="/">{t("goHome")}</Link>
          </Button>
        }
      />
    </main>
  );
}
