"use client";

import * as React from "react";
import type { ButtonProps } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { ServerActionForm } from "@/components/ui/server-action-form";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils/cn";

export type ActionChoice = {
  value: string;
  label: React.ReactNode;
  variant?: ButtonProps["variant"];
};

type ActionChoicesProps = {
  /** Dispatch function returned by useActionState, shared by every choice. */
  action: (formData: FormData) => void;
  result: ActionResult | null;
  /** Field name that carries the chosen value. */
  name: string;
  /** Hidden fields submitted with every choice. */
  fields: Record<string, string>;
  choices: readonly ActionChoice[];
  size?: ButtonProps["size"];
  className?: string;
};

/**
 * One button per choice, each in its own form with the value as a hidden
 * field. Several submit buttons with `name`/`value` in a single form action
 * looked right but the value never reached the server action (the FormData
 * React handed to the action carried only the hidden inputs), so the moves
 * were rejected as "status required". Separate forms make each submission
 * self-contained, and only the pressed button shows the pending state.
 */
export function ActionChoices({ action, result, name, fields, choices, size = "sm", className }: ActionChoicesProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {choices.map((choice) => (
        <ServerActionForm key={choice.value} action={action} result={result} className="contents">
          {Object.entries(fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <input type="hidden" name={name} value={choice.value} />
          <SubmitButton size={size} variant={choice.variant}>
            {choice.label}
          </SubmitButton>
        </ServerActionForm>
      ))}
    </div>
  );
}
