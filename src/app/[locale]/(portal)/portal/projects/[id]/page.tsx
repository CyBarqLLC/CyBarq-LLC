import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { MILESTONE_STATUS_LABELS, PRACTICE_LABELS, PROJECT_STATUS_LABELS, label } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { EmptyState } from "@/components/ui/states";
import { PortalDocumentUpload } from "@/components/portal/document-upload";

export default async function PortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, code, name_en, name_ar, practice, status, description, start_date, end_date, client:clients(name_en, name_ar)")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [{ data: milestones }, { data: updates }, { data: documents }] = await Promise.all([
    supabase.from("milestones").select("id, title_en, title_ar, description, due_date, status").eq("project_id", id).eq("client_visible", true).order("position").order("due_date"),
    supabase.from("project_updates").select("id, title, body, created_at").eq("project_id", id).eq("client_visible", true).order("created_at", { ascending: false }),
    supabase.from("project_documents").select("id, title, category, size_bytes, created_at").eq("project_id", id).eq("client_visible", true).order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/portal/projects" className="hover:text-azure">{t("projects.title")}</Link>
            <span aria-hidden>/</span>
            <span dir="ltr">{project.code}</span>
          </span>
        }
        title={pick(project, "name", locale)}
        description={`${label(PRACTICE_LABELS, project.practice, locale)}${project.client ? ` · ${pick(project.client, "name", locale)}` : ""}`}
        actions={<Status value={project.status} label={label(PROJECT_STATUS_LABELS, project.status, locale)} />}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {project.description ? (
            <Card>
              <CardHeader><CardTitle>{tc("description")}</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{project.description}</p></CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>{t("projects.milestones")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {(milestones ?? []).length === 0 ? (
                <EmptyState title={t("projects.noMilestones")} className="border-0" />
              ) : (
                <ol className="divide-y divide-fog">
                  {(milestones ?? []).map((m) => (
                    <li key={m.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="font-medium">{pick(m, "title", locale)}</div>
                        {m.description ? <p className="mt-1 text-small text-slate">{m.description}</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-small">
                        {m.due_date ? <span className="text-slate">{formatDate(m.due_date, locale)}</span> : null}
                        <Status value={m.status} label={label(MILESTONE_STATUS_LABELS, m.status, locale)} />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("projects.updates")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {(updates ?? []).length === 0 ? (
                <EmptyState title={t("projects.noUpdates")} className="border-0" />
              ) : (
                <ul className="divide-y divide-fog">
                  {(updates ?? []).map((u) => (
                    <li key={u.id} className="flex flex-col gap-1 px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{u.title}</span>
                        <span className="text-small text-slate">{formatDateTime(u.created_at, locale)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-body">{u.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>{t("projects.documents")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {(documents ?? []).length === 0 ? (
                <EmptyState title={t("projects.noDocuments")} className="border-0" />
              ) : (
                <ul className="divide-y divide-fog">
                  {(documents ?? []).map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{d.title}</div>
                        <div className="text-small text-slate">{formatDate(d.created_at, locale)}</div>
                      </div>
                      <a href={`/api/files/project-documents/${d.id}`} className="touch inline-flex items-center gap-1 px-2 text-small text-azure hover:underline" rel="noopener">
                        <Download className="size-4" aria-hidden /> {tc("download")}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <PortalDocumentUpload projectId={id} />
          <Card>
            <CardContent className="flex flex-col gap-2 text-small">
              <div className="flex justify-between gap-4"><span className="text-slate">{t("projects.columns.dates")}</span><span>{formatDate(project.start_date, locale) || "…"} → {formatDate(project.end_date, locale) || "…"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate">{t("projects.columns.code")}</span><span dir="ltr" className="font-mono">{project.code}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
