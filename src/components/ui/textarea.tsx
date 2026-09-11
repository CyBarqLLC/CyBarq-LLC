import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full border border-fog bg-white px-3 py-2 text-body text-graphite transition-colors outline-none",
        "hover:border-grey focus-visible:border-graphite aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
