import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tailwind class merging that knows the brand type scale. Without this,
 * tailwind-merge reads `text-small`, `text-body` or `text-h2` as text colours,
 * so `cn("text-white", "text-small")` would drop the colour and
 * `cn("text-small", "text-slate")` would drop the size.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-display", "text-h1", "text-h2", "text-h3", "text-body", "text-small", "text-label"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
