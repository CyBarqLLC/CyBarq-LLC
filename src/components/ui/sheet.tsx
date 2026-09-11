"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

type Side = "start" | "end" | "bottom";

/** Drawer. `start`/`end` follow the writing direction so RTL works without extra props. */
function SheetContent({ className, children, side = "end", title, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: Side; title: string }) {
  const sideClasses: Record<Side, string> = {
    start: "inset-y-0 start-0 h-full w-[min(88vw,22rem)] border-e",
    end: "inset-y-0 end-0 h-full w-[min(88vw,26rem)] border-s",
    bottom: "inset-x-0 bottom-0 max-h-[85dvh] border-t",
  };
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-graphite/40" />
      <DialogPrimitive.Content
        className={cn("fixed z-50 flex flex-col bg-white border-fog outline-none", sideClasses[side], className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-4 border-b border-fog px-5 py-4 pt-[max(1rem,var(--safe-top))]">
          <DialogPrimitive.Title className="text-h3 truncate">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
          <DialogPrimitive.Close className="touch -m-2 flex items-center justify-center text-slate hover:text-graphite" aria-label="Close">
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[max(1rem,var(--safe-bottom))]">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
