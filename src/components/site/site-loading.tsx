import { LoadingState, Skeleton } from "@/components/ui/states";

/** Loading state for public pages: a title bar and a few rows, no spinner. */
export function SiteLoading() {
  return (
    <div className="container-page pt-10 pb-16 sm:pt-14 sm:pb-24">
      <Skeleton className="mb-6 h-4 w-40" />
      <Skeleton className="mb-10 h-12 w-2/3 max-w-xl" />
      <LoadingState rows={4} />
    </div>
  );
}
