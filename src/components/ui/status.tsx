import { Badge } from "./badge";
import { humanizeKey } from "@/lib/labels";

type Tone = "neutral" | "blue" | "lime" | "success" | "warning" | "danger" | "graphite" | "outline";

/**
 * One place that decides how each domain status looks, so colour carries the
 * same meaning across finance, projects, tasks, security, content,
 * certificates and HR:
 *
 * - neutral: not started yet (draft, planned, to do, scoping, prospect)
 * - blue: moving (in progress, review, sent, authorised, retest)
 * - success: reached a good end (active, issued, paid, done, published, verified, closed)
 * - warning: needs someone (on hold, partially paid, scheduled, remediation, waiting)
 * - danger: stopped or wrong (void, cancelled, revoked, declined, overdue, open finding)
 * - outline: quiet history (expired, archived, ended, inactive, accepted risk)
 */
const TONES: Record<string, Tone> = {
  // not started
  draft: "neutral", planned: "neutral", todo: "neutral", scoping: "neutral", prospect: "neutral", new: "neutral",
  // moving
  in_progress: "blue", review: "blue", sent: "blue", authorised: "blue", retest: "blue", remediated: "blue", reporting: "blue",
  // good end
  active: "success", issued: "success", paid: "success", done: "success", completed: "success", published: "success",
  verified: "success", closed: "success", accepted: "success", resolved: "success", final: "success",
  // needs someone
  on_hold: "warning", partially_paid: "warning", scheduled: "warning", remediation: "warning", in_remediation: "warning",
  retest_pending: "warning", waiting_client: "warning", on_leave: "warning",
  // stopped or wrong
  void: "danger", cancelled: "danger", revoked: "danger", declined: "danger", overdue: "danger", open: "danger",
  // quiet history
  expired: "outline", archived: "outline", ended: "outline", inactive: "outline", accepted_risk: "outline", false_positive: "outline", spam: "outline",
  // severity and priority
  informational: "neutral", low: "lime", medium: "warning", high: "danger", critical: "graphite", urgent: "danger",
};

/** Status badge. Pass the translated `label`; the raw value only decides the tone. */
export function StatusBadge({ value, label, className }: { value: string; label?: string; className?: string }) {
  return <Badge variant={TONES[value] ?? "neutral"} className={className}>{label ?? humanizeKey(value)}</Badge>;
}

/** Alias kept for existing call sites. */
export const Status = StatusBadge;
