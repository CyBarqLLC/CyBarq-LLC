"use client";

import * as React from "react";
import { markPortalNotificationsRead } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ label }: { label: string }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await markPortalNotificationsRead();
            setError(result.ok ? null : result.error);
          })
        }
      >
        {label}
      </Button>
      {error ? <p role="alert" className="text-small text-danger">{error}</p> : null}
    </div>
  );
}
