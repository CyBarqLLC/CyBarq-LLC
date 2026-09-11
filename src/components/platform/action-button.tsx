"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

type ActionButtonProps = Omit<ButtonProps, "onClick" | "type"> & {
  /** Bound server action that needs no arguments. */
  action: () => Promise<ActionResult<unknown>>;
  successMessage?: string;
  redirectTo?: string;
};

/** Runs a server action on click with pending state and toast feedback. Use ConfirmAction for destructive operations. */
export function ActionButton({ action, successMessage, redirectTo, children, ...props }: ActionButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const run = () => {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (successMessage) toast.success(successMessage);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };
  return (
    <Button type="button" onClick={run} loading={pending} {...props}>
      {children}
    </Button>
  );
}
