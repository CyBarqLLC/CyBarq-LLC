import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";
import type { Permission, RoleKey } from "@/lib/auth/permissions";

/**
 * Centralised bilingual labels for every enumerated value a person can see.
 *
 * Each map is `Record<Key, { en, ar }>`, so TypeScript refuses to compile when
 * a database enum, role, permission or audit action gains a value that has no
 * label yet. Nothing raw (snake_case keys, dotted action keys, currency codes
 * without a name) should reach the screen: use `label()` for known enums and
 * the `*Label()` helpers, which fall back to `humanizeKey()`, for free text.
 */
export type L = Record<Locale, string>;

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

/**
 * Last resort for a key that has no label yet: `invoice.status_changed` →
 * "Invoice status changed". Never returns an empty string for non empty input.
 */
export function humanizeKey(key: string): string {
  const words = key
    .trim()
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (words === "") return key;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function label<T extends string>(map: Record<T, L>, value: T, locale: Locale): string {
  return map[value]?.[locale] ?? humanizeKey(value);
}

/** Looks a free-text value up in a map and humanises it when unknown. */
export function labelOf(map: Readonly<Record<string, L>>, value: string, locale: Locale): string {
  const hit = map[value];
  return hit ? hit[locale] : humanizeKey(value);
}

// ---------------------------------------------------------------------------
// Database enums
// ---------------------------------------------------------------------------

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

export const MILESTONE_STATUS_LABELS: Record<Enums<"milestone_status">, L> = {
  planned: { en: "Planned", ar: "مخططة" },
  in_progress: { en: "In progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتملة" },
};

export const PROJECT_MEMBER_ROLE_LABELS: Record<Enums<"project_member_role">, L> = {
  manager: { en: "Manager", ar: "مدير" },
  member: { en: "Member", ar: "عضو" },
  viewer: { en: "Viewer", ar: "مطّلع" },
};

export const TASK_STATUS_LABELS: Record<Enums<"task_status">, L> = {
  todo: { en: "To do", ar: "قيد الانتظار" },
  in_progress: { en: "In progress", ar: "قيد التنفيذ" },
  review: { en: "In review", ar: "قيد المراجعة" },
  done: { en: "Done", ar: "منجزة" },
  cancelled: { en: "Cancelled", ar: "ملغاة" },
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
  void: { en: "Void", ar: "مُبطلة" },
};

export const QUOTE_STATUS_LABELS: Record<Enums<"quote_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  sent: { en: "Sent", ar: "مرسل" },
  accepted: { en: "Accepted", ar: "مقبول" },
  declined: { en: "Declined", ar: "مرفوض" },
  expired: { en: "Expired", ar: "منتهي الصلاحية" },
  void: { en: "Void", ar: "مُبطل" },
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
  authorised: { en: "Authorised", ar: "مصرّح به" },
  active: { en: "Active", ar: "نشط" },
  reporting: { en: "Reporting", ar: "إعداد التقرير" },
  remediation: { en: "Remediation", ar: "المعالجة" },
  retest: { en: "Retest", ar: "إعادة الاختبار" },
  closed: { en: "Closed", ar: "مغلق" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

export const ASSET_TYPE_LABELS: Record<Enums<"asset_type">, L> = {
  web_app: { en: "Web application", ar: "تطبيق ويب" },
  api: { en: "API", ar: "واجهة برمجية" },
  host: { en: "Host", ar: "مضيف" },
  network: { en: "Network", ar: "شبكة" },
  cloud: { en: "Cloud", ar: "سحابة" },
  mobile_app: { en: "Mobile application", ar: "تطبيق جوال" },
  identity: { en: "Identity", ar: "هوية" },
  other: { en: "Other", ar: "أخرى" },
};

export const SEVERITY_LABELS: Record<Enums<"finding_severity">, L> = {
  informational: { en: "Informational", ar: "معلوماتية" },
  low: { en: "Low", ar: "منخفضة" },
  medium: { en: "Medium", ar: "متوسطة" },
  high: { en: "High", ar: "عالية" },
  critical: { en: "Critical", ar: "حرجة" },
};

export const FINDING_STATUS_LABELS: Record<Enums<"finding_status">, L> = {
  open: { en: "Open", ar: "مفتوحة" },
  in_remediation: { en: "In remediation", ar: "قيد المعالجة" },
  remediated: { en: "Remediated", ar: "تمت معالجتها" },
  retest_pending: { en: "Retest pending", ar: "بانتظار إعادة الاختبار" },
  verified: { en: "Verified", ar: "تم التحقق" },
  accepted_risk: { en: "Accepted risk", ar: "مخاطرة مقبولة" },
  false_positive: { en: "False positive", ar: "إنذار خاطئ" },
};

export const REPORT_STATUS_LABELS: Record<Enums<"report_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  final: { en: "Final", ar: "نهائي" },
};

/** Roles inside a security engagement team (free text column, validated by `MEMBER_ROLES`). */
export const ENGAGEMENT_ROLE_LABELS: Record<"lead" | "tester" | "reviewer" | "observer", L> = {
  lead: { en: "Lead", ar: "قائد" },
  tester: { en: "Tester", ar: "مختبِر" },
  reviewer: { en: "Reviewer", ar: "مراجع" },
  observer: { en: "Observer", ar: "مراقب" },
};

export const CONTENT_STATUS_LABELS: Record<Enums<"content_status">, L> = {
  draft: { en: "Draft", ar: "مسودة" },
  review: { en: "In review", ar: "قيد المراجعة" },
  scheduled: { en: "Scheduled", ar: "مجدول" },
  published: { en: "Published", ar: "منشور" },
  archived: { en: "Archived", ar: "مؤرشف" },
};

export const LANGUAGE_STATUS_LABELS: Record<Enums<"language_status">, L> = {
  both: { en: "English and Arabic", ar: "الإنجليزية والعربية" },
  en_only: { en: "English only", ar: "الإنجليزية فقط" },
  ar_only: { en: "Arabic only", ar: "العربية فقط" },
};

export const LOCALE_LABELS: Record<Enums<"locale">, L> = {
  en: { en: "English", ar: "الإنجليزية" },
  ar: { en: "Arabic", ar: "العربية" },
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
  revoked: { en: "Revoked", ar: "مسحوبة" },
};

export const EMPLOYMENT_STATUS_LABELS: Record<Enums<"employment_status">, L> = {
  active: { en: "Active", ar: "على رأس العمل" },
  inactive: { en: "Inactive", ar: "غير نشط" },
  on_leave: { en: "On leave", ar: "في إجازة" },
  ended: { en: "Ended", ar: "منتهية الخدمة" },
};

/** Kinds of HR documents kept on an employee record. */
export const DOCUMENT_KIND_LABELS: Record<Enums<"document_kind">, L> = {
  contract: { en: "Contract", ar: "عقد" },
  id: { en: "Identification", ar: "وثيقة هوية" },
  certificate: { en: "Certificate", ar: "شهادة" },
  experience_certificate: { en: "Experience certificate", ar: "شهادة خبرة" },
  training_certificate: { en: "Training certificate", ar: "شهادة تدريب" },
  other: { en: "Other", ar: "أخرى" },
};

export const SUPPORT_STATUS_LABELS: Record<Enums<"support_status">, L> = {
  open: { en: "Open", ar: "مفتوح" },
  in_progress: { en: "In progress", ar: "قيد المعالجة" },
  waiting_client: { en: "Waiting for client", ar: "بانتظار العميل" },
  resolved: { en: "Resolved", ar: "تم الحل" },
  closed: { en: "Closed", ar: "مغلق" },
};

export const USER_KIND_LABELS: Record<Enums<"user_kind">, L> = {
  employee: { en: "Employee", ar: "موظف" },
  client: { en: "Client", ar: "عميل" },
};

// ---------------------------------------------------------------------------
// Text columns constrained by the application (validated lists)
// ---------------------------------------------------------------------------

export const CLIENT_STATUS_LABELS: Record<"prospect" | "active" | "inactive", L> = {
  prospect: { en: "Prospect", ar: "عميل محتمل" },
  active: { en: "Active", ar: "نشط" },
  inactive: { en: "Inactive", ar: "غير نشط" },
};

/** Categories of project documents shared between the platform and the portal. */
export const DOCUMENT_CATEGORY_LABELS: Record<"general" | "proposal" | "contract" | "report" | "deliverable" | "other", L> = {
  general: { en: "General", ar: "عام" },
  proposal: { en: "Proposal", ar: "عرض" },
  contract: { en: "Contract", ar: "عقد" },
  report: { en: "Report", ar: "تقرير" },
  deliverable: { en: "Deliverable", ar: "مخرج" },
  other: { en: "Other", ar: "أخرى" },
};

export const PAYMENT_METHOD_LABELS: Record<"bank_transfer" | "cash" | "card" | "cheque" | "other", L> = {
  bank_transfer: { en: "Bank transfer", ar: "تحويل بنكي" },
  cash: { en: "Cash", ar: "نقداً" },
  card: { en: "Card", ar: "بطاقة" },
  cheque: { en: "Cheque", ar: "شيك" },
  other: { en: "Other", ar: "أخرى" },
};

/** Statuses of public contact form submissions. */
export const CONTACT_STATUS_LABELS: Record<"new" | "in_progress" | "closed" | "spam", L> = {
  new: { en: "New", ar: "جديد" },
  in_progress: { en: "In progress", ar: "قيد المعالجة" },
  closed: { en: "Closed", ar: "مغلق" },
  spam: { en: "Spam", ar: "رسالة مزعجة" },
};

export type CurrencyCode = "JOD" | "USD" | "EUR" | "SAR" | "AED";

export const CURRENCY_LABELS: Record<CurrencyCode, L> = {
  JOD: { en: "Jordanian dinar", ar: "دينار أردني" },
  USD: { en: "US dollar", ar: "دولار أمريكي" },
  EUR: { en: "Euro", ar: "يورو" },
  SAR: { en: "Saudi riyal", ar: "ريال سعودي" },
  AED: { en: "UAE dirham", ar: "درهم إماراتي" },
};

/** Human name of a currency; unknown codes come back unchanged. */
export function currencyLabel(code: string, locale: Locale): string {
  const map: Readonly<Record<string, L>> = CURRENCY_LABELS;
  const hit = map[code];
  return hit ? hit[locale] : code;
}

/** "JOD · Jordanian dinar" for selects. */
export function currencyOption(code: string, locale: Locale): string {
  const name = currencyLabel(code, locale);
  return name === code ? code : `${code} · ${name}`;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/** `notifications.type` values written by database triggers. */
export const NOTIFICATION_KIND_LABELS: Record<"task.assigned" | "project.assigned", L> = {
  "task.assigned": { en: "Task assignment", ar: "إسناد مهمة" },
  "project.assigned": { en: "Project membership", ar: "عضوية مشروع" },
};

export function notificationKindLabel(kind: string, locale: Locale): string {
  return labelOf(NOTIFICATION_KIND_LABELS, kind, locale);
}

// ---------------------------------------------------------------------------
// Roles and permissions
// ---------------------------------------------------------------------------

/**
 * Role names mirror `roles.name_en` / `name_ar` in the seed. Pages that already
 * load the roles table should prefer the database names; this map serves the
 * places that only have a key (audit metadata, badges on lists).
 */
export const ROLE_LABELS: Record<RoleKey, L> = {
  super_admin: { en: "Super admin", ar: "مدير أعلى" },
  admin: { en: "Admin", ar: "مدير النظام" },
  finance: { en: "Finance", ar: "المالية" },
  hr: { en: "HR", ar: "الموارد البشرية" },
  project_manager: { en: "Project manager", ar: "مدير مشاريع" },
  security_team: { en: "Security team", ar: "فريق الأمن" },
  developer: { en: "Developer", ar: "مطوّر" },
  content_editor: { en: "Content editor", ar: "محرر محتوى" },
  employee: { en: "Employee", ar: "موظف" },
  client: { en: "Client", ar: "عميل" },
};

export const ROLE_DESCRIPTIONS: Record<RoleKey, L> = {
  super_admin: { en: "Full control, including who else is a super admin.", ar: "تحكم كامل، بما في ذلك تعيين المديرين الأعلى." },
  admin: { en: "Administers users, clients, projects, content and settings.", ar: "يدير المستخدمين والعملاء والمشاريع والمحتوى والإعدادات." },
  finance: { en: "Quotes, invoices and payments.", ar: "عروض الأسعار والفواتير والمدفوعات." },
  hr: { en: "Employees, departments and HR documents.", ar: "الموظفون والأقسام ومستندات الموارد البشرية." },
  project_manager: { en: "Clients, projects, members and tasks.", ar: "العملاء والمشاريع والأعضاء والمهام." },
  security_team: { en: "Security engagements and findings.", ar: "الارتباطات الأمنية والملاحظات." },
  developer: { en: "Works on assigned projects.", ar: "يعمل على المشاريع المسندة إليه." },
  content_editor: { en: "Writes and edits public content.", ar: "يكتب المحتوى العام ويحرره." },
  employee: { en: "Base role for every employee.", ar: "الدور الأساسي لكل موظف." },
  client: { en: "Client portal access to their own organisation.", ar: "الوصول إلى بوابة العملاء لجهته فقط." },
};

export function roleLabel(key: string, locale: Locale): string {
  return labelOf(ROLE_LABELS, key, locale);
}

export const PERMISSION_LABELS: Record<Permission, L> = {
  "users.manage": { en: "Manage users", ar: "إدارة المستخدمين" },
  "roles.manage": { en: "Manage roles", ar: "إدارة الأدوار" },
  "audit.read": { en: "Read the audit log", ar: "الاطلاع على سجل التدقيق" },
  "settings.manage": { en: "Manage settings", ar: "إدارة الإعدادات" },
  "clients.read": { en: "View clients", ar: "عرض العملاء" },
  "clients.write": { en: "Edit clients", ar: "تعديل العملاء" },
  "projects.read_all": { en: "View all projects", ar: "عرض كل المشاريع" },
  "projects.write": { en: "Edit projects", ar: "تعديل المشاريع" },
  "tasks.write": { en: "Edit tasks", ar: "تعديل المهام" },
  "hr.read": { en: "View employee records", ar: "عرض سجلات الموظفين" },
  "hr.write": { en: "Edit employee records", ar: "تعديل سجلات الموظفين" },
  "finance.read": { en: "View finance", ar: "عرض المالية" },
  "finance.write": { en: "Edit finance", ar: "تعديل المالية" },
  "finance.issue": { en: "Issue and void documents", ar: "إصدار المستندات وإبطالها" },
  "security.read_all": { en: "View all engagements", ar: "عرض كل الارتباطات" },
  "security.write": { en: "Edit engagements", ar: "تعديل الارتباطات" },
  "security.report": { en: "Finalise reports", ar: "اعتماد التقارير" },
  "content.read": { en: "View draft content", ar: "عرض مسودات المحتوى" },
  "content.write": { en: "Edit content", ar: "تعديل المحتوى" },
  "content.publish": { en: "Publish content", ar: "نشر المحتوى" },
  "certificates.read": { en: "View certificates", ar: "عرض الشهادات" },
  "certificates.issue": { en: "Issue certificates", ar: "إصدار الشهادات" },
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, L> = {
  "users.manage": { en: "Invite, activate and deactivate accounts; assign roles.", ar: "دعوة الحسابات وتفعيلها وإيقافها، وإسناد الأدوار." },
  "roles.manage": { en: "Change which permissions each role holds.", ar: "تغيير الصلاحيات التي يحملها كل دور." },
  "audit.read": { en: "See the record of sensitive actions across the platform.", ar: "الاطلاع على سجل الإجراءات الحساسة في المنصة." },
  "settings.manage": { en: "Change platform settings and brand assets.", ar: "تغيير إعدادات المنصة وأصول العلامة." },
  "clients.read": { en: "See every client, contact and contact form submission.", ar: "الاطلاع على كل العملاء وجهات الاتصال ورسائل التواصل." },
  "clients.write": { en: "Create and edit clients, contacts and portal users.", ar: "إنشاء العملاء وجهات الاتصال ومستخدمي البوابة وتعديلهم." },
  "projects.read_all": { en: "See every project, not only the ones you belong to.", ar: "الاطلاع على كل المشاريع، لا مشاريعك فقط." },
  "projects.write": { en: "Create, edit and delete projects and manage members.", ar: "إنشاء المشاريع وتعديلها وحذفها وإدارة أعضائها." },
  "tasks.write": { en: "Create and edit tasks on any project.", ar: "إنشاء المهام وتعديلها في أي مشروع." },
  "hr.read": { en: "See employee records and HR documents.", ar: "الاطلاع على سجلات الموظفين ومستندات الموارد البشرية." },
  "hr.write": { en: "Create and edit employees, departments, teams and HR documents.", ar: "إنشاء الموظفين والأقسام والفرق ومستندات الموارد البشرية وتعديلها." },
  "finance.read": { en: "See quotes, invoices and payments.", ar: "الاطلاع على عروض الأسعار والفواتير والمدفوعات." },
  "finance.write": { en: "Create and edit draft quotes and invoices; record payments.", ar: "إنشاء مسودات عروض الأسعار والفواتير وتعديلها، وتسجيل المدفوعات." },
  "finance.issue": { en: "Issue and void quotes and invoices.", ar: "إصدار عروض الأسعار والفواتير وإبطالها." },
  "security.read_all": { en: "See every security engagement and finding.", ar: "الاطلاع على كل الارتباطات الأمنية والملاحظات." },
  "security.write": { en: "Create and edit engagements, assets, findings and evidence.", ar: "إنشاء الارتباطات والأصول والملاحظات والأدلة وتعديلها." },
  "security.report": { en: "Finalise security reports and share them with clients.", ar: "اعتماد التقارير الأمنية ومشاركتها مع العملاء." },
  "content.read": { en: "See content that is not published yet.", ar: "الاطلاع على المحتوى غير المنشور بعد." },
  "content.write": { en: "Create and edit content.", ar: "إنشاء المحتوى وتعديله." },
  "content.publish": { en: "Publish, schedule, archive and delete content.", ar: "نشر المحتوى وجدولته وأرشفته وحذفه." },
  "certificates.read": { en: "See every certificate.", ar: "الاطلاع على كل الشهادات." },
  "certificates.issue": { en: "Create, issue and revoke certificates.", ar: "إنشاء الشهادات وإصدارها وسحبها." },
};

export function permissionLabel(key: string, locale: Locale): string {
  return labelOf(PERMISSION_LABELS, key, locale);
}

export function permissionDescription(key: string, locale: Locale): string | null {
  const map: Readonly<Record<string, L>> = PERMISSION_DESCRIPTIONS;
  const hit = map[key];
  return hit ? hit[locale] : null;
}

export function roleDescription(key: string, locale: Locale): string | null {
  const map: Readonly<Record<string, L>> = ROLE_DESCRIPTIONS;
  const hit = map[key];
  return hit ? hit[locale] : null;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

/**
 * Every action written by `private.log_audit(...)` in the migrations and by
 * `audit("...")` in the application. A unit test checks that no action used
 * in code is missing here.
 */
export const AUDIT_ACTION_LABELS = {
  // Accounts and access
  "user.created": { en: "Account created", ar: "تم إنشاء الحساب" },
  "user.invited": { en: "Employee invited", ar: "تمت دعوة الموظف" },
  "user.invitation_resent": { en: "Invitation resent", ar: "أُعيد إرسال الدعوة" },
  "user.activated": { en: "Account reactivated", ar: "أُعيد تفعيل الحساب" },
  "user.deactivated": { en: "Account deactivated", ar: "تم إيقاف الحساب" },
  "user.kind_changed": { en: "Account kind changed", ar: "تم تغيير نوع الحساب" },
  "user.roles_changed": { en: "Roles changed", ar: "تم تغيير الأدوار" },
  "client_user.invited": { en: "Portal user invited", ar: "تمت دعوة مستخدم للبوابة" },
  "client_user.invitation_resent": { en: "Portal invitation resent", ar: "أُعيد إرسال دعوة البوابة" },
  "client_user.reactivated": { en: "Portal access reactivated", ar: "أُعيد تفعيل الوصول إلى البوابة" },
  "client_user.deactivated": { en: "Portal access deactivated", ar: "تم إيقاف الوصول إلى البوابة" },
  "role.granted": { en: "Role granted", ar: "تم منح الدور" },
  "role.revoked": { en: "Role removed", ar: "تمت إزالة الدور" },
  "role.changed": { en: "Role changed", ar: "تم تغيير الدور" },
  "permission.granted": { en: "Permission granted", ar: "تم منح الصلاحية" },
  "permission.revoked": { en: "Permission removed", ar: "تمت إزالة الصلاحية" },
  // Projects and tasks
  "project.created": { en: "Project created", ar: "تم إنشاء المشروع" },
  "project.changed": { en: "Project changed", ar: "تم تعديل المشروع" },
  "project.deleted": { en: "Project deleted", ar: "تم حذف المشروع" },
  "project.assigned": { en: "Added to a project", ar: "تمت الإضافة إلى مشروع" },
  "task.assigned": { en: "Task assigned", ar: "تم إسناد المهمة" },
  // Finance
  "invoice.created": { en: "Invoice created", ar: "تم إنشاء الفاتورة" },
  "invoice.issued": { en: "Invoice issued", ar: "تم إصدار الفاتورة" },
  "invoice.sent": { en: "Invoice sent to the client", ar: "أُرسلت الفاتورة إلى العميل" },
  "invoice.paid": { en: "Invoice paid in full", ar: "سُددت الفاتورة بالكامل" },
  "invoice.voided": { en: "Invoice voided", ar: "تم إبطال الفاتورة" },
  "invoice.status_changed": { en: "Invoice status changed", ar: "تم تغيير حالة الفاتورة" },
  "payment.recorded": { en: "Payment recorded", ar: "تم تسجيل دفعة" },
  "payment.removed": { en: "Payment removed", ar: "تمت إزالة دفعة" },
  "quote.issued": { en: "Quote issued", ar: "تم إصدار عرض السعر" },
  "quote.status_changed": { en: "Quote status changed", ar: "تم تغيير حالة عرض السعر" },
  // Certificates
  "certificate.issued": { en: "Certificate issued", ar: "تم إصدار الشهادة" },
  "certificate.revoked": { en: "Certificate revoked", ar: "تم سحب الشهادة" },
  "certificate.status_changed": { en: "Certificate status changed", ar: "تم تغيير حالة الشهادة" },
  "certificate.emailed": { en: "Certificate emailed", ar: "أُرسلت الشهادة بالبريد" },
  "certificate.public_download": { en: "Certificate downloaded from the verification page", ar: "نُزّلت الشهادة من صفحة التحقق" },
  // Security
  "engagement.created": { en: "Engagement created", ar: "تم إنشاء الارتباط" },
  "engagement.changed": { en: "Engagement changed", ar: "تم تعديل الارتباط" },
  "engagement.status_changed": { en: "Engagement status changed", ar: "تم تغيير حالة الارتباط" },
  "engagement.authorisation_uploaded": { en: "Authorisation letter uploaded", ar: "تم رفع خطاب التصريح" },
  "finding.created": { en: "Finding recorded", ar: "تم تسجيل الملاحظة" },
  "finding.updated": { en: "Finding updated", ar: "تم تحديث الملاحظة" },
  "finding.deleted": { en: "Finding deleted", ar: "تم حذف الملاحظة" },
  "finding.status_changed": { en: "Finding status changed", ar: "تم تغيير حالة الملاحظة" },
  "finding.severity_changed": { en: "Finding severity changed", ar: "تم تغيير خطورة الملاحظة" },
  "report.finalised": { en: "Report finalised", ar: "تم اعتماد التقرير" },
  "report.shared_with_client": { en: "Report shared with the client", ar: "تمت مشاركة التقرير مع العميل" },
  "report.hidden_from_client": { en: "Report hidden from the client", ar: "تم إخفاء التقرير عن العميل" },
  // Files and documents
  "document.downloaded": { en: "Document downloaded", ar: "تم تنزيل المستند" },
  "file.accessed": { en: "Private file opened", ar: "تم فتح ملف خاص" },
  "hr_document.uploaded": { en: "HR document uploaded", ar: "تم رفع مستند موارد بشرية" },
  "hr_document.deleted": { en: "HR document deleted", ar: "تم حذف مستند موارد بشرية" },
  "portal.document_uploaded": { en: "Document uploaded by the client", ar: "رفع العميل مستنداً" },
  // Content
  "content.published": { en: "Content published", ar: "تم نشر المحتوى" },
  "content.scheduled": { en: "Content scheduled", ar: "تمت جدولة المحتوى" },
  "content.archived": { en: "Content archived", ar: "تمت أرشفة المحتوى" },
  "content.deleted": { en: "Content deleted", ar: "تم حذف المحتوى" },
} as const satisfies Record<string, L>;

export type AuditAction = keyof typeof AUDIT_ACTION_LABELS;

export function isAuditAction(value: string): value is AuditAction {
  return Object.prototype.hasOwnProperty.call(AUDIT_ACTION_LABELS, value);
}

/** Human sentence for an audit action; unknown keys are humanised, never shown raw. */
export function auditActionLabel(action: string, locale: Locale): string {
  return isAuditAction(action) ? AUDIT_ACTION_LABELS[action][locale] : humanizeKey(action);
}

/** Entity types recorded in `audit_logs.entity_type` (tables and logical names). */
export const AUDIT_ENTITY_LABELS = {
  user: { en: "User", ar: "مستخدم" },
  client_user: { en: "Portal user", ar: "مستخدم بوابة" },
  role: { en: "Role", ar: "دور" },
  client: { en: "Client", ar: "عميل" },
  project: { en: "Project", ar: "مشروع" },
  task: { en: "Task", ar: "مهمة" },
  invoice: { en: "Invoice", ar: "فاتورة" },
  quote: { en: "Quote", ar: "عرض سعر" },
  payment: { en: "Payment", ar: "دفعة" },
  certificate: { en: "Certificate", ar: "شهادة" },
  finding: { en: "Finding", ar: "ملاحظة" },
  security_engagement: { en: "Security engagement", ar: "ارتباط أمني" },
  engagement_report: { en: "Engagement report", ar: "تقرير ارتباط" },
  engagement_reports: { en: "Engagement report", ar: "تقرير ارتباط" },
  finding_evidence: { en: "Finding evidence", ar: "دليل ملاحظة" },
  news_posts: { en: "News post", ar: "خبر" },
  articles: { en: "Article", ar: "مقال" },
  public_projects: { en: "Public project", ar: "مشروع عام" },
  case_studies: { en: "Case study", ar: "دراسة حالة" },
  content: { en: "Content", ar: "محتوى" },
  project_document: { en: "Project document", ar: "مستند مشروع" },
  project_documents: { en: "Project document", ar: "مستند مشروع" },
  employee_document: { en: "Employee document", ar: "مستند موظف" },
  employee_documents: { en: "Employee document", ar: "مستند موظف" },
} as const satisfies Record<string, L>;

export type AuditEntity = keyof typeof AUDIT_ENTITY_LABELS;

export function isAuditEntity(value: string): value is AuditEntity {
  return Object.prototype.hasOwnProperty.call(AUDIT_ENTITY_LABELS, value);
}

export function auditEntityLabel(entityType: string, locale: Locale): string {
  return isAuditEntity(entityType) ? AUDIT_ENTITY_LABELS[entityType][locale] : humanizeKey(entityType);
}

/** Ids an audit entry may carry in its metadata, used to reach a page for entities that have none of their own. */
export type AuditLinkContext = { engagementId?: string | null; projectId?: string | null; employeeUserId?: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidPath(prefix: string, id: string | null | undefined, suffix = ""): string | null {
  return id && UUID.test(id) ? `${prefix}/${id}${suffix}` : null;
}

/**
 * Where an audited entity lives in the platform, when the type has a page of
 * its own. Findings, reports and documents need a parent id, which callers
 * read from the entry's metadata.
 */
export function auditEntityHref(entityType: string, entityId: string | null, meta: AuditLinkContext = {}): string | null {
  switch (entityType) {
    case "user":
    case "client_user":
      return uuidPath("/app/users", entityId);
    case "role":
      return "/app/users/roles";
    case "client":
      return uuidPath("/app/clients", entityId);
    case "project":
      return uuidPath("/app/projects", entityId);
    case "invoice":
      return uuidPath("/app/finance/invoices", entityId);
    case "quote":
      return uuidPath("/app/finance/quotes", entityId);
    case "certificate":
      return uuidPath("/app/certificates", entityId);
    case "security_engagement":
      return uuidPath("/app/security", entityId);
    case "finding":
      return entityId && UUID.test(entityId) ? uuidPath("/app/security", meta.engagementId, `/findings/${entityId}`) : null;
    case "engagement_report":
    case "engagement_reports":
    case "finding_evidence":
      return uuidPath("/app/security", meta.engagementId);
    case "project_document":
    case "project_documents":
      return uuidPath("/app/projects", meta.projectId, "/documents");
    case "employee_document":
    case "employee_documents":
      return uuidPath("/app/employees", meta.employeeUserId);
    case "news_posts":
      return uuidPath("/app/content/news", entityId);
    case "articles":
      return uuidPath("/app/content/articles", entityId);
    case "public_projects":
      return uuidPath("/app/content/projects", entityId);
    case "case_studies":
      return uuidPath("/app/content/case-studies", entityId);
    default:
      return null;
  }
}

/**
 * Status vocabularies keyed by the audited entity, used to translate the
 * `from` / `to` / `status` values inside audit metadata.
 */
export function auditStatusLabel(entityType: string, value: string, locale: Locale): string {
  switch (entityType) {
    case "invoice":
      return labelOf(INVOICE_STATUS_LABELS, value, locale);
    case "quote":
      return labelOf(QUOTE_STATUS_LABELS, value, locale);
    case "certificate":
      return labelOf(CERTIFICATE_STATUS_LABELS, value, locale);
    case "project":
      return labelOf(PROJECT_STATUS_LABELS, value, locale);
    case "task":
      return labelOf(TASK_STATUS_LABELS, value, locale);
    case "security_engagement":
      return labelOf(ENGAGEMENT_STATUS_LABELS, value, locale);
    case "finding":
      return labelOf(FINDING_STATUS_LABELS, value, locale);
    case "engagement_report":
    case "engagement_reports":
      return labelOf(REPORT_STATUS_LABELS, value, locale);
    case "news_posts":
    case "articles":
    case "public_projects":
    case "case_studies":
    case "content":
      return labelOf(CONTENT_STATUS_LABELS, value, locale);
    case "user":
    case "client_user":
      return labelOf(USER_KIND_LABELS, value, locale);
    default:
      return humanizeKey(value);
  }
}
