import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./reset-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("resetTitle"), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?error=link`);
  const t = await getTranslations("auth");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{t("resetTitle")}</h1>
        <p className="mt-2 text-slate">{t("resetHint")}</p>
      </div>
      <ResetForm />
    </div>
  );
}
