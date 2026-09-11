import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils/format";
import { createProjectUpdate, deleteProjectUpdate } from "@/lib/actions/projects";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { SectionCard } from "@/components/platform/section-card";
import { Person } from "@/components/platform/person";
import { ConfirmAction } from "@/components/platform/confirm-action";
import { getProject, canManageProject } from "../project-data";
import { UpdateForm } from "./update-form";

export default async function ProjectUpdatesPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireEmployee();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects.updates");
  const manage = await canManageProject(viewer, project);
  const supabase = await createClient();
  const { data: updates } = await supabase
    .from("project_updates")
    .select("id, title, body, client_visible, created_at, author:profiles!project_updates_author_id_fkey(full_name, full_name_ar, email, avatar_path)")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const list = updates ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        {list.length === 0 ? (
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        ) : (
          <ol className="flex flex-col gap-3">
            {list.map((u) => (
              <li key={u.id} className="border border-fog bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-body font-medium">{u.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-small text-slate">
                      <Person person={u.author} locale={locale} />
                      <span>{formatDateTime(u.created_at, locale)}</span>
                      <Badge variant={u.client_visible ? "blue" : "neutral"}>{u.client_visible ? t("clientBadge") : t("internalBadge")}</Badge>
                    </div>
                  </div>
                  {manage ? (
                    <ConfirmAction
                      action={deleteProjectUpdate.bind(null, project.id, u.id)}
                      title={t("deleteTitle")}
                      confirmLabel={t("delete")}
                      triggerLabel={t("delete")}
                      triggerVariant="ghost"
                      destructive
                      successMessage={t("deleted")}
                    />
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-line text-body">{u.body}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <SectionCard title={t("add")} description={t("description")}>
        <UpdateForm action={createProjectUpdate.bind(null, project.id)} />
      </SectionCard>
    </div>
  );
}
