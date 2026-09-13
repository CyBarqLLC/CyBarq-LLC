import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pictogram } from "@/components/brand/pictogram";
import { PageIntro } from "@/components/site/page-intro";
import { mirror } from "@/components/site/sheet";
import { VerifyForm, normaliseCode } from "@/components/site/verify-form";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ code?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.verify" });
  return pageMetadata({ locale, path: "/verify", title: t("title"), description: t("seoDescription") });
}

export default async function VerifyPage({ params, searchParams }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const { code } = await searchParams;
  const raw = Array.isArray(code) ? code[0] : code;
  if (raw) {
    const clean = normaliseCode(raw);
    if (clean) redirect(`/${locale}/verify/${encodeURIComponent(clean)}`);
  }

  const t = await getTranslations("site.verify");
  const tn = await getTranslations("site.nav");
  const tMirror = await mirror(locale, "site.nav");

  return (
    <>
      <PageIntro mirrorLabel={tMirror("verify")}
        title={t("title")}
        lead={t("lead")}
        crumbs={[{ href: "/", label: tn("home") }, { label: tn("verify") }]}
        aside={<Pictogram name="certification" className="size-20 text-graphite lg:size-28" />}
      />
      <section className="border-t border-fog">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <VerifyForm action={`/${locale}/verify`} label={t("codeLabel")} hint={t("codeHint")} submit={t("submit")} />
          <p className="max-w-prose text-small text-slate">{t("note")}</p>
        </div>
      </section>
    </>
  );
}
