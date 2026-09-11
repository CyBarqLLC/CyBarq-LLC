import { z } from "zod";

/** Empty strings from forms become undefined so optional fields validate cleanly. */
export const optionalString = (max = 500) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

export const requiredString = (max = 200) => z.string().trim().min(1).max(max);

export const uuid = z.string().uuid();
export const optionalUuid = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().uuid().optional());

/** ISO date (yyyy-mm-dd) from <input type="date">. */
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const optionalDate = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), dateString.optional());

export const money = z.preprocess((v) => (typeof v === "string" ? Number(v.replace(/,/g, "")) : v), z.number().finite().nonnegative().max(1e12));
export const positiveInt = z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().int().positive());
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
export const localeEnum = z.enum(["en", "ar"]);
export const slug = z.string().trim().min(1).max(160);

/** Converts FormData into a plain object (repeated keys become arrays). */
export function formToObject(formData: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const existing = out[key];
    if (existing === undefined) out[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else out[key] = [existing, value];
  }
  return out;
}
