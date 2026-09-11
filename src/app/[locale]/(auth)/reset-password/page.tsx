import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/session";
import { ResetForm } from "./reset-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("resetTitle"), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string; type?: string }> }) {
  const { locale } = await params;
  const { token, type } = await searchParams;
  const t = await getTranslations("auth");
  const hasToken = typeof token === "string" && token.length >= 16;
  if (!hasToken) {
    // Without a link token this page is only for people who are already signed in.
    const viewer = await getViewer();
    if (!viewer) redirect(`/${locale}/login?error=link`);
  }
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{t("resetTitle")}</h1>
        <p className="mt-2 text-slate">{t("resetHint")}</p>
      </div>
      {hasToken ? <ResetForm mode="token" token={token} type={type === "invite" ? "invite" : "recovery"} /> : <ResetForm mode="session" />}
    </div>
  );
}
