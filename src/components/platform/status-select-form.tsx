"use client";

import * as React from "react";
import { useActionState } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import { ServerActionForm } from "@/components/ui/server-action-form";

type StatusSelectFormProps = {
  /** Bound server action in the (prevState, formData) shape. */
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  name: string;
  options: { value: string; label: string }[];
  defaultValue: string;
  submitLabel: string;
  successMessage?: string;
  ariaLabel: string;
  className?: string;
};

/** Small inline form: a select and an explicit save button. Used for quick status changes. */
export function StatusSelectForm({ action, name, options, defaultValue, submitLabel, successMessage, ariaLabel, className }: StatusSelectFormProps) {
  const [result, formAction] = useActionState(action, null);
  const last = React.useRef<ActionResult | null>(null);
  React.useEffect(() => {
    if (result && result !== last.current) {
      last.current = result;
      if (result.ok) {
        if (successMessage) toast.success(successMessage);
      } else {
        toast.error(result.error);
      }
    }
  }, [result, successMessage]);
  return (
    <ServerActionForm action={formAction} result={result} className={className ?? "flex items-center gap-2"}>
      {/* Keyed on the saved value: after a change the page re-renders with the new
          status and the select must start from it, not from the first render. */}
      <NativeSelect key={defaultValue} name={name} defaultValue={defaultValue} aria-label={ariaLabel} className="h-9 min-w-36 text-small">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </NativeSelect>
      <SubmitButton size="sm" variant="subtle">{submitLabel}</SubmitButton>
    </ServerActionForm>
  );
}
