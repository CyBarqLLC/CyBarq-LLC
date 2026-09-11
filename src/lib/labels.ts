import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";

type L = Record<Locale, string>;

export const PRACTICE_LABELS: Record<Enums<"practice">, L> = {
  cybersecurity: { en: "Cybersecurity", ar: "الأمن السيبراني" },
  development: { en: "Digital Engineering", ar: "الهندسة الرقمية" },
  ai: { en: "Artificial Intelligence", ar: "الذكاء الاصطناعي" },
  infrastructure: { en: "Technology & Infrastructure", ar: "التقنية والبنية التحتية" },
  mixed: { en: "Mixed engagement", ar: "ارتباط مختلط" },
};

export const PROJECT_STATUS_LABELS: Record<Enums<"project_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  planned: { en: "Planned", ar: "مخطط" },
  active: { en: "Active", ar: "نشط" },
  on_hold: { en: "On hold", ar: "معلّق" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const TASK_STATUS_LABELS: Record<Enums<"task_status">, L> = {
  todo: { en: "To do", ar: "قيد الانتظار" },
  in_progress: { en: "In progress", ar: "قيد التنفيذ" },
  review: { en: "In review", ar: "قيد المراجعة" },
  done: { en: "Done", ar: "منجز" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const TASK_PRIORITY_LABELS: Record<Enums<"task_priority">, L> = {
  low: { en: "Low", ar: "منخفضة" },
  medium: { en: "Medium", ar: "متوسطة" },
  high: { en: "High", ar: "عالية" },
  urgent: { en: "Urgent", ar: "عاجلة" },
};

export const INVOICE_STATUS_LABELS: Record<Enums<"invoice_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  issued: { en: "Issued", ar: "صادرة" },
  sent: { en: "Sent", ar: "مرسلة" },
  partially_paid: { en: "Partially paid", ar: "مدفوعة جزئياً" },
  paid: { en: "Paid", ar: "مدفوعة" },
  overdue: { en: "Overdue", ar: "متأخرة" },
  void: { en: "Void", ar: "ملغاة" },
};

export const QUOTE_STATUS_LABELS: Record<Enums<"quote_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  sent: { en: "Sent", ar: "مرسل" },
  accepted: { en: "Accepted", ar: "مقبول" },
  declined: { en: "Declined", ar: "مرفوض" },
  expired: { en: "Expired", ar: "منتهي" },
  void: { en: "Void", ar: "ملغى" },
};

export const ENGAGEMENT_TYPE_LABELS: Record<Enums<"engagement_type">, L> = {
  penetration_test: { en: "Penetration test", ar: "اختبار اختراق" },
  compromise_assessment: { en: "Compromise assessment", ar: "تقييم اختراق" },
  dfir: { en: "Digital forensics and incident response", ar: "تحقيق رقمي واستجابة للحوادث" },
  security_assessment: { en: "Security assessment", ar: "تقييم أمني" },
  red_team: { en: "Red team", ar: "فريق أحمر" },
  consulting: { en: "Security consulting", ar: "استشارات أمنية" },
  training: { en: "Training", ar: "تدريب" },
};

export const ENGAGEMENT_STATUS_LABELS: Record<Enums<"engagement_status">, L> = {
  scoping: { en: "Scoping", ar: "تحديد النطاق" },
  authorised: { en: "Authorised", ar: "مصرّح" },
  active: { en: "Active", ar: "نشط" },
  reporting: { en: "Reporting", ar: "إعداد التقرير" },
  remediation: { en: "Remediation", ar: "المعالجة" },
  retest: { en: "Retest", ar: "إعادة الاختبار" },
  closed: { en: "Closed", ar: "مغلق" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const SEVERITY_LABELS: Record<Enums<"finding_severity">, L> = {
  informational: { en: "Informational", ar: "معلوماتي" },
  low: { en: "Low", ar: "منخفض" },
  medium: { en: "Medium", ar: "متوسط" },
  high: { en: "High", ar: "عالٍ" },
  critical: { en: "Critical", ar: "حرج" },
};

export const FINDING_STATUS_LABELS: Record<Enums<"finding_status">, L> = {
  open: { en: "Open", ar: "مفتوح" },
  in_remediation: { en: "In remediation", ar: "قيد المعالجة" },
  remediated: { en: "Remediated", ar: "تمت المعالجة" },
  retest_pending: { en: "Retest pending", ar: "بانتظار إعادة الاختبار" },
  verified: { en: "Verified", ar: "تم التحقق" },
  accepted_risk: { en: "Accepted risk", ar: "مخاطرة مقبولة" },
  false_positive: { en: "False positive", ar: "إنذار خاطئ" },
};

export const CONTENT_STATUS_LABELS: Record<Enums<"content_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  review: { en: "In review", ar: "قيد المراجعة" },
  scheduled: { en: "Scheduled", ar: "مجدول" },
  published: { en: "Published", ar: "منشور" },
  archived: { en: "Archived", ar: "مؤرشف" },
};

export const CERTIFICATE_TYPE_LABELS: Record<Enums<"certificate_type">, L> = {
  training: { en: "Training certificate", ar: "شهادة تدريب" },
  internship: { en: "Internship certificate", ar: "شهادة تدريب عملي" },
  experience: { en: "Experience certificate", ar: "شهادة خبرة" },
  appreciation: { en: "Certificate of appreciation", ar: "شهادة تقدير" },
  other: { en: "Certificate", ar: "شهادة" },
};

export const CERTIFICATE_STATUS_LABELS: Record<Enums<"certificate_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  issued: { en: "Issued", ar: "صادرة" },
  revoked: { en: "Revoked", ar: "ملغاة" },
};

export const EMPLOYMENT_STATUS_LABELS: Record<Enums<"employment_status">, L> = {
  active: { en: "Active", ar: "على رأس العمل" },
  inactive: { en: "Inactive", ar: "غير نشط" },
  on_leave: { en: "On leave", ar: "في إجازة" },
  ended: { en: "Ended", ar: "منتهٍ" },
};

export const SUPPORT_STATUS_LABELS: Record<Enums<"support_status">, L> = {
  open: { en: "Open", ar: "مفتوح" },
  in_progress: { en: "In progress", ar: "قيد المعالجة" },
  waiting_client: { en: "Waiting for client", ar: "بانتظار العميل" },
  resolved: { en: "Resolved", ar: "تم الحل" },
  closed: { en: "Closed", ar: "مغلق" },
};

export function label<T extends string>(map: Record<T, L>, value: T, locale: Locale): string {
  return map[value]?.[locale] ?? value;
}
