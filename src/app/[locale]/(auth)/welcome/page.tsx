import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ResetForm } from "../reset-password/reset-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("welcomeTitle"), robots: { index: false, follow: false } };
}

/** Landing page of the invitation email: the person chooses a password and is signed in. */
export default async function WelcomePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string; type?: string }> }) {
  const { locale } = await params;
  const { token, type } = await searchParams;
  if (typeof token !== "string" || token.length < 16) redirect(`/${locale}/login?error=link`);
  const t = await getTranslations("auth");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{t("welcomeTitle")}</h1>
        <p className="mt-2 text-slate">{t("welcomeHint")}</p>
      </div>
      <ResetForm mode="token" token={token} type={type === "recovery" ? "recovery" : "invite"} submitLabel={t("activate")} />
    </div>
  );
}
