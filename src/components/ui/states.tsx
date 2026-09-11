import * as React from "react";
import { AlertTriangle, Inbox, Lock, SearchX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StateProps = { title: string; description?: string; action?: React.ReactNode; className?: string; icon?: React.ReactNode };

function Shell({ title, description, action, className, icon }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 border border-fog bg-white px-6 py-12 text-center", className)}>
      {icon ? <div className="text-slate [&_svg]:size-6">{icon}</div> : null}
      <h3 className="text-h3">{title}</h3>
      {description ? <p className="max-w-md text-small text-slate">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

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

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-surface", className)} />;
}

/** Generic list loading state (rows of skeleton bars). */
export function LoadingState({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="status" aria-live="polite" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}
