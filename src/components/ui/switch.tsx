"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center border border-transparent bg-grey transition-colors outline-none focus-visible:ring-2 focus-visible:ring-azure data-[state=checked]:bg-graphite disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 bg-white transition-transform data-[state=checked]:translate-x-5 rtl:data-[state=checked]:-translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
