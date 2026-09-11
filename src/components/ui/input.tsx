import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 border border-fog bg-white px-3 py-2 text-body text-graphite transition-colors duration-(--duration-state) outline-none",
        "hover:border-grey focus-visible:border-graphite focus-visible:ring-0",
        "aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70",
        "file:me-3 file:border-0 file:bg-transparent file:text-small file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
