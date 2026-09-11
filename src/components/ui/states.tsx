import * as React from "react";
import { AlertTriangle, Inbox, Lock, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

type StateProps = { title: string; description?: string; action?: React.ReactNode; className?: string; icon?: React.ReactNode };

function Shell({ title, description, action, className, icon }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 border border-fog bg-white px-6 py-14 text-center", className)}>
      {icon ? <div className="flex size-10 items-center justify-center bg-surface text-slate [&_svg]:size-5">{icon}</div> : null}
      <h3 className="text-h3 font-medium text-graphite">{title}</h3>
      {description ? <p className="max-w-md text-small text-slate">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Nothing to list yet. Use inside page bodies; inside a card, prefer `EmptyText`. */
export function EmptyState(props: StateProps) {
  return <Shell icon={<Inbox aria-hidden />} {...props} />;
}
export function ErrorState(props: StateProps) {
  return <Shell icon={<AlertTriangle aria-hidden />} {...props} />;
}
export function ForbiddenState(props: StateProps) {
  return <Shell icon={<Lock aria-hidden />} {...props} />;
}
export function NotFoundState(props: StateProps) {
  return <Shell icon={<SearchX aria-hidden />} {...props} />;
}

/** One quiet line for an empty list inside a card or panel. */
export function EmptyText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("px-4 py-8 text-center text-small text-slate", className)}>{children}</p>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-surface", className)} />;
}

/** Generic list loading state (rows of skeleton bars). */
export function LoadingState({ rows = 5, className }: { rows?: number; className?: string }) {
  const t = useTranslations("common");
  return (
    <div className={cn("flex flex-col gap-3", className)} role="status" aria-live="polite" aria-label={t("loading")}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
