import { z } from "zod";
import { requiredString, optionalString, optionalUuid, uuid } from "./common";

export const supportRequestSchema = z.object({
  client_id: uuid,
  project_id: optionalUuid,
  subject: requiredString(200),
  body: requiredString(5000),
});
export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

export const portalUploadFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(50 * 1024 * 1024),
  type: z.string().max(120),
});

export const portalDocumentRegisterSchema = z.object({
  project_id: uuid,
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
  type: z.string().max(120),
  title: optionalString(200),
});
