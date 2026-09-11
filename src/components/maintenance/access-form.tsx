"use client";

import * as React from "react";
import type { MaintenanceCopy } from "./copy";
import { cn } from "@/lib/utils/cn";

type AccessFormProps = {
  copy: MaintenanceCopy;
  next: string;
  /** Error carried over from a no-JavaScript form post. */
  initialError?: "invalid" | "rate_limited" | null;
};

/**
 * "Development Team Access": a quiet disclosure that reveals one password
 * field. Uses <details> so it works without JavaScript (the form then posts
 * normally); with JavaScript it validates inline without leaving the page.
 * The password is only checked by the server at /api/site-access.
 */
export function AccessForm({ copy, next, initialError = null }: AccessFormProps) {
  const [open, setOpen] = React.useState(initialError !== null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    initialError === "invalid" ? copy.invalid : initialError === "rate_limited" ? copy.rateLimited : null,
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = inputRef.current?.value ?? "";
    if (!password) {
      inputRef.current?.focus();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, next }),
        credentials: "same-origin",
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; next?: string; error?: string } | null;
      if (res.ok && body?.ok) {
        window.location.assign(body.next ?? "/");
        return;
      }
      setError(res.status === 429 ? copy.rateLimited : res.status === 401 ? copy.invalid : copy.unavailable);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    } catch {
      setError(copy.unavailable);
    } finally {
      setPending(false);
    }
  };

  return (
    <details
      className="group"
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary
        className={cn(
          "touch inline-flex cursor-pointer list-none items-center text-small text-slate transition-colors duration-(--duration-state) hover:text-graphite",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        {copy.access}
      </summary>
      <form action="/api/site-access" method="post" onSubmit={onSubmit} className="mt-3 flex w-full max-w-sm flex-col gap-2" noValidate>
        <input type="hidden" name="next" value={next} />
        <label htmlFor="site-password" className="sr-only">
          {copy.passwordLabel}
        </label>
        <div className="flex">
          <input
            ref={inputRef}
            id="site-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={copy.passwordLabel}
            required
            maxLength={200}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "site-password-error" : undefined}
            disabled={pending}
            className={cn(
              "h-11 min-w-0 flex-1 border border-e-0 border-fog bg-white px-3 text-body text-graphite outline-none transition-colors",
              "placeholder:text-grey hover:border-grey focus-visible:border-graphite aria-invalid:border-danger/60 disabled:opacity-60",
            )}
          />
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending || undefined}
            className="h-11 shrink-0 bg-graphite px-5 text-body font-medium text-white transition-colors duration-(--duration-state) hover:bg-slate disabled:opacity-60"
          >
            {pending ? copy.checking : copy.enter}
          </button>
        </div>
        <p id="site-password-error" role="alert" aria-live="polite" className="min-h-5 text-small text-danger">
          {error}
        </p>
      </form>
    </details>
  );
}
