import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Pencil, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { param, type SearchParams } from "@/lib/data/paginate";
import { pick } from "@/i18n/bilingual";
import { formatDate } from "@/lib/utils/format";
import { ENGAGEMENT_STATUS_LABELS, ENGAGEMENT_TYPE_LABELS, FINDING_STATUS_LABELS, SEVERITY_LABELS, label } from "@/lib/labels";
import { FINDING_STATUS_ORDER, SEVERITY_ORDER } from "@/lib/validation/security";
import { deleteEngagement } from "@/lib/actions/security";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngagementTabs, type TabDefinition } from "@/components/security/engagement-tabs";
import { StatusActions } from "@/components/security/status-actions";
import { AuthorisationPanel } from "@/components/security/authorisation-panel";
import { TeamPanel, type MemberRow } from "@/components/security/team-panel";
import { AssetsPanel, type AssetRow } from "@/components/security/assets-panel";
import { ReportsPanel, type ReportRow } from "@/components/security/reports-panel";
import { SeveritySummary, aggregateSeverity } from "@/components/security/severity-summary";
import { ConfirmAction } from "@/components/security/confirm-action";
import { loadEmployees } from "@/components/security/data";
import type { Enums } from "@/lib/supabase/database.types";

type FindingListRow = {
  id: string;
  ref_code: string;
  title: string;
  severity: Enums<"finding_severity">;
  cvss_score: number | null;
  status: Enums<"finding_status">;
  discovered_at: string | null;
  asset: { name: string } | null;
};

function personName(p: { full_name: string; full_name_ar: string | null } | null, locale: Locale): string {
  if (!p) return "";
  return locale === "ar" ? p.full_name_ar || p.full_name : p.full_name;
}

