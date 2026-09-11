"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/actions/result";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { ServerActionForm } from "@/components/ui/server-action-form";

type ConfirmActionProps = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  /** Hidden inputs submitted with the confirmation. */
  fields: Record<string, string>;
  title: string;
  description?: string;
  confirmLabel: string;
  triggerLabel: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  destructive?: boolean;
  className?: string;
};

/** Button that opens a confirmation dialog before submitting a server action. */
export function ConfirmAction({ action, fields, title, description, confirmLabel, triggerLabel, triggerVariant = "outline", triggerSize = "sm", destructive = true, className }: ConfirmActionProps) {
  const [result, formAction] = useActionState(action, null);
  const [open, setOpen] = React.useState(false);
  const tc = useTranslations("common");

  React.useEffect(() => {
    if (result?.ok) setOpen(false);
  }, [result]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size={triggerSize} className={className}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent title={title} description={description}>
        <ServerActionForm action={formAction} result={result} className="flex flex-col gap-4">
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <FormMessage result={result} />
          <DialogFooter className="mt-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">{tc("cancel")}</Button>
            </DialogClose>
            <SubmitButton variant={destructive ? "danger" : "primary"}>{confirmLabel}</SubmitButton>
          </DialogFooter>
        </ServerActionForm>
      </DialogContent>
    </Dialog>
  );
}
