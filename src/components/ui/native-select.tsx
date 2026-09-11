import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Native select: best choice inside server rendered forms (progressive
 * enhancement, mobile pickers, autofill). Radix Select is for rich menus.
 */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 w-full appearance-none border border-fog bg-white ps-3 pe-9 py-2 text-body text-graphite outline-none",
          "hover:border-grey focus-visible:border-graphite disabled:cursor-not-allowed disabled:bg-surface aria-invalid:border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 opacity-60" aria-hidden />
    </div>
  );
}

export { NativeSelect };
