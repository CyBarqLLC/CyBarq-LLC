import { z } from "zod";
import { optionalString, localeEnum } from "./common";

/**
 * Contact form schema. Shared by the form (field names) and the server action.
 * `website` is a honeypot: humans never see it, bots fill it in.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  company: optionalString(200),
  country: optionalString(120),
  service: optionalString(160),
  message: z.string().trim().min(20).max(4000),
  locale: localeEnum.optional(),
  website: optionalString(200),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field names in display order; used by the client to map field errors to localized messages. */
export const CONTACT_FIELDS = ["name", "email", "company", "country", "service", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Marker returned in `ActionResult.error` when the sender has been rate limited. */
export const CONTACT_RATE_LIMITED = "rate_limited";

export const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const;
