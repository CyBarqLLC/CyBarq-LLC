import { z } from "zod";
import type { Enums } from "@/lib/supabase/database.types";
import { requiredString, optionalString, optionalUuid, optionalDate, checkbox, uuid } from "./common";

/** Enum lists mirror the database enums (database.types.ts) so forms and actions share one source. */
export const ENGAGEMENT_TYPES = ["penetration_test", "compromise_assessment", "dfir", "security_assessment", "red_team", "consulting", "training"] as const satisfies readonly Enums<"engagement_type">[];
export const ENGAGEMENT_STATUSES = ["scoping", "authorised", "active", "reporting", "remediation", "retest", "closed", "cancelled"] as const satisfies readonly Enums<"engagement_status">[];
export const ASSET_TYPES = ["web_app", "api", "host", "network", "cloud", "mobile_app", "identity", "other"] as const satisfies readonly Enums<"asset_type">[];
export const FINDING_SEVERITIES = ["critical", "high", "medium", "low", "informational"] as const satisfies readonly Enums<"finding_severity">[];
export const FINDING_STATUSES = ["open", "in_remediation", "remediated", "retest_pending", "verified", "accepted_risk", "false_positive"] as const satisfies readonly Enums<"finding_status">[];
export const MEMBER_ROLES = ["lead", "tester", "reviewer", "observer"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Sort weight: most severe first. */
export const SEVERITY_ORDER: Record<Enums<"finding_severity">, number> = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
export const FINDING_STATUS_ORDER: Record<Enums<"finding_status">, number> = {
  open: 0,
  in_remediation: 1,
  retest_pending: 2,
  remediated: 3,
  verified: 4,
  accepted_risk: 5,
  false_positive: 6,
};

/**
 * Engagement lifecycle. Forward moves are explicit actions; cancel is allowed
 * from any state that is not closed or cancelled.
 */
export const ENGAGEMENT_TRANSITIONS: Record<Enums<"engagement_status">, readonly Enums<"engagement_status">[]> = {
  scoping: ["authorised"],
  authorised: ["active"],
  active: ["reporting"],
  reporting: ["remediation", "closed"],
  remediation: ["retest"],
  retest: ["closed", "remediation"],
  closed: [],
  cancelled: [],
};

export function nextEngagementStatuses(current: Enums<"engagement_status">): Enums<"engagement_status">[] {
  const next = [...ENGAGEMENT_TRANSITIONS[current]];
  if (current !== "closed" && current !== "cancelled") next.push("cancelled");
  return next;
}

/** Finding lifecycle. */
export const FINDING_TRANSITIONS: Record<Enums<"finding_status">, readonly Enums<"finding_status">[]> = {
  open: ["in_remediation", "accepted_risk", "false_positive"],
  in_remediation: ["remediated", "open"],
  remediated: ["retest_pending", "in_remediation"],
  retest_pending: ["verified", "in_remediation"],
  verified: [],
  accepted_risk: ["open"],
  false_positive: ["open"],
};

const optionalCvss = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? undefined : Number(v)) : v),
  z.number().min(0).max(10).optional(),
);

export const engagementSchema = z.object({
  code: requiredString(40),
  client_id: optionalUuid,
  project_id: optionalUuid,
  title: requiredString(200),
  type: z.enum(ENGAGEMENT_TYPES),
  start_date: optionalDate,
  end_date: optionalDate,
  lead_user_id: optionalUuid,
  scope_summary: optionalString(5000),
  rules_of_engagement: optionalString(20000),
  authorised_by_name: optionalString(200),
  authorised_at: optionalDate,
});
export type EngagementInput = z.infer<typeof engagementSchema>;

export const engagementStatusSchema = z.object({
  id: uuid,
  status: z.enum(ENGAGEMENT_STATUSES),
});

export const memberSchema = z.object({
  engagement_id: uuid,
  user_id: uuid,
  role: z.enum(MEMBER_ROLES),
});

export const removeMemberSchema = z.object({ engagement_id: uuid, user_id: uuid });

export const assetSchema = z.object({
  engagement_id: uuid,
  name: requiredString(200),
  type: z.enum(ASSET_TYPES),
  identifier: optionalString(500),
  in_scope: checkbox,
  notes: optionalString(2000),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const assetIdSchema = z.object({ id: uuid, engagement_id: uuid });

export const findingSchema = z.object({
  engagement_id: uuid,
  ref_code: requiredString(30),
  title: requiredString(200),
  severity: z.enum(FINDING_SEVERITIES),
  cvss_score: optionalCvss,
  asset_id: optionalUuid,
  description: optionalString(20000),
  impact: optionalString(10000),
  evidence_summary: optionalString(10000),
  recommendation: optionalString(10000),
  discovered_at: optionalDate,
  remediated_at: optionalDate,
  retested_at: optionalDate,
  retest_result: optionalString(5000),
});
export type FindingInput = z.infer<typeof findingSchema>;

export const findingIdSchema = z.object({ id: uuid, engagement_id: uuid });

export const findingStatusSchema = z.object({
  id: uuid,
  engagement_id: uuid,
  status: z.enum(FINDING_STATUSES),
});

export const evidenceRegisterSchema = z.object({
  finding_id: uuid,
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(200),
  size: z.number().int().nonnegative(),
  type: z.string().max(120),
  caption: optionalString(300),
});

export const reportRegisterSchema = z.object({
  engagement_id: uuid,
  title: requiredString(200),
  path: z.string().min(1).max(500),
});

export const reportIdSchema = z.object({ id: uuid, engagement_id: uuid });
export const reportVisibilitySchema = z.object({ id: uuid, engagement_id: uuid, client_visible: checkbox });

export const uploadFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(100 * 1024 * 1024),
  type: z.string().max(120),
});
export type UploadFile = z.infer<typeof uploadFileSchema>;

/** F-<n+1> where n is the highest numeric suffix already used in this engagement. */
export function nextRefCode(existing: { ref_code: string }[]): string {
  let max = 0;
  for (const f of existing) {
    const m = /^F-?(\d+)$/i.exec(f.ref_code.trim());
    if (m && m[1]) max = Math.max(max, Number(m[1]));
  }
  return `F-${max + 1}`;
}

/** Default engagement code: SEC-<year>-<4 digits>. */
export function defaultEngagementCode(now = new Date()): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SEC-${now.getFullYear()}-${n}`;
}
