import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pictogram } from "@/components/brand/pictogram";
import { PageIntro } from "@/components/site/page-intro";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { PracticeGrid } from "@/components/site/practice-grid";
import { Stats } from "@/components/site/stats";
import { StatementPanel } from "@/components/site/statement-panel";
import { LogoGrid, LogoMarquee } from "@/components/site/logo-strip";
import { CtaPanel } from "@/components/site/cta-panel";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";
import { company } from "@/content/site/company";
import { about } from "@/content/site/about";
import { principles } from "@/content/site/principles";

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

  return (
    <>
      <PageIntro title={about.title[locale]} lead={about.lead[locale]} crumbs={[{ href: "/", label: tn("home") }, { label: tn("about") }]} />

      <section className="border-t border-fog">
        <Reveal className="container-page section grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="s-sub">{t("storyTitle")}</h2>
          <div className="flex max-w-prose flex-col gap-6 s-lede text-graphite">
            {about.story.map((p, i) => (
              <p key={i}>{p[locale]}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-t border-fog">
        <div className="container-page section">
          <SectionHeading title={company.legalName[locale]} className="mb-8 sm:mb-10" />
          <Reveal>
            <Stats locale={locale} />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-fog">
        <div className="container-page section">
          <SectionHeading
            title={about.practicesTitle[locale]}
            lead={about.practicesLead[locale]}
            aside={
              <Link href="/services" className="site-link text-azure">
                {t("practicesLink")}
              </Link>
            }
          />
          <PracticeGrid locale={locale} linkLabel={ts("explore")} />
        </div>
      </section>

      <StatementPanel tone="ice" statement={company.slogan[locale]} body={th("statementBody")} />

      <section>
        <div className="container-page section">
          <SectionHeading title={about.howTitle[locale]} />
          <Reveal stagger className="grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {principles.map((p) => (
              <article key={p.key} className="flex flex-col gap-4 bg-white p-6 sm:p-10">
                <Pictogram name={p.pictogram} className="size-10 text-graphite" />
                <h3 className="s-h3">{p.title[locale]}</h3>
                <p className="text-slate">{p.body[locale]}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="border-t border-fog">
        <div className="section flex flex-col gap-20 sm:gap-24 lg:gap-28">
          <LogoMarquee id="partners" title={th("partnersTitle")} items={company.partners} labels={{ pause: th("logosPause"), play: th("logosPlay"), subject: th("logosSubject") }} />
          <LogoGrid id="certifications" title={th("certificationsTitle")} items={company.certifications} />
        </div>
      </div>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} secondary={{ href: "/careers", label: tn("careers") }} />
    </>
  );
}
