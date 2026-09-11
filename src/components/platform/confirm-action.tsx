"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

type ConfirmActionProps = {
  /** Bound server action that needs no arguments. */
  action: () => Promise<ActionResult<unknown>>;
  title: string;
  description?: string;
  confirmLabel: string;
  triggerLabel: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  destructive?: boolean;
  /** Navigate here after success (otherwise the current view refreshes). */
  redirectTo?: string;
  successMessage?: string;
  className?: string;
  disabled?: boolean;
};

/** Button that asks for confirmation in a dialog before running a server action. */
export function ConfirmAction({ action, title, description, confirmLabel, triggerLabel, triggerVariant = "outline", triggerSize = "sm", destructive, redirectTo, successMessage, className, disabled }: ConfirmActionProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const run = () => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (successMessage) toast.success(successMessage);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null); }}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size={triggerSize} className={className} disabled={disabled}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent title={title} description={description}>
        {error ? <p role="alert" className="border border-danger-soft bg-danger-soft px-3 py-2 text-small text-danger">{error}</p> : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">{t("cancel")}</Button>
          </DialogClose>
          <Button type="button" variant={destructive ? "danger" : "primary"} onClick={run} loading={pending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
