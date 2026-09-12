import { z } from "zod";
import { checkbox, optionalDate, optionalString, optionalUuid, requiredString, uuid } from "./common";

export const PROJECT_STATUSES = ["draft", "planned", "active", "on_hold", "completed", "cancelled"] as const;
export const PRACTICES = ["cybersecurity", "development", "ai", "infrastructure", "mixed"] as const;
export const MEMBER_ROLES = ["manager", "member", "viewer"] as const;
export const MILESTONE_STATUSES = ["planned", "in_progress", "completed"] as const;
export const DOCUMENT_CATEGORIES = ["general", "proposal", "contract", "report", "deliverable", "other"] as const;

export const projectStatusEnum = z.enum(PROJECT_STATUSES);
export const practiceEnum = z.enum(PRACTICES);
export const memberRoleEnum = z.enum(MEMBER_ROLES);
export const milestoneStatusEnum = z.enum(MILESTONE_STATUSES);
export const documentCategoryEnum = z.enum(DOCUMENT_CATEGORIES);

/**
 * Project code. Left empty, the platform assigns the next reference
 * (CyB-PRJ-000001); a team that already calls a piece of work something else
 * can type that instead.
 */
export const projectCode = z
  .string()
  .trim()
  .toUpperCase()
  .refine((v) => v === "" || /^[A-Z0-9][A-Z0-9-]{2,30}$/.test(v), "Use letters, digits and dashes only.");

export const projectSchema = z
  .object({
    code: projectCode,
    name_en: requiredString(200),
    name_ar: optionalString(200),
    client_id: optionalUuid,
    practice: practiceEnum,
    status: projectStatusEnum,
    description: optionalString(5000),
    manager_user_id: optionalUuid,
    start_date: optionalDate,
    end_date: optionalDate,
    client_visible: checkbox,
  })
  .refine((v) => !v.start_date || !v.end_date || v.start_date <= v.end_date, { message: "The end date must be after the start date.", path: ["end_date"] });

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectStatusChangeSchema = z.object({ status: projectStatusEnum });

export const projectMemberSchema = z.object({
  user_id: uuid,
  role: memberRoleEnum,
});

export const milestoneSchema = z.object({
  title_en: requiredString(200),
  title_ar: optionalString(200),
  description: optionalString(2000),
  due_date: optionalDate,
  status: milestoneStatusEnum,
  client_visible: checkbox,
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const projectUpdateSchema = z.object({
  title: requiredString(200),
  body: requiredString(10000),
  client_visible: checkbox,
});

export const projectDocumentSchema = z.object({
  projectId: uuid,
  path: z.string().min(1).max(400),
  title: requiredString(200),
  category: documentCategoryEnum.default("general"),
  size: z.number().int().nonnegative(),
  mime: z.string().max(200).optional(),
  client_visible: z.boolean().default(false),
});

export const uploadRequestSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(50 * 1024 * 1024),
  type: z.string().max(200),
});

export function isProjectStatus(value: string | undefined): value is (typeof PROJECT_STATUSES)[number] {
  return (PROJECT_STATUSES as readonly string[]).includes(value ?? "");
}

export function isPractice(value: string | undefined): value is (typeof PRACTICES)[number] {
  return (PRACTICES as readonly string[]).includes(value ?? "");
}

/** Strips characters that have meaning inside PostgREST filter expressions. */
export function searchTerm(value: string | undefined, max = 80): string | undefined {
  const cleaned = (value ?? "").replace(/[,()%\\"']/g, " ").trim().slice(0, max);
  return cleaned.length > 0 ? cleaned : undefined;
}
