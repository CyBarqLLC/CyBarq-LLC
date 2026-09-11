import { z } from "zod";
import { localeEnum, optionalString, requiredString } from "./common";

export const profileSchema = z.object({
  full_name: requiredString(200),
  full_name_ar: optionalString(200),
  phone: optionalString(50),
  locale: localeEnum,
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const avatarRequestSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(AVATAR_MAX_BYTES),
  type: z.enum(AVATAR_MIME_TYPES),
});

export const avatarSaveSchema = z.object({
  path: z.string().min(1).max(300),
});

export function avatarExtension(mime: (typeof AVATAR_MIME_TYPES)[number]): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
  }
}
