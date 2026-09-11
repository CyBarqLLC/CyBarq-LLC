import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-(--duration-state) ease-(--ease-brand) disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary: "bg-blue text-graphite hover:bg-sky active:bg-azure active:text-white",
        secondary: "bg-graphite text-white hover:bg-slate",
        outline: "border border-graphite text-graphite bg-transparent hover:bg-graphite hover:text-white",
        ghost: "text-graphite hover:bg-surface",
        subtle: "bg-surface text-graphite hover:bg-fog",
        danger: "bg-danger text-white hover:opacity-90",
        link: "text-azure underline-offset-4 hover:underline h-auto px-0",
      },
      size: {
        sm: "h-9 px-3 text-small",
        md: "h-11 px-5 text-body",
        lg: "h-12 px-6 text-body",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

function Button({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));
  // Radix Slot requires exactly one React element child, so asChild never adds a spinner.
  if (asChild) {
    return (
      <Slot data-slot="button" className={classes} aria-busy={loading || undefined} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button data-slot="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
