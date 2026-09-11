import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { FINDING_STATUS_LABELS, SEVERITY_LABELS, label } from "@/lib/labels";
import { deleteFinding } from "@/lib/actions/security";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FindingStatusActions } from "@/components/security/finding-status-actions";
import { EvidencePanel } from "@/components/security/evidence-panel";
import { ConfirmAction } from "@/components/security/confirm-action";

export default async function FindingPage({ params }: { params: Promise<{ id: string; findingId: string }> }) {
  const viewer = await requireEmployee();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("security");
  const tc = await getTranslations("common");
  const { id, findingId } = await params;
  const supabase = await createClient();

  const [{ data: engagement }, { data: finding }] = await Promise.all([
    supabase.from("security_engagements").select("id, code, title").eq("id", id).maybeSingle(),
    supabase.from("findings").select("*, asset:engagement_assets(name, identifier)").eq("id", findingId).eq("engagement_id", id).maybeSingle(),
  ]);
  if (!engagement || !finding) notFound();

  const { data: evidence } = await supabase.from("finding_evidence").select("id, caption, mime_type, size_bytes, created_at, storage_path").eq("finding_id", findingId).order("created_at");

  const canWrite = viewer.can("security.write");
  const canDelete = canWrite && viewer.can("security.read_all");

  const textBlocks: { title: string; value: string | null }[] = [
    { title: t("findings.form.description"), value: finding.description },
    { title: t("findings.form.impact"), value: finding.impact },
    { title: t("findings.form.evidenceSummary"), value: finding.evidence_summary },
    { title: t("findings.form.recommendation"), value: finding.recommendation },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/app/security" className="hover:text-azure">{t("title")}</Link>
            <span aria-hidden>/</span>
            <Link href={`/app/security/${id}?tab=findings`} className="hover:text-azure">{engagement.code}</Link>
            <span aria-hidden>/</span>
            <span>{finding.ref_code}</span>
          </span>
        }
        title={finding.title}
        actions={
          <>
            <Status value={finding.severity} label={label(SEVERITY_LABELS, finding.severity, locale)} />
            <Status value={finding.status} label={label(FINDING_STATUS_LABELS, finding.status, locale)} />
            {canWrite ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/app/security/${id}/findings/${findingId}/edit`}><Pencil aria-hidden /> {tc("edit")}</Link>
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {textBlocks.map((b) => (
            <Card key={b.title}>
              <CardHeader><CardTitle>{b.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-body">{b.value || <span className="text-slate">{tc("none")}</span>}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader><CardTitle>{t("evidence.title")}</CardTitle></CardHeader>
            <CardContent>
              <EvidencePanel findingId={findingId} evidence={evidence ?? []} canWrite={canWrite} />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>{t("findings.lifecycle")}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FindingStatusActions findingId={findingId} engagementId={id} status={finding.status} canWrite={canWrite} />
              {canDelete ? (
                <ConfirmAction
                  action={deleteFinding}
                  fields={{ id: findingId, engagement_id: id }}
                  title={t("findings.deleteTitle")}
                  description={t("findings.deleteDescription")}
                  confirmLabel={tc("delete")}
                  triggerLabel={t("findings.delete")}
                  triggerVariant="ghost"
                  className="self-start text-danger"
                />
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{tc("details")}</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3">
                <Item label={t("findings.form.cvss")} value={finding.cvss_score === null ? tc("none") : finding.cvss_score.toFixed(1)} />
                <Item label={t("findings.form.asset")} value={finding.asset ? `${finding.asset.name}${finding.asset.identifier ? ` (${finding.asset.identifier})` : ""}` : tc("none")} />
                <Item label={t("findings.form.discoveredAt")} value={formatDate(finding.discovered_at, locale) || tc("none")} />
                <Item label={t("findings.form.remediatedAt")} value={formatDate(finding.remediated_at, locale) || tc("none")} />
                <Item label={t("findings.form.retestedAt")} value={formatDate(finding.retested_at, locale) || tc("none")} />
                <Item label={t("findings.form.retestResult")} value={finding.retest_result || tc("none")} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Item({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-label text-slate">{l}</dt>
      <dd className="whitespace-pre-wrap text-body">{value}</dd>
    </div>
  );
}
