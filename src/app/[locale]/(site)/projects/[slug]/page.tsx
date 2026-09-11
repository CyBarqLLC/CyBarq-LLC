import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/i18n/bilingual";
import { label, PRACTICE_LABELS } from "@/lib/labels";
import { getProject, coverImage } from "@/lib/data/public-content";
import { practiceByEnum } from "@/content/services";
import { PostHeader } from "@/components/site/post-header";
import { ContentBody } from "@/components/site/content-body";
import { CtaPanel } from "@/components/site/cta-panel";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({
    locale,
    path: `/projects/${project.slug}`,
    title: pick(project, "seo_title", locale) || pick(project, "title", locale),
    description: pick(project, "seo_description", locale) || pick(project, "summary", locale),
    image: coverImage(project, locale)?.src ?? null,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  const project = await getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("site.content");
  const tn = await getTranslations("site.nav");
  const th = await getTranslations("site.home");
  const practice = practiceByEnum(project.practice);
  const services = locale === "ar" && project.services_ar.length > 0 ? project.services_ar : project.services_en.length > 0 ? project.services_en : project.services_ar;
  const client = pick(project, "client_display_name", locale);

  return (
    <>
      <PostHeader
        crumbs={[{ href: "/", label: tn("home") }, { href: "/projects", label: tn("projects") }, { label: pick(project, "title", locale) }]}
        title={pick(project, "title", locale)}
        lead={pick(project, "summary", locale) || null}
        meta={[label(PRACTICE_LABELS, project.practice, locale), client ? `${t("client")}: ${client}` : null, project.year ? `${t("year")}: ${project.year}` : null]}
        cover={coverImage(project, locale)}
      />

      <div className="container-page grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-20">
        <ContentBody html={pick(project, "body", locale)} />
        <aside className="flex flex-col gap-8 lg:border-s lg:border-fog lg:ps-8">
          {services.length > 0 ? (
            <div>
              <h2 className="text-label text-slate">{t("projects.servicesDelivered")}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {services.map((s) => (
                  <li key={s} className="border-t border-fog pt-2">{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {practice ? (
            <div>
              <h2 className="text-label text-slate">{t("relatedPractice")}</h2>
              <Link href={`/services/${practice.slug}`} className="site-link mt-3 inline-block text-azure">
                {t("moreInPractice", { practice: practice.title[locale] })}
              </Link>
            </div>
          ) : null}
          <Link href="/projects" className="site-link self-start text-small text-slate hover:text-graphite">
            {t("projects.backToList")}
          </Link>
        </aside>
      </div>

      <CtaPanel title={th("ctaTitle")} body={th("ctaBody")} primary={{ href: "/contact", label: th("ctaButton") }} />
    </>
  );
}
