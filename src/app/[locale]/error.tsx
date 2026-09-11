"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.errors");
  useEffect(() => {
    // Only the digest is safe to surface; details stay in server logs.
    console.error("[route error]", error.digest ?? error.message);
  }, [error]);
  return (
    <main className="container-page section">
      <ErrorState title={t("serverError")} description={t("serverErrorDescription")} action={<Button onClick={reset} variant="outline">{t("tryAgain")}</Button>} />
    </main>
  );
}
