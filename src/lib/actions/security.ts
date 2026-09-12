"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireEmployee, requirePermission, type Viewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { actionError } from "@/lib/actions/messages";
import { formToObject, uuid } from "@/lib/validation/common";
import {
  engagementSchema,
  engagementStatusSchema,
  memberSchema,
  removeMemberSchema,
  assetSchema,
  assetIdSchema,
  findingSchema,
  findingIdSchema,
  findingStatusSchema,
  evidenceRegisterSchema,
  reportRegisterSchema,
  reportIdSchema,
  reportVisibilitySchema,
  uploadFileSchema,
  nextEngagementStatuses,
  FINDING_TRANSITIONS,
  type UploadFile,
} from "@/lib/validation/security";
import { signedUploadUrl, signedDownloadUrl, safeFileName, removeStoredFiles } from "@/lib/storage";
import { displayFileName } from "@/lib/utils/format";
import { audit } from "@/lib/audit";
import { businessToday } from "@/lib/time";

const SECURITY_LIST = "/[locale]/app/security";
const ENGAGEMENT_PAGE = "/[locale]/app/security/[id]";
const FINDING_PAGE = "/[locale]/app/security/[id]/findings/[findingId]";

type UploadTicket = { signedUrl: string; token: string; path: string };

function nul<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

function revalidateEngagement() {
  revalidatePath(SECURITY_LIST, "page");
  revalidatePath(ENGAGEMENT_PAGE, "page");
}

/** Thrown to reuse the safe Postgres code mapping in toActionError. */
class NotFound extends Error {
  readonly code = "PGRST116";
}
class Forbidden extends Error {
  readonly code = "42501";
}

/**
 * Confirms the viewer may write files for this engagement: security.write plus
 * (security.read_all or membership). Mirrors the storage insert policy, which
 * the signed upload ticket would otherwise bypass.
 */
async function assertEngagementWriter(viewer: Viewer, engagementId: string): Promise<{ id: string; client_id: string | null }> {
  if (!viewer.can("security.write")) throw new Forbidden();
  const supabase = await createClient();
  const { data: engagement } = await supabase.from("security_engagements").select("id, client_id, lead_user_id").eq("id", engagementId).maybeSingle();
  if (!engagement) throw new NotFound();
  if (viewer.can("security.read_all") || engagement.lead_user_id === viewer.userId) return { id: engagement.id, client_id: engagement.client_id };
  const { data: membership } = await supabase.from("engagement_members").select("user_id").eq("engagement_id", engagementId).eq("user_id", viewer.userId).maybeSingle();
  if (!membership) throw new Forbidden();
  return { id: engagement.id, client_id: engagement.client_id };
}

// ---------------------------------------------------------------------------
// Engagements
// ---------------------------------------------------------------------------

function engagementRow(input: ReturnType<typeof engagementSchema.parse>) {
  return {
    // An emptied field keeps the code the engagement already has; only the database assigns one, and only on insert.
    ...(input.code ? { code: input.code.toUpperCase() } : {}),
    client_id: nul(input.client_id),
    project_id: nul(input.project_id),
    title: input.title,
    type: input.type,
    start_date: nul(input.start_date),
    end_date: nul(input.end_date),
    lead_user_id: nul(input.lead_user_id),
    scope_summary: nul(input.scope_summary),
    rules_of_engagement: nul(input.rules_of_engagement),
    authorised_by_name: nul(input.authorised_by_name),
    authorised_at: nul(input.authorised_at),
  };
}

export async function createEngagement(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    await requirePermission("security.write", "action");
    const input = engagementSchema.parse(formToObject(formData));
    const supabase = await createClient();
    // One database call creates the engagement and its roster (lead, and the creator so they can see it).
    const { data, error } = await supabase.rpc("create_engagement", {
      _code: input.code.toUpperCase(),
      _title: input.title,
      _type: input.type,
      _client_id: input.client_id,
      _project_id: input.project_id,
      _lead_user_id: input.lead_user_id,
      _start_date: input.start_date,
      _end_date: input.end_date,
      _scope_summary: input.scope_summary,
      _rules_of_engagement: input.rules_of_engagement,
      _authorised_by_name: input.authorised_by_name,
      _authorised_at: input.authorised_at,
    });
    if (error) throw error;
    revalidatePath(SECURITY_LIST, "page");
    return ok({ id: data.id });
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: `/app/security/${result.data.id}`, locale });
  }
  return result;
}

export async function updateEngagement(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    await requirePermission("security.write", "action");
    const input = engagementSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("security_engagements").update(engagementRow(input)).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail(await actionError("notFound"), "NOT_FOUND");
    revalidateEngagement();
    return ok({ id: data.id });
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: `/app/security/${id}`, locale });
  }
  return result;
}

