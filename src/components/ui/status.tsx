import { Badge } from "./badge";

type Tone = "neutral" | "blue" | "lime" | "success" | "warning" | "danger" | "graphite" | "outline";

/**
 * One place that decides how each domain status looks. Keeps colour semantics
 * consistent across tables, cards and detail pages.
 */
const TONES: Record<string, Tone> = {
  // generic
  draft: "neutral", review: "blue", scheduled: "warning", published: "success", archived: "outline",
  // projects, tasks, milestones
  planned: "neutral", active: "blue", on_hold: "warning", completed: "success", cancelled: "outline",
  todo: "neutral", in_progress: "blue", done: "success",
  // finance
  sent: "blue", accepted: "success", declined: "danger", expired: "outline", void: "outline",
  issued: "blue", partially_paid: "warning", paid: "success", overdue: "danger",
  // security engagements and findings
  scoping: "neutral", authorised: "blue", reporting: "warning", remediation: "warning", retest: "blue", closed: "success",
  open: "danger", in_remediation: "warning", remediated: "blue", retest_pending: "warning", verified: "success", accepted_risk: "outline", false_positive: "outline",
  informational: "neutral", low: "lime", medium: "warning", high: "danger", critical: "graphite",
  // certificates, hr, support
  revoked: "danger", inactive: "outline", on_leave: "warning", ended: "outline", waiting_client: "warning", resolved: "success", new: "blue", spam: "outline",
  prospect: "neutral", final: "success", urgent: "danger",
};

export function Status({ value, label }: { value: string; label?: string }) {
  return <Badge variant={TONES[value] ?? "neutral"}>{label ?? value.replaceAll("_", " ")}</Badge>;
}
