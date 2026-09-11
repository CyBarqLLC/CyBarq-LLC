"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({ className, children, title, description, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-graphite/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          // Bottom sheet on phones, centred panel from sm up. Respects safe areas.
          "fixed z-50 flex flex-col bg-white text-graphite border border-fog outline-none",
          "inset-x-0 bottom-0 max-h-[calc(100dvh-2rem)] pb-[max(1rem,var(--safe-bottom))]",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[85dvh] sm:pb-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-fog p-5">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-h3">{title}</DialogPrimitive.Title>
            {description ? <DialogPrimitive.Description className="mt-1 text-small text-slate">{description}</DialogPrimitive.Description> : <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>}
          </div>
          <DialogPrimitive.Close className="touch -m-2 flex items-center justify-center text-slate hover:text-graphite" aria-label="Close">
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogFooter };
