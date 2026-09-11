import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils/cn";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | string[];
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + hint + error, wired with aria attributes. */
function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const err = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-danger ms-1" aria-hidden>*</span> : null}
      </Label>
      {children}
      {hint && !err ? <p id={`${htmlFor}-hint`} className="text-small text-slate">{hint}</p> : null}
      {err ? <p id={`${htmlFor}-error`} role="alert" className="text-small text-danger">{err}</p> : null}
    </div>
  );
}

export { Field };
