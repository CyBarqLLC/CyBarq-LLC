import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotForm } from "./forgot-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("forgotTitle"), robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{t("forgotTitle")}</h1>
        <p className="mt-2 text-slate">{t("forgotHint")}</p>
      </div>
      <ForgotForm />
    </div>
  );
}
