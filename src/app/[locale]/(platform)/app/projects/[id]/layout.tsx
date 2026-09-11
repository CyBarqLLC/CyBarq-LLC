import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { requireEmployee } from "@/lib/auth/session";
import { label, PRACTICE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { TabNav } from "@/components/platform/tab-nav";
import { getProject, canManageProject } from "./project-data";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects");
  const manage = await canManageProject(viewer, project);
  const base = `/app/projects/${project.id}`;

  const tabs = [
    { href: base, label: t("tabs.overview"), exact: true },
    { href: `${base}/members`, label: t("tabs.members") },
    { href: `${base}/milestones`, label: t("tabs.milestones") },
    { href: `${base}/tasks`, label: t("tabs.tasks") },
    { href: `${base}/updates`, label: t("tabs.updates") },
    { href: `${base}/documents`, label: t("tabs.documents") },
    { href: `${base}/activity`, label: t("tabs.activity") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/projects" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <span className="font-mono">{project.code}</span>
            <Status value={project.status} label={label(PROJECT_STATUS_LABELS, project.status, locale)} />
          </span>
        }
        title={pick(project, "name", locale)}
        description={[project.client ? pick(project.client, "name", locale) : null, label(PRACTICE_LABELS, project.practice, locale)].filter(Boolean).join(" · ")}
        actions={manage ? (
          <Button asChild variant="outline">
            <Link href={`${base}/edit`}>{t("edit")}</Link>
          </Button>
        ) : undefined}
      />
      <TabNav items={tabs} ariaLabel={t("title")} className="mb-6" />
      {children}
    </>
  );
}