export async function changeEngagementStatus(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = engagementStatusSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data: current } = await supabase.from("security_engagements").select("id, status, authorised_by_name, authorised_at").eq("id", input.id).maybeSingle();
    if (!current) return fail(await actionError("notFound"), "NOT_FOUND");
    if (!nextEngagementStatuses(current.status).includes(input.status)) {
      return fail(await actionError("statusTransition"), "VALIDATION");
    }
    if (input.status === "authorised" && (!current.authorised_by_name || !current.authorised_at)) {
      return fail(await actionError("authorisationMissing"), "VALIDATION");
    }
    const { error } = await supabase.from("security_engagements").update({ status: input.status }).eq("id", input.id).eq("status", current.status);
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function deleteEngagement(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const result = await runAction(async () => {
    await requirePermission("security.write", "action");
    const id = uuid.parse(String(formData.get("id") ?? ""));
    const supabase = await createClient();
    // Collect the stored files first: the rows that point at them disappear with the engagement.
    const [{ data: engagement }, { data: reports }, { data: evidence }] = await Promise.all([
      supabase.from("security_engagements").select("authorisation_document_path").eq("id", id).maybeSingle(),
      supabase.from("engagement_reports").select("storage_path").eq("engagement_id", id),
      supabase.from("finding_evidence").select("storage_path, finding:findings!inner(engagement_id)").eq("finding.engagement_id", id),
    ]);
    const { data, error } = await supabase.from("security_engagements").delete().eq("id", id).eq("status", "scoping").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("onlyScopingDeletable"), "FORBIDDEN");
    await removeStoredFiles("private-security-reports", [
      engagement?.authorisation_document_path ?? null,
      ...(reports ?? []).map((r) => r.storage_path),
      ...(evidence ?? []).map((r) => r.storage_path),
    ]);
    revalidatePath(SECURITY_LIST, "page");
    return ok(undefined);
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: "/app/security", locale });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Authorisation document (private-security-reports/<engagement>/authorisation/<file>)
// ---------------------------------------------------------------------------

export async function requestAuthorisationUpload(engagementId: string, file: UploadFile): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const parsed = uploadFileSchema.parse(file);
    const engagement = await assertEngagementWriter(viewer, engagementId);
    const path = `${engagement.id}/authorisation/${randomUUID()}-${safeFileName(parsed.name)}`;
    const ticket = await signedUploadUrl("private-security-reports", path);
    return ok(ticket);
  });
}

export async function setAuthorisationDocument(engagementId: string, upload: { path: string }): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const engagement = await assertEngagementWriter(viewer, engagementId);
    if (!upload.path.startsWith(`${engagement.id}/authorisation/`)) return fail(await actionError("filePath"), "VALIDATION");
    const supabase = await createClient();
    const { error } = await supabase.from("security_engagements").update({ authorisation_document_path: upload.path }).eq("id", engagement.id);
    if (error) throw error;
    await audit("engagement.authorisation_uploaded", "security_engagement", engagement.id, {}, engagement.client_id);
    revalidateEngagement();
    return ok(undefined);
  });
}

