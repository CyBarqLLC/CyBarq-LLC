import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pictogram } from "@/components/brand/pictogram";
import { Action } from "@/components/site/action";
import { PageIntro } from "@/components/site/page-intro";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { PracticeGrid } from "@/components/site/practice-grid";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { CtaPanel } from "@/components/site/cta-panel";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { about } from "@/content/site/about";
import { principles } from "@/content/site/principles";
import { practices, services } from "@/content/services";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.about" });
  return pageMetadata({ locale, path: "/about", title: t("title"), description: t("seoDescription") });
}

export default async function AboutPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.about");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");
  const ts = await getTranslations("site.services");

  const figures = [
    { value: String(practices.length), label: th("figures.practices") },
    { value: String(services.length), label: th("figures.services") },
    ...company.stats.map((stat) => ({ value: stat.value, label: stat.label[locale] })),
  ];

  return (
    <>
      <PageIntro title={about.title[locale]} lead={about.lead[locale]} crumbs={[{ href: "/", label: tn("home") }, { label: tn("about") }]} />

      <section className="s-section">
        <div className="container-page">
          <div className="s-narrative">
            <h2 className="s-title">{t("storyTitle")}</h2>
            <Reveal className="s-prose">
              {about.story.map((p, i) => (
                <p key={i}>{p[locale]}</p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="s-section s-field-lime text-graphite" aria-labelledby="numbers-title">
        <div className="container-page">
          <Reveal stagger className="mb-16 flex flex-col gap-6 lg:mb-20">
            <h2 id="numbers-title" className="s-display max-w-4xl">
              {company.slogan[locale]}
            </h2>
            <p className="s-lede max-w-2xl">{th("statementBody")}</p>
          </Reveal>
          <Reveal as="dl" stagger className="s-figures">
            {figures.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd className="s-figure">{f.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="s-section" aria-labelledby="practices-title">
        <div className="container-page">
          <SectionHeading id="practices-title" title={about.practicesTitle[locale]} lead={about.practicesLead[locale]} />
          <PracticeGrid locale={locale} countLabel={(count) => ts("count", { count })} />
          <Reveal className="mt-10 flex">
            <Action href="/services" variant="line" arrow>
              {t("practicesLink")}
            </Action>
          </Reveal>
        </div>
      </section>

      <section className="s-section s-field-surface" aria-labelledby="how-title">
        <div className="container-page">
          <SectionHeading id="how-title" title={about.howTitle[locale]} lead={th("approachLead")} />
          <ul className="s-rows">
            {principles.map((p) => (
              <Reveal as="li" key={p.key} className="s-row">
                <Pictogram name={p.pictogram} className="size-10 text-azure" />
                <h3 className="s-sub">{p.title[locale]}</h3>
                <p className="s-row__body">{p.body[locale]}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="s-section" aria-label={th("partnersTitle")}>
        <div className="container-page flex flex-col gap-20 lg:gap-24">
          <LogoMarquee id="partners" title={th("partnersTitle")} items={company.partners} labels={{ pause: th("logosPause"), play: th("logosPlay"), subject: th("logosSubject") }} />
          <LogoGrid id="credentials" title={t("credentialsTitle")} items={company.certifications} />
        </div>
      </section>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} secondary={{ href: "/careers", label: tn("careers") }} />
    </>
  );
}
