import { z } from "zod";
import { optionalDate, optionalString, optionalUuid, requiredString, uuid } from "./common";

export const EMPLOYMENT_STATUSES = ["active", "inactive", "on_leave", "ended"] as const;
export const DOCUMENT_KINDS = ["contract", "id", "certificate", "experience_certificate", "training_certificate", "other"] as const;

export const employmentStatusEnum = z.enum(EMPLOYMENT_STATUSES);
export const documentKindEnum = z.enum(DOCUMENT_KINDS);

const optionalEmail = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().email().max(200).optional());

export const employeeFieldsSchema = z
  .object({
    employee_no: optionalString(50),
    department_id: optionalUuid,
    job_title_en: requiredString(200),
    job_title_ar: optionalString(200),
    employment_status: employmentStatusEnum,
    start_date: optionalDate,
    end_date: optionalDate,
    work_phone: optionalString(50),
    work_email: optionalEmail,
    emergency_contact_name: optionalString(200),
    emergency_contact_phone: optionalString(50),
    notes: optionalString(5000),
  })
  .refine((v) => !v.start_date || !v.end_date || v.start_date <= v.end_date, { message: "The end date must be after the start date.", path: ["end_date"] });

export const createEmployeeSchema = z.object({ user_id: uuid }).and(employeeFieldsSchema);

export type EmployeeInput = z.infer<typeof employeeFieldsSchema>;

export const departmentSchema = z.object({
  name_en: requiredString(120),
  name_ar: requiredString(120),
  position: z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : 0), z.number().int().min(0).max(1000)),
});

export const teamSchema = z.object({
  name_en: requiredString(120),
  name_ar: requiredString(120),
  department_id: optionalUuid,
  lead_user_id: optionalUuid,
});

export const teamMemberSchema = z.object({ user_id: uuid });

export const employeeDocumentSchema = z.object({
  employeeUserId: uuid,
  path: z.string().min(1).max(400),
  title: requiredString(200),
  kind: documentKindEnum.default("other"),
  size: z.number().int().nonnegative(),
  mime: z.string().max(200).optional(),
});

export const hrUploadRequestSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(25 * 1024 * 1024),
  type: z.string().max(200),
});

export const DOCUMENT_KIND_LABELS: Record<(typeof DOCUMENT_KINDS)[number], { en: string; ar: string }> = {
  contract: { en: "Contract", ar: "عقد" },
  id: { en: "Identification", ar: "وثيقة هوية" },
  certificate: { en: "Certificate", ar: "شهادة" },
  experience_certificate: { en: "Experience certificate", ar: "شهادة خبرة" },
  training_certificate: { en: "Training certificate", ar: "شهادة تدريب" },
  other: { en: "Other", ar: "أخرى" },
};
