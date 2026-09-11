import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center gap-1 px-2 py-0.5 text-label whitespace-nowrap border", {
  variants: {
    variant: {
      neutral: "bg-surface text-slate border-transparent",
      outline: "bg-transparent text-graphite border-fog",
      blue: "bg-ice text-graphite border-transparent",
      lime: "bg-lime-tint text-graphite border-transparent",
      graphite: "bg-graphite text-white border-transparent",
      success: "bg-success-soft text-success border-transparent",
      warning: "bg-warning-soft text-warning border-transparent",
      danger: "bg-danger-soft text-danger border-transparent",
    },
  },
  defaultVariants: { variant: "neutral" },
});

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
