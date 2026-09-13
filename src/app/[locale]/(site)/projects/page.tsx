import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pick } from "@/i18n/bilingual";
import { label, PRACTICE_LABELS } from "@/lib/labels";
import { listProjects, coverImage } from "@/lib/data/public-content";
import { EmptyState } from "@/components/ui/states";
import { PageIntro } from "@/components/site/page-intro";
import { mirror } from "@/components/site/sheet";
import { ContentCard, ContentGrid } from "@/components/site/content-card";
import { pageMetadata, resolveLocale } from "@/components/site/metadata";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "site.content.projects" });
  return pageMetadata({ locale, path: "/projects", title: t("title"), description: t("seoDescription") });
}

export default async function ProjectsPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("site.content.projects");
  const tn = await getTranslations("site.nav");
  const tMirror = await mirror(locale, "site.nav");
  const projects = await listProjects();

  return (
    <>
      <PageIntro mirrorLabel={tMirror("projects")} title={t("title")} lead={t("lead")} crumbs={[{ href: "/", label: tn("home") }, { label: tn("projects") }]} />
      <div className="container-page pb-16 sm:pb-24">
        {projects.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <ContentGrid>
            {projects.map((p) => (
              <ContentCard
                key={p.id}
                href={`/projects/${p.slug}`}
                title={pick(p, "title", locale)}
                excerpt={pick(p, "summary", locale) || null}
                category={label(PRACTICE_LABELS, p.practice, locale)}
                meta={[pick(p, "client_display_name", locale), p.year ? String(p.year) : null].filter(Boolean).join(" · ") || null}
                image={coverImage(p, locale)}
              />
            ))}
          </ContentGrid>
        )}
      </div>
    </>
  );
}
