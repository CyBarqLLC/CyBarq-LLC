"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

/** Button that reflects the pending state of the enclosing server action form. */
export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}
