"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <Sonner
      dir={dir}
      position="bottom-center"
      offset={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex w-full items-center gap-3 border border-fog bg-white px-4 py-3 text-body text-graphite shadow-[0_8px_24px_rgba(13,14,19,0.10)] font-sans",
          title: "font-medium",
          description: "text-small text-slate",
          success: "border-s-4 border-s-success",
          error: "border-s-4 border-s-danger",
          warning: "border-s-4 border-s-warning",
          info: "border-s-4 border-s-blue",
        },
      }}
    />
  );
}

export { toast } from "sonner";
