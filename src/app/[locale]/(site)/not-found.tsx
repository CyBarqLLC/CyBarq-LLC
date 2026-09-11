import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

/** Not found within the public site layout (header and footer stay visible). */
export default async function SiteNotFound() {
  const t = await getTranslations("common.errors");
  const tc = await getTranslations("site.content");
  return (
    <div className="container-page section">
      <NotFoundState
        title={t("notFound")}
        description={tc("notFoundBody")}
        action={
          <Button asChild variant="outline">
            <Link href="/">{t("goHome")}</Link>
          </Button>
        }
      />
    </div>
  );
}
