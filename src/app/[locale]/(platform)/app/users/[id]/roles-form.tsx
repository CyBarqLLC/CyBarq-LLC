"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/lib/actions/result";

/** Role matrix form; the checkboxes are server rendered children. */
export function UserRolesForm({ action, children }: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>; children: React.ReactNode }) {
  const [result, formAction] = useActionState(action, null);
  const t = useTranslations("platform.users.detail");
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (result?.ok && handled.current !== result) {
      handled.current = result;
      toast.success(t("rolesSaved"));
      router.refresh();
    }
  }, [result, router, t]);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {children}
      <FormMessage result={result} />
      <div>
        <SubmitButton size="sm">{t("saveRoles")}</SubmitButton>
      </div>
    </form>
  );
}
