"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

type AvatarProps = { name: string; src?: string | null; className?: string; size?: "sm" | "md" | "lg" };

const sizes = { sm: "size-8 text-label", md: "size-10 text-small", lg: "size-14 text-body" };

function Avatar({ name, src, className, size = "md" }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn("relative flex shrink-0 overflow-hidden bg-ice text-graphite", sizes[size], className)}>
      {src ? <AvatarPrimitive.Image src={src} alt="" className="aspect-square size-full object-cover" /> : null}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center font-medium" delayMs={src ? 300 : 0}>
        {initials(name) || "?"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
