"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/actions/result";
import { Button, type ButtonProps } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { Dialog, DialogContent, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";

export type FormAction<T> = (prev: ActionResult<T> | null, formData: FormData) => Promise<ActionResult<T>>;

type ActionFormProps<T> = {
  action: FormAction<T>;
  fields: Record<string, string>;
  label: React.ReactNode;
  /** Native confirm before submitting. */
  confirm?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  successMessage?: (data: T) => string;
  className?: string;
};

/**
 * One button that submits a server action with hidden fields. With `confirm`,
 * the button first opens a small in-app confirmation dialog (never the
 * browser's native confirm box). Errors and an optional success line render
 * under the button.
 */
export function ActionForm<T>({ action, fields, label, confirm, variant = "outline", size = "sm", successMessage, className }: ActionFormProps<T>) {
  const [result, formAction] = useActionState(action, null);
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("common");
  const handled = React.useRef<ActionResult<T> | null>(null);

  React.useEffect(() => {
    if (result && handled.current !== result) {
      handled.current = result;
      if (result.ok) setOpen(false);
    }
  }, [result]);

  const hidden = Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
  const feedback = (
    <>
      <FormMessage result={result} />
      {result?.ok && successMessage ? (
        <p role="status" className="text-small text-success">{successMessage(result.data)}</p>
      ) : null}
    </>
  );

  if (!confirm) {
    return (
      <form action={formAction} className={className ?? "flex flex-col gap-1"}>
        {hidden}
        <SubmitButton variant={variant} size={size}>{label}</SubmitButton>
        {feedback}
      </form>
    );
  }

  return (
    <div className={className ?? "flex flex-col gap-1"}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant={variant} size={size}>{label}</Button>
        </DialogTrigger>
        <DialogContent title={typeof label === "string" ? label : t("confirm")} description={confirm}>
          <form action={formAction} className="flex flex-col gap-5">
            {hidden}
            <FormMessage result={result} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">{t("cancel")}</Button>
              </DialogClose>
              <SubmitButton variant={variant === "danger" ? "danger" : "primary"}>{label}</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {result?.ok && successMessage ? <p role="status" className="text-small text-success">{successMessage(result.data)}</p> : null}
    </div>
  );
}

type ActionDialogProps<T> = {
  action: FormAction<T>;
  fields: Record<string, string>;
  trigger: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  title: string;
  description?: string;
  submitLabel: string;
  cancelLabel: string;
  submitVariant?: ButtonProps["variant"];
  /** Form controls rendered inside the dialog. Receives the last result for field errors. */
  children?: (result: ActionResult<T> | null) => React.ReactNode;
  onSuccess?: (data: T) => void;
};

/**
 * Button that opens a dialog with a small server action form (issue, void,
 * payment). Closes itself when the action succeeds.
 */
export function ActionDialog<T>({ action, fields, trigger, triggerVariant = "outline", title, description, submitLabel, cancelLabel, submitVariant = "primary", children, onSuccess }: ActionDialogProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [result, formAction] = useActionState(action, null);
  const handled = React.useRef<ActionResult<T> | null>(null);

  React.useEffect(() => {
    if (result && result.ok && handled.current !== result) {
      handled.current = result;
      setOpen(false);
      onSuccess?.(result.data);
    }
  }, [result, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="sm">{trigger}</Button>
      </DialogTrigger>
      <DialogContent title={title} description={description}>
        <form action={formAction} className="flex flex-col gap-5" noValidate>
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          {children ? children(result) : null}
          <FormMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">{cancelLabel}</Button>
            </DialogClose>
            <SubmitButton variant={submitVariant}>{submitLabel}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
