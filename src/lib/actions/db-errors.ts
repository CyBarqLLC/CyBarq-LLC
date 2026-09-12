/**
 * Maps messages raised by database guards and functions to translated error
 * keys (messages/<locale>/errors.json). The database speaks English for
 * operators and logs; people see the translated sentence.
 * tests/unit/db-errors.test.ts checks that every `raise exception` message in
 * supabase/migrations has an entry here, so a new guard cannot surface raw text.
 */
export const DB_MESSAGE_KEYS: Record<string, string> = {
  "permission denied": "forbidden",
  "not allowed": "forbidden",
  "account not found": "notFound",
  "quote not found": "notFound",
  "invoice not found": "notFound",
  "payment not found": "notFound",
  "profile id cannot change": "forbidden",
  "not allowed to change protected profile fields": "protectedFields",
  "you cannot change the type, email or status of your own account": "ownAccountFields",
  "only a super admin can change a super admin account": "superAdminOnly",
  "only a super admin can change super admin membership": "superAdminOnly",
  "only a super admin can grant or revoke the super_admin role": "superAdminOnly",
  "you cannot change your own roles": "ownRoles",
  "you cannot grant or remove a role with permissions you do not hold": "noEscalation",
  "the client role is only for client accounts": "clientRoleKind",
  "employee roles are only for employee accounts": "employeeRoleKind",
  "only client accounts can belong to a client organisation": "clientOnly",
  "the project belongs to a different client": "projectOtherClient",
  "the milestone belongs to a different project": "milestoneOtherProject",
  "the asset belongs to a different engagement": "assetOtherEngagement",
  "the end date cannot be before the start date": "endBeforeStart",
  "the due date cannot be before the issue date": "dueBeforeIssue",
  "the validity date cannot be before the issue date": "validBeforeIssue",
  "project files must live under the project folder": "filePath",
  "evidence files must live under the finding folder": "filePath",
  "hr files must live under the employee folder": "filePath",
  "authorisation files must live under the engagement folder": "filePath",
  "report files must live under the engagement folder": "filePath",
  "new invoices start as drafts": "managedStatus",
  "new quotes start as drafts": "managedStatus",
  "new certificates start as drafts": "managedStatus",
  "new report versions start as internal drafts": "managedStatus",
  "invoice status and number are managed by the platform": "managedStatus",
  "quote status and number are managed by the platform": "managedStatus",
  "certificate status and number are managed by the platform": "managedStatus",
  "this status cannot be set directly": "managedStatus",
  "issued invoices cannot be edited": "invoiceIssued",
  "issued invoices cannot be edited; void and issue a replacement instead": "invoiceIssued",
  "issued invoices are immutable; void and reissue instead": "invoiceIssued",
  "items of an issued invoice cannot be changed": "invoiceIssued",
  "items of an issued document cannot be changed": "invoiceIssued",
  "a void invoice cannot be reopened": "invoiceIssued",
  "issued quotes cannot be edited": "quoteIssued",
  "issued quotes cannot be edited; void it and issue a new one": "quoteIssued",
  "issued quotes are immutable; void and reissue instead": "quoteIssued",
  "items of an issued quote cannot be changed": "quoteIssued",
  "issued certificates cannot be edited; revoke it and issue a new one": "certificateIssued",
  "issued certificates are immutable; revoke and issue a new one": "certificateIssued",
  "a revoked certificate cannot be reinstated": "certificateIssued",
  "a final report is immutable; upload a new version instead": "reportFinal",
  "the file of a report version cannot be replaced; upload a new version": "reportFile",
  "finalising a report requires approval rights": "reportApproval",
  "only report approvers can share or withdraw a final report": "reportApproval",
  "an invoice needs at least one line item": "needsItems",
  "a quote needs at least one line item": "needsItems",
  "line items must be a list": "invalid",
  "a document can have at most 100 line items": "tooManyItems",
  "void the invoice before issuing a replacement": "invoiceVoidFirst",
  "invoice cannot be voided in its current state": "invoiceNotVoidable",
  "only issued invoices can be sent": "invoiceNotSendable",
  "only accepted quotes can be converted to an invoice": "quoteNotAccepted",
  "the quote cannot move to this status from its current state": "quoteTransition",
  "a reason is required": "reasonRequired",
  "a reason is required to void an invoice": "reasonRequired",
  "a reason is required to remove a payment": "reasonRequired",
  "the amount must be greater than zero": "paymentPositive",
  "the payment date cannot be in the future": "paymentFuture",
  "the payment is more than the balance due": "paymentTooMuch",
  "payments can only be recorded against issued invoices": "paymentOnDraft",
  "payments on a void invoice cannot be changed": "paymentOnVoid",
  "only issued certificates can be revoked": "certificateNotRevocable",
  "invoice was modified or already issued; reload and retry": "conflict",
  "invoice was modified or deleted; reload and retry": "conflict",
  "quote was modified or already issued; reload and retry": "conflict",
  "quote was modified or deleted; reload and retry": "conflict",
  "certificate was modified or already issued; reload and retry": "conflict",
  "publishing requires content.publish": "publishPermission",
  "scheduled content needs a scheduled_for time": "scheduleNeedsTime",
  "scheduled content needs a publication time": "scheduleNeedsTime",
  "the publication time must be in the future": "scheduleInFuture",
  "slug is required": "slugRequired",
  "only the project manager can share items with the client": "shareWithClient",
  "only project administrators can change the client or code of a project": "projectClientChange",
  "the client and authorisation of an authorised engagement can only be changed by a security manager": "engagementLocked",
  "audit logs are append only": "forbidden",
  /* Reference faults are programming errors, never something a person did: the
     kind comes from the code, not from a form. There is nothing specific to
     tell them, so they get the general message and we get the log line. */
  "unknown reference kind %": "generic",
  "no free reference for kind % in %": "generic",
};

/** `<something> must be an employee account` (the roster guard names the field). */
const EMPLOYEE_ROSTER = / must be an employee account$/;

export function dbMessageKey(message: string | undefined | null): string | null {
  if (!message) return null;
  const m = message.trim().toLowerCase();
  if (DB_MESSAGE_KEYS[m]) return DB_MESSAGE_KEYS[m] ?? null;
  if (EMPLOYEE_ROSTER.test(m)) return "employeeOnly";
  return null;
}