/** Signed URL for the authorisation document. Visibility is decided by RLS on the engagement row. */
export async function getAuthorisationDownloadUrl(engagementId: string): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    await requireEmployee();
    const supabase = await createClient();
    const { data } = await supabase.from("security_engagements").select("id, client_id, authorisation_document_path").eq("id", engagementId).maybeSingle();
    if (!data || !data.authorisation_document_path) return fail(await actionError("notFound"), "NOT_FOUND");
    const fileName = displayFileName(data.authorisation_document_path) || "authorisation";
    const url = await signedDownloadUrl("private-security-reports", data.authorisation_document_path, fileName);
    await audit("file.accessed", "security_engagement", data.id, { kind: "authorisation" }, data.client_id);
    return ok({ url });
  });
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function addEngagementMember(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = memberSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("engagement_members").upsert({ engagement_id: input.engagement_id, user_id: input.user_id, role: input.role }, { onConflict: "engagement_id,user_id" });
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function removeEngagementMember(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = removeMemberSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("engagement_members").delete().eq("engagement_id", input.engagement_id).eq("user_id", input.user_id);
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Assets (authorised targets)
// ---------------------------------------------------------------------------

function assetRow(input: ReturnType<typeof assetSchema.parse>) {
  return {
    name: input.name,
    type: input.type,
    identifier: nul(input.identifier),
    in_scope: input.in_scope,
    notes: nul(input.notes),
  };
}

export async function createAsset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = assetSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("engagement_assets").insert({ engagement_id: input.engagement_id, ...assetRow(input) });
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function updateAsset(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = assetSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("engagement_assets").update(assetRow(input)).eq("id", id).eq("engagement_id", input.engagement_id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail(await actionError("notFound"), "NOT_FOUND");
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function deleteAsset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = assetIdSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { error } = await supabase.from("engagement_assets").delete().eq("id", input.id).eq("engagement_id", input.engagement_id);
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

function findingRow(input: ReturnType<typeof findingSchema.parse>) {
  return {
    ref_code: input.ref_code.toUpperCase(),
    title: input.title,
    severity: input.severity,
    cvss_score: nul(input.cvss_score),
    asset_id: nul(input.asset_id),
    description: nul(input.description),
    impact: nul(input.impact),
    evidence_summary: nul(input.evidence_summary),
    recommendation: nul(input.recommendation),
    discovered_at: nul(input.discovered_at),
    remediated_at: nul(input.remediated_at),
    retested_at: nul(input.retested_at),
    retest_result: nul(input.retest_result),
  };
}

export async function createFinding(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  let engagementId = "";
  const result = await runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const input = findingSchema.parse(formToObject(formData));
    engagementId = input.engagement_id;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("findings")
      .insert({ engagement_id: input.engagement_id, ...findingRow(input), created_by: viewer.userId })
      .select("id")
      .single();
    if (error) throw error;
    revalidateEngagement();
    return ok({ id: data.id });
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: `/app/security/${engagementId}/findings/${result.data.id}`, locale });
  }
  return result;
}

export async function updateFinding(id: string, _prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  let engagementId = "";
  const result = await runAction(async () => {
    await requirePermission("security.write", "action");
    const input = findingSchema.parse(formToObject(formData));
    engagementId = input.engagement_id;
    const supabase = await createClient();
    const { data, error } = await supabase.from("findings").update(findingRow(input)).eq("id", id).eq("engagement_id", input.engagement_id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return fail(await actionError("notFound"), "NOT_FOUND");
    revalidateEngagement();
    revalidatePath(FINDING_PAGE, "page");
    return ok({ id: data.id });
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: `/app/security/${engagementId}/findings/${id}`, locale });
  }
  return result;
}

export async function changeFindingStatus(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = findingStatusSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data: current } = await supabase.from("findings").select("id, status, remediated_at, retested_at").eq("id", input.id).eq("engagement_id", input.engagement_id).maybeSingle();
    if (!current) return fail(await actionError("notFound"), "NOT_FOUND");
    if (!FINDING_TRANSITIONS[current.status].includes(input.status)) {
      return fail(await actionError("statusTransition"), "VALIDATION");
    }
    const today = businessToday();
    const patch: { status: Enums<"finding_status">; remediated_at?: string; retested_at?: string } = { status: input.status };
    if (input.status === "remediated" && !current.remediated_at) patch.remediated_at = today;
    if (input.status === "verified" && !current.retested_at) patch.retested_at = today;
    const { error } = await supabase.from("findings").update(patch).eq("id", input.id).eq("status", current.status);
    if (error) throw error;
    revalidateEngagement();
    revalidatePath(FINDING_PAGE, "page");
    return ok(undefined);
  });
}

export async function deleteFinding(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let engagementId = "";
  const result = await runAction(async () => {
    await requirePermission("security.write", "action");
    const input = findingIdSchema.parse(formToObject(formData));
    engagementId = input.engagement_id;
    const supabase = await createClient();
    const { data, error } = await supabase.from("findings").delete().eq("id", input.id).eq("engagement_id", input.engagement_id).select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("forbidden"), "FORBIDDEN");
    revalidateEngagement();
    return ok(undefined);
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: `/app/security/${engagementId}?tab=findings`, locale });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Evidence (private-security-reports/<engagement>/evidence/<finding>/<file>)
// ---------------------------------------------------------------------------

async function loadWritableFinding(viewer: Viewer, findingId: string): Promise<{ id: string; engagement_id: string }> {
  const supabase = await createClient();
  // Findings are only selectable by members or security.read_all, so a hit already proves scope.
  const { data: finding } = await supabase.from("findings").select("id, engagement_id").eq("id", findingId).maybeSingle();
  if (!finding) throw new NotFound();
  await assertEngagementWriter(viewer, finding.engagement_id);
  return finding;
}

export async function requestEvidenceUpload(findingId: string, file: UploadFile): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const parsed = uploadFileSchema.parse(file);
    const finding = await loadWritableFinding(viewer, findingId);
    const path = `${finding.engagement_id}/evidence/${finding.id}/${randomUUID()}-${safeFileName(parsed.name)}`;
    const ticket = await signedUploadUrl("private-security-reports", path);
    return ok(ticket);
  });
}

