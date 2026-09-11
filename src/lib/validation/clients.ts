import { z } from "zod";
import { optionalString, requiredString } from "./common";

export const CLIENT_STATUSES = ["prospect", "active", "inactive"] as const;
export const clientStatusEnum = z.enum(CLIENT_STATUSES);

const optionalEmail = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().email().max(200).optional());
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().url().max(300).optional(),
);

export const clientSchema = z.object({
  name_en: requiredString(200),
  name_ar: optionalString(200),
  legal_name: optionalString(300),
  country: optionalString(100),
  city: optionalString(100),
  address: optionalString(500),
  tax_number: optionalString(100),
  website: optionalUrl,
  primary_contact_name: optionalString(200),
  primary_contact_email: optionalEmail,
  phone: optionalString(50),
  status: clientStatusEnum,
  notes: optionalString(5000),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const contactSchema = z.object({
  name: requiredString(200),
  email: optionalEmail,
  phone: optionalString(50),
  title: optionalString(200),
});

export const inviteClientUserSchema = z.object({
  email: z.string().trim().email().max(200),
  full_name: requiredString(200),
  full_name_ar: optionalString(200),
});

export function isClientStatus(value: string | undefined): value is (typeof CLIENT_STATUSES)[number] {
  return (CLIENT_STATUSES as readonly string[]).includes(value ?? "");
}
