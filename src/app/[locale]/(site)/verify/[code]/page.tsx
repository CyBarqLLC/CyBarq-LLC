import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/i18n/bilingual";
import { createPublicClient } from "@/lib/supabase/server";
import { rateLimit, requestIp, hashIp } from "@/lib/rate-limit";
import { formatDate } from "@/lib/utils/format";
import { label, CERTIFICATE_TYPE_LABELS } from "@/lib/labels";
import { Blade } from "@/components/brand/elements";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/site/page-intro";
import { VerifyForm, normaliseCode } from "@/components/site/verify-form";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; code: string }> };

const VERIFY_RATE_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.verify" });
  return pageMetadata({ locale, path: "/verify", title: t("title"), description: t("seoDescription"), noIndex: true });
}

export default async function VerifyCodePage({ params }: Props) {
  const { locale: raw, code: rawCode } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const t = await getTranslations("site.verify");
  const tn = await getTranslations("site.nav");
  const code = normaliseCode(decodeURIComponent(rawCode));

  const ip = await requestIp();
  const { allowed } = await rateLimit({ key: `verify:${hashIp(ip)}`, ...VERIFY_RATE_LIMIT });

  let certificate: Awaited<ReturnType<typeof lookup>> = null;
  if (allowed && code) certificate = await lookup(code);

  const rows: Array<{ key: string; label: string; value: string }> = [];
  if (certificate) {
    const type = certificate.type ? label(CERTIFICATE_TYPE_LABELS, certificate.type, locale) : "";
    const period = [certificate.start_date, certificate.end_date].filter(Boolean).map((d) => formatDate(d, locale, "long")).join(locale === "ar" ? " إلى " : " to ");
    const push = (key: string, value: string | null | undefined) => {
      if (value && value.trim() !== "") rows.push({ key, label: t(`fields.${key}`), value });
    };
    push("number", certificate.certificate_no);
    push("type", type);
    push("recipient", pick(certificate, "recipient_name", locale));
    push("title", pick(certificate, "title", locale));
    push("program", pick(certificate, "program_name", locale));
    push("period", period);
    push("issued", certificate.issue_date ? formatDate(certificate.issue_date, locale, "long") : null);
    if (certificate.status === "revoked") push("revokedOn", certificate.revoked_at ? formatDate(certificate.revoked_at, locale, "long") : null);
  }
  const revoked = certificate?.status === "revoked";

  return (
    <>
      <PageIntro title={t("title")} eyebrow={t("resultEyebrow")} crumbs={[{ href: "/", label: tn("home") }, { href: "/verify", label: tn("verify") }, { label: code || "" }]} />

      <section className="border-t border-fog">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            {!allowed ? (
              <ResultPanel tone="warning" title={t("rateLimitedTitle")} body={t("rateLimitedBody")} />
            ) : certificate ? (
              <div className="border border-fog">
                <div className={cn("flex items-center gap-3 border-b border-fog px-6 py-5", revoked ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
                  <Blade className="size-4" rotate={revoked ? 180 : 0} />
                  <p className="text-h3">{revoked ? t("statusRevoked") : t("statusValid")}</p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate">{revoked ? t("revokedBody") : t("validBody")}</p>
                  <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {rows.map((r) => (
                      <div key={r.key} className="flex flex-col gap-1 border-t border-fog pt-3">
                        <dt className="text-label text-slate">{r.label}</dt>
                        <dd className={cn("text-body", r.key === "number" && "font-mono tabular-nums")}>{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : (
              <ResultPanel tone="neutral" title={t("notFoundTitle")} body={t("notFoundBody")} />
            )}
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/verify">{t("checkAnother")}</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <VerifyForm action={`/${locale}/verify`} label={t("codeLabel")} hint={t("codeHint")} submit={t("submit")} defaultValue={code} />
            <p className="max-w-prose text-small text-slate">{t("note")}</p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Calls the public RPC. Returns the single row or null; never throws to the page. */
async function lookup(code: string) {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("verify_certificate", { _code: code });
    if (error) {
      console.error("[verify] rpc failed:", error.message);
      return null;
    }
    return data?.[0] ?? null;
  } catch (e) {
    console.error("[verify] rpc failed:", e);
    return null;
  }
}

function ResultPanel({ tone, title, body }: { tone: "warning" | "neutral"; title: string; body: string }) {
  return (
    <div className="border border-fog">
      <div className={cn("flex items-center gap-3 border-b border-fog px-6 py-5", tone === "warning" ? "bg-warning-soft text-warning" : "bg-surface text-graphite")}>
        <Blade className="size-4" />
        <p className="text-h3">{title}</p>
      </div>
      <p className="px-6 py-5 text-slate">{body}</p>
    </div>
  );
}
