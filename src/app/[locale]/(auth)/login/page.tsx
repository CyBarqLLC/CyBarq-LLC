import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signIn"), robots: { index: false, follow: false } };
}

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; error?: string }> }) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  const viewer = await getViewer();
  if (viewer) redirect(viewer.isClient ? `/${locale}/portal` : `/${locale}/app`);
  const t = await getTranslations("auth");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{t("signIn")}</h1>
        <p className="mt-2 text-slate">{t("signInHint")}</p>
      </div>
      {error === "link" ? <p role="alert" className="border border-danger-soft bg-danger-soft px-3 py-2 text-small text-danger">{t("linkError")}</p> : null}
      <LoginForm next={next} />
    </div>
  );
}
