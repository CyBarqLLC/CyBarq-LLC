import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireClientUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/i18n/bilingual";
import { formatDateTime } from "@/lib/utils/format";
import { SUPPORT_STATUS_LABELS, label } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { EmptyState } from "@/components/ui/states";
import { Reference } from "@/components/platform/reference";

type Row = {
  id: string;
  reference: string | null;
  subject: string;
  body: string;
  status: Enums<"support_status">;
  created_at: string;
  updated_at: string;
  project: { id: string; code: string; name_en: string; name_ar: string | null } | null;
};

export default async function PortalSupportPage() {
  await requireClientUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portal");
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_requests")
    .select("id, reference, subject, body, status, created_at, updated_at, project:projects(id, code, name_en, name_ar)")
    .order("created_at", { ascending: false });
  const rows: Row[] = data ?? [];

  return (
    <div>
      <PageHeader
        title={t("support.title")}
        description={t("support.description")}
        actions={
          <Button asChild>
            <Link href="/portal/support/new"><Plus aria-hidden /> {t("support.new")}</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title={t("support.empty")}
          description={t("support.emptyDescription")}
          action={
            <Button asChild variant="outline">
              <Link href="/portal/support/new">{t("support.new")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 border border-fog bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-body font-medium">{r.subject}</h2>
                <Status value={r.status} label={label(SUPPORT_STATUS_LABELS, r.status, locale)} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-small text-slate">
                {/* The reference the client quotes when they write to us about this request. */}
                <Reference value={r.reference} />
                <span>{t("support.createdAt", { date: formatDateTime(r.created_at, locale) })}</span>
                {r.project ? <Link href={`/portal/projects/${r.project.id}`} className="text-azure hover:underline">{pick(r.project, "name", locale)}</Link> : null}
              </div>
              <p className="whitespace-pre-wrap text-body">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
