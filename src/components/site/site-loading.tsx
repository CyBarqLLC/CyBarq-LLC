import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/states";

/** Loading state for public pages: a title bar and a few rows, no spinner. The status is announced in the page language. */
export function SiteLoading() {
  const t = useTranslations("common");
  return (
    <div className="container-page pt-10 pb-16 sm:pt-14 sm:pb-24" role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <Skeleton className="mb-6 h-4 w-40" />
      <Skeleton className="mb-10 h-12 w-2/3 max-w-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
