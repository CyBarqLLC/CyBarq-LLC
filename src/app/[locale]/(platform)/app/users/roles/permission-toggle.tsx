"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setRolePermission } from "@/lib/actions/users";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils/cn";

function ToggleButton({ granted, label }: { granted: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-pressed={granted}
      aria-label={label}
      disabled={pending}
      className={cn(
        "touch mx-auto flex items-center justify-center border transition-colors",
        granted ? "border-graphite bg-graphite text-white hover:bg-slate" : "border-fog bg-white text-transparent hover:border-grey",
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin text-slate" aria-hidden /> : <Check className="size-4" aria-hidden />}
    </button>
  );
}

/** One cell of the role matrix: submitting flips the permission. */
export function PermissionToggle({ roleKey, permissionKey, granted, label, successMessage }: { roleKey: string; permissionKey: string; granted: boolean; label: string; successMessage: string }) {
  const [result, formAction] = useActionState(setRolePermission, null);
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (result && handled.current !== result) {
      handled.current = result;
      if (result.ok) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
  }, [result, router, successMessage]);
  return (
    <form action={formAction} className="flex justify-center">
      <input type="hidden" name="role_key" value={roleKey} />
      <input type="hidden" name="permission_key" value={permissionKey} />
      <input type="hidden" name="granted" value={granted ? "false" : "true"} />
      <ToggleButton granted={granted} label={label} />
    </form>
  );
}
