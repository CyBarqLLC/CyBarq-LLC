"use client";

import * as React from "react";

type SubmittedValues = Array<[string, string]>;

type ServerActionFormProps = Omit<React.ComponentPropsWithoutRef<"form">, "action"> & {
  /** The dispatch function returned by useActionState. */
  action: (formData: FormData) => void;
  /** Latest state returned by the action. When it reports a failure, the submitted values are put back. */
  result: { ok: boolean } | null | undefined;
};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * A form bound to a server action.
 *
 * React resets uncontrolled fields after every form action, including one
 * that comes back with a validation error, which would wipe what the person
 * just typed. This form keeps that reset for successful submissions (so
 * "add another" forms start empty again) and restores the submitted values,
 * before the browser paints, when the action reports a failure.
 */
export function ServerActionForm({ action, result, onSubmit, children, ...props }: ServerActionFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const submitted = React.useRef<SubmittedValues | null>(null);

  useIsomorphicLayoutEffect(() => {
    const form = formRef.current;
    const values = submitted.current;
    if (!form || !values || !result || result.ok) return;
    restoreValues(form, values);
  }, [result]);

  return (
    <form
      {...props}
      ref={formRef}
      action={action}
      onSubmit={(event) => {
        submitted.current = captureValues(event.currentTarget);
        onSubmit?.(event);
      }}
    >
      {children}
    </form>
  );
}

function captureValues(form: HTMLFormElement): SubmittedValues {
  const values: SubmittedValues = [];
  for (const [name, value] of new FormData(form)) {
    if (typeof value === "string") values.push([name, value]);
  }
  return values;
}

/** Puts submitted values back into uncontrolled fields. Files and hidden fields are left alone. */
function restoreValues(form: HTMLFormElement, values: SubmittedValues) {
  const byName = new Map<string, string[]>();
  for (const [name, value] of values) byName.set(name, [...(byName.get(name) ?? []), value]);
  const position = new Map<string, number>();
  const next = (name: string): string | undefined => {
    const index = position.get(name) ?? 0;
    position.set(name, index + 1);
    return byName.get(name)?.[index];
  };

  for (const element of Array.from(form.elements)) {
    if (element instanceof HTMLInputElement) {
      if (!element.name || ["file", "hidden", "submit", "button", "reset", "image"].includes(element.type)) continue;
      if (element.type === "checkbox" || element.type === "radio") {
        element.checked = (byName.get(element.name) ?? []).includes(element.value);
        continue;
      }
      const value = next(element.name);
      if (value !== undefined && element.value !== value) element.value = value;
    } else if (element instanceof HTMLTextAreaElement) {
      if (!element.name) continue;
      const value = next(element.name);
      if (value !== undefined && element.value !== value) element.value = value;
    } else if (element instanceof HTMLSelectElement) {
      if (!element.name) continue;
      if (element.multiple) {
        const chosen = byName.get(element.name) ?? [];
        for (const option of Array.from(element.options)) option.selected = chosen.includes(option.value);
      } else {
        const value = next(element.name);
        if (value !== undefined && element.value !== value) element.value = value;
      }
    }
  }
}
