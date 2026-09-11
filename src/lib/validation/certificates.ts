import { z } from "zod";
import { optionalString, optionalUuid, uuid, optionalDate, localeEnum } from "./common";

export const CERTIFICATE_TYPES = ["training", "internship", "experience", "appreciation", "other"] as const;
export type CertificateType = (typeof CERTIFICATE_TYPES)[number];
export const certificateTypeEnum = z.enum(CERTIFICATE_TYPES);

const optionalHours = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : typeof v === "string" ? Number(v.replace(/,/g, "")) : v),
  z.number().finite().positive().max(99999).optional(),
);

const optionalEmail = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().email().max(200).optional(),
);

/**
 * Draft certificate fields. The form adapts by type; the schema stays one
 * shape so the action and the form share field names.
 */
export const certificateSchema = z
  .object({
    type: certificateTypeEnum,
    language: localeEnum,
    recipient_name_en: z.string().trim().min(1).max(200),
    recipient_name_ar: optionalString(200),
    recipient_email: optionalEmail,
    recipient_user_id: optionalUuid,
    title_en: z.string().trim().min(1).max(200),
    title_ar: optionalString(200),
    description_en: optionalString(2000),
    description_ar: optionalString(2000),
    program_name_en: optionalString(200),
    program_name_ar: optionalString(200),
    role_title_en: optionalString(200),
    role_title_ar: optionalString(200),
    start_date: optionalDate,
    end_date: optionalDate,
    hours: optionalHours,
    signatory_name_en: optionalString(120),
    signatory_name_ar: optionalString(120),
    signatory_title_en: optionalString(120),
    signatory_title_ar: optionalString(120),
  })
  .superRefine((v, ctx) => {
    if (v.start_date && v.end_date && v.end_date < v.start_date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end_date"], message: "End date must be after the start date." });
    }
    if (v.type === "experience" && !v.role_title_en) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["role_title_en"], message: "A role title is required for experience certificates." });
    }
    if (v.type === "experience" && !v.start_date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["start_date"], message: "A start date is required for experience certificates." });
    }
    if (v.type === "training" && !v.program_name_en) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_name_en"], message: "A program name is required for training certificates." });
    }
  });

export type CertificateInput = z.infer<typeof certificateSchema>;

export const issueCertificateSchema = z.object({
  id: uuid,
  expected_updated_at: z.string().min(1),
  issue_date: optionalDate,
});

export const revokeCertificateSchema = z.object({
  id: uuid,
  reason: z.string().trim().min(3).max(500),
});

export const certificateIdSchema = z.object({ id: uuid });
