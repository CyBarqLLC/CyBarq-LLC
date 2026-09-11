import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("CyBarq <no-reply@cybarq.com>"),
  CONTACT_INBOX: z.string().email().default("info@cybarq.com"),
  RATE_LIMIT_SALT: z.string().min(16).default("cybarq-development-salt-change-me"),
  CRON_SECRET: z.string().optional(),
});

let cached: z.infer<typeof serverSchema> | null = null;

/** Server side secrets. Parsed lazily so build steps without secrets still succeed. */
export function serverEnv() {
  if (!cached) cached = serverSchema.parse(process.env);
  return cached;
}