export default async function EngagementPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("security");
  const tc = await getTranslations("common");
  const { id } = await params;
  const sp = await searchParams;
  const tab = param(sp, "tab") ?? "overview";
  const supabase = await createClient();

  const { data: engagement } = await supabase
    .from("security_engagements")
    .select(
      "*, client:clients(id, name_en, name_ar), project:projects(id, code, name_en, name_ar), lead:profiles!security_engagements_lead_user_id_fkey(full_name, full_name_ar)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!engagement) notFound();

  const [{ data: memberRows }, { data: assets }, { data: findings }, { data: reportRows }, employees] = await Promise.all([
    supabase.from("engagement_members").select("user_id, role, profile:profiles(full_name, full_name_ar, email)").eq("engagement_id", id).order("created_at"),
    supabase.from("engagement_assets").select("id, name, type, identifier, in_scope, notes").eq("engagement_id", id).order("created_at"),
    supabase.from("findings").select("id, ref_code, title, severity, cvss_score, status, discovered_at, asset:engagement_assets(name)").eq("engagement_id", id),
    supabase.from("engagement_reports").select("id, version, title, status, client_visible, issued_at, created_at, uploader:profiles!engagement_reports_uploaded_by_fkey(full_name, full_name_ar)").eq("engagement_id", id).order("version", { ascending: false }),
    viewer.can("security.write") ? loadEmployees(supabase) : Promise.resolve([]),
  ]);

  const members: MemberRow[] = (memberRows ?? []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    full_name: m.profile?.full_name ?? "",
    full_name_ar: m.profile?.full_name_ar ?? null,
    email: m.profile?.email ?? null,
  }));
  const assetList: AssetRow[] = assets ?? [];
  const findingList: FindingListRow[] = [...(findings ?? [])].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || FINDING_STATUS_ORDER[a.status] - FINDING_STATUS_ORDER[b.status] || a.ref_code.localeCompare(b.ref_code),
  );
  const reports: ReportRow[] = (reportRows ?? []).map((r) => ({
    id: r.id,
    version: r.version,
    title: r.title,
    status: r.status,
    client_visible: r.client_visible,
    issued_at: r.issued_at,
    created_at: r.created_at,
    uploader: r.uploader ? personName(r.uploader, locale) : null,
  }));
  const severity = aggregateSeverity(findingList.map((f) => ({ engagement_id: id, severity: f.severity, status: f.status }))).get(id);

  const canWrite = viewer.can("security.write");
  const canReport = viewer.can("security.report");
  const canDelete = canWrite && viewer.can("security.read_all") && engagement.status === "scoping";
  const base = `/app/security/${id}`;

  const findingColumns: Column<FindingListRow>[] = [
    { key: "ref", header: t("findings.columns.ref"), primary: true, cell: (f) => <span className="font-medium">{f.ref_code} · {f.title}</span> },
    { key: "severity", header: t("findings.columns.severity"), cell: (f) => <Status value={f.severity} label={label(SEVERITY_LABELS, f.severity, locale)} /> },
    { key: "cvss", header: t("findings.columns.cvss"), cell: (f) => (f.cvss_score === null ? <span className="text-slate">{tc("none")}</span> : f.cvss_score.toFixed(1)) },
    { key: "status", header: t("findings.columns.status"), cell: (f) => <Status value={f.status} label={label(FINDING_STATUS_LABELS, f.status, locale)} /> },
    { key: "asset", header: t("findings.columns.asset"), cell: (f) => f.asset?.name ?? <span className="text-slate">{tc("none")}</span> },
    { key: "discovered", header: t("findings.columns.discovered"), cell: (f) => formatDate(f.discovered_at, locale) },
  ];

  const detail: { label: string; value: ReactNode }[] = [
    { label: t("form.type"), value: label(ENGAGEMENT_TYPE_LABELS, engagement.type, locale) },
    { label: t("form.client"), value: engagement.client ? <Link href={`/app/clients/${engagement.client.id}`} className="text-azure hover:underline">{pick(engagement.client, "name", locale)}</Link> : tc("none") },
    { label: t("form.project"), value: engagement.project ? <Link href={`/app/projects/${engagement.project.id}`} className="text-azure hover:underline">{engagement.project.code} · {pick(engagement.project, "name", locale)}</Link> : tc("none") },
    { label: t("form.lead"), value: personName(engagement.lead, locale) || tc("none") },
    { label: t("form.startDate"), value: formatDate(engagement.start_date, locale) || tc("none") },
    { label: t("form.endDate"), value: formatDate(engagement.end_date, locale) || tc("none") },
    { label: t("form.authorisedBy"), value: engagement.authorised_by_name || tc("none") },
    { label: t("form.authorisedAt"), value: formatDate(engagement.authorised_at, locale) || tc("none") },
  ];

  const overview = (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("overview.details")}</CardTitle>
            {canWrite ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/app/security/${id}/edit`}><Pencil aria-hidden /> {tc("edit")}</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {detail.map((d) => (
                <div key={d.label} className="flex flex-col gap-0.5">
                  <dt className="text-label text-slate">{d.label}</dt>
                  <dd className="text-body">{d.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("form.scopeSummary")}</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-body">{engagement.scope_summary || <span className="text-slate">{t("overview.noScope")}</span>}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("form.rules")}</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-body">{engagement.rules_of_engagement || <span className="text-slate">{t("overview.noRules")}</span>}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle>{t("overview.lifecycle")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-small text-slate">{tc("status")}</span>
              <Status value={engagement.status} label={label(ENGAGEMENT_STATUS_LABELS, engagement.status, locale)} />
            </div>
            <StatusActions engagementId={id} status={engagement.status} canWrite={canWrite} />
            {canDelete ? (
              <ConfirmAction
                action={deleteEngagement}
                fields={{ id }}
                title={t("overview.deleteTitle")}
                description={t("overview.deleteDescription")}
                confirmLabel={tc("delete")}
                triggerLabel={t("overview.delete")}
                triggerVariant="ghost"
                className="self-start text-danger"
              />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("authorisation.title")}</CardTitle></CardHeader>
          <CardContent>
            <AuthorisationPanel
              engagementId={id}
              hasDocument={!!engagement.authorisation_document_path}
              fileName={engagement.authorisation_document_path ? (engagement.authorisation_document_path.split("/").pop() ?? null) : null}
              canWrite={canWrite}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("overview.findingsSummary")}</CardTitle></CardHeader>
          <CardContent>
            <SeveritySummary counts={severity} locale={locale} emptyLabel={t("list.noFindings")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const findingsTab = (
    <div className="flex flex-col gap-4">
      {canWrite ? (
        <div className="flex justify-end">
          <Button asChild size="sm">
            <Link href={`/app/security/${id}/findings/new`}><Plus aria-hidden /> {t("findings.new")}</Link>
          </Button>
        </div>
      ) : null}
      <DataTable
        rows={findingList}
        columns={findingColumns}
        rowKey={(f) => f.id}
        rowHref={(f) => `${base}/findings/${f.id}`}
        emptyTitle={t("findings.empty")}
        emptyDescription={t("findings.emptyDescription")}
        caption={t("tabs.findings")}
      />
    </div>
  );

  const tabs: TabDefinition[] = [
    { value: "overview", label: t("tabs.overview"), content: overview },
    { value: "team", label: t("tabs.team"), count: members.length, content: <TeamPanel engagementId={id} members={members} employees={employees} leadUserId={engagement.lead_user_id} canWrite={canWrite} /> },
    { value: "scope", label: t("tabs.scope"), count: assetList.length, content: <AssetsPanel engagementId={id} assets={assetList} canWrite={canWrite} /> },
    { value: "findings", label: t("tabs.findings"), count: findingList.length, content: findingsTab },
    { value: "reports", label: t("tabs.reports"), count: reports.length, content: <ReportsPanel engagementId={id} reports={reports} canWrite={canWrite} canReport={canReport} /> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/security" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <span>{engagement.code}</span>
          </span>
        }
        title={engagement.title}
        description={`${label(ENGAGEMENT_TYPE_LABELS, engagement.type, locale)}${engagement.client ? ` · ${pick(engagement.client, "name", locale)}` : ""}`}
        actions={<Status value={engagement.status} label={label(ENGAGEMENT_STATUS_LABELS, engagement.status, locale)} />}
      />
      <EngagementTabs tabs={tabs} current={tab} label={t("overview.details")} />
    </div>
  );
}