export async function registerEvidence(input: { finding_id: string; path: string; name: string; size: number; type: string; caption?: string }): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const parsed = evidenceRegisterSchema.parse(input);
    const finding = await loadWritableFinding(viewer, parsed.finding_id);
    if (!parsed.path.startsWith(`${finding.engagement_id}/evidence/${finding.id}/`)) return fail(await actionError("filePath"), "VALIDATION");
    const supabase = await createClient();
    const { error } = await supabase.from("finding_evidence").insert({
      finding_id: finding.id,
      storage_path: parsed.path,
      caption: parsed.caption ?? parsed.name,
      mime_type: parsed.type || null,
      size_bytes: parsed.size,
      uploaded_by: viewer.userId,
    });
    if (error) throw error;
    revalidatePath(FINDING_PAGE, "page");
    return ok(undefined);
  });
}

export async function deleteEvidence(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const id = uuid.parse(String(formData.get("id") ?? ""));
    const supabase = await createClient();
    const { data, error } = await supabase.from("finding_evidence").delete().eq("id", id).select("storage_path");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("notFound"), "NOT_FOUND");
    await removeStoredFiles("private-security-reports", data.map((r) => r.storage_path));
    revalidatePath(FINDING_PAGE, "page");
    return ok(undefined);
  });
}

// ---------------------------------------------------------------------------
// Reports (private-security-reports/<engagement>/reports/<file>)
// ---------------------------------------------------------------------------

export async function requestReportUpload(engagementId: string, file: UploadFile): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const parsed = uploadFileSchema.parse(file);
    const engagement = await assertEngagementWriter(viewer, engagementId);
    const path = `${engagement.id}/reports/${randomUUID()}-${safeFileName(parsed.name)}`;
    const ticket = await signedUploadUrl("private-security-reports", path);
    return ok(ticket);
  });
}

export async function registerReport(input: { engagement_id: string; title: string; path: string }): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const parsed = reportRegisterSchema.parse(input);
    const engagement = await assertEngagementWriter(viewer, parsed.engagement_id);
    if (!parsed.path.startsWith(`${engagement.id}/reports/`)) return fail(await actionError("filePath"), "VALIDATION");
    const supabase = await createClient();
    const { data: latest } = await supabase.from("engagement_reports").select("version").eq("engagement_id", engagement.id).order("version", { ascending: false }).limit(1).maybeSingle();
    const version = (latest?.version ?? 0) + 1;
    const { error } = await supabase.from("engagement_reports").insert({
      engagement_id: engagement.id,
      version,
      title: parsed.title,
      storage_path: parsed.path,
      status: "draft",
      client_visible: false,
      uploaded_by: viewer.userId,
    });
    if (error) throw error;
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function finaliseReport(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.report", "action");
    const input = reportIdSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("engagement_reports")
      .update({ status: "final" })
      .eq("id", input.id)
      .eq("engagement_id", input.engagement_id)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(await actionError("reportFinal"), "CONFLICT");
    await audit("report.finalised", "engagement_report", input.id, { engagement_id: input.engagement_id });
    revalidateEngagement();
    return ok(undefined);
  });
}

/** Client visibility: anyone with write may set it while draft; final rows need security.report. */
export async function setReportClientVisible(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requirePermission("security.write", "action");
    const input = reportVisibilitySchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data: current } = await supabase.from("engagement_reports").select("id, status").eq("id", input.id).eq("engagement_id", input.engagement_id).maybeSingle();
    if (!current) return fail(await actionError("notFound"), "NOT_FOUND");
    if (current.status === "final" && !viewer.can("security.report")) {
      return fail(await actionError("reportApproval"), "FORBIDDEN");
    }
    const { error } = await supabase.from("engagement_reports").update({ client_visible: input.client_visible }).eq("id", input.id);
    if (error) throw error;
    await audit(input.client_visible ? "report.shared_with_client" : "report.hidden_from_client", "engagement_report", input.id, { engagement_id: input.engagement_id });
    revalidateEngagement();
    return ok(undefined);
  });
}

export async function deleteReport(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("security.write", "action");
    const input = reportIdSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("engagement_reports").delete().eq("id", input.id).eq("engagement_id", input.engagement_id).eq("status", "draft").select("storage_path");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("onlyDraftReportsDeletable"), "FORBIDDEN");
    await removeStoredFiles("private-security-reports", data.map((r) => r.storage_path));
    revalidateEngagement();
    return ok(undefined);
  });
}
