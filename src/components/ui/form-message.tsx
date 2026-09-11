import { cn } from "@/lib/utils/cn";
import type { ActionResult } from "@/lib/actions/result";

/** Renders a top level action error (field errors are rendered by Field). */
export function FormMessage({ result, className }: { result: ActionResult<unknown> | null | undefined; className?: string }) {
  if (!result || result.ok) return null;
  return (
    <p role="alert" className={cn("border border-danger-soft bg-danger-soft px-3 py-2 text-small text-danger", className)}>
      {result.error}
    </p>
  );
}

export function fieldError(result: ActionResult<unknown> | null | undefined, name: string): string | undefined {
  if (!result || result.ok) return undefined;
  return result.fieldErrors?.[name]?.[0];
}
