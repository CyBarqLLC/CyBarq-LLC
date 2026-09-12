import { cn } from "@/lib/utils/cn";

/**
 * A platform reference (CyB-INV-000050). Always set left to right and in the
 * monospaced face, on an Arabic page as much as an English one: it is a code,
 * not a word, and it has to be read back character by character over the phone
 * or copied into an email.
 */
export function Reference({ value, className }: { value: string | null | undefined; className?: string }) {
  if (!value) return null;
  return (
    <span dir="ltr" className={cn("font-mono", className)}>
      {value}
    </span>
  );
}
