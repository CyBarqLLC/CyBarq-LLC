import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";

/**
 * Server side configuration.
 *
 * Every variable is read on its own, lazily, the first time it is used. A
 * problem with an optional variable (an empty CONTACT_INBOX, a short
 * RATE_LIMIT_SALT) must never take down unrelated features such as the
 * service role client, audit logging or the public verification page, so
 * optional values fall back to safe defaults and log one warning naming the
 * variable (never its value). Only SUPABASE_SERVICE_ROLE_KEY is required, and
 * only by the code that actually needs it.
 */

const DEFAULT_EMAIL_FROM = "CyBarq <no-reply@cybarq.com>";
const DEFAULT_CONTACT_INBOX = "info@cybarq.com";
const MIN_SALT_LENGTH = 16;

const email = z.string().email();
/** `Name <address@domain>` or a bare address. */
const MAILBOX = /^(?:[^<>@\r\n]+\s)?<([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)>$|^([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)$/;

const warned = new Set<string>();
function warnOnce(name: string, problem: string) {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`[env] ${name} ${problem}; using a safe fallback. Set it in the Vercel project settings.`);
}

/** Trimmed value, or undefined when unset or blank (dashboards often store empty strings). */
function raw(name: string): string | undefined {
  const value = process.env[name]?.trim().replace(/^["']|["']$/g, "").trim();
  return value ? value : undefined;
}

export class MissingServerEnvError extends Error {
  constructor(name: string) {
    super(`Environment variable ${name} is missing or invalid. Set it in .env.local or in the Vercel project settings.`);
    this.name = "MissingServerEnvError";
  }
}

function serviceRoleKey(): string {
  const value = raw("SUPABASE_SERVICE_ROLE_KEY");
  if (!value || value.length < 20) throw new MissingServerEnvError("SUPABASE_SERVICE_ROLE_KEY");
  return value;
}

function emailFrom(): string {
  const value = raw("EMAIL_FROM");
  if (!value) return DEFAULT_EMAIL_FROM;
  if (!MAILBOX.test(value)) {
    warnOnce("EMAIL_FROM", "is not a valid sender");
    return DEFAULT_EMAIL_FROM;
  }
  return value;
}

function contactInbox(): string {
  const value = raw("CONTACT_INBOX");
  if (!value) return DEFAULT_CONTACT_INBOX;
  if (!email.safeParse(value).success) {
    warnOnce("CONTACT_INBOX", "is not a valid email address");
    return DEFAULT_CONTACT_INBOX;
  }
  return value;
}

/**
 * Salt for one way hashes of IP addresses and rate limit keys. When the
 * variable is missing or too short, a salt is derived from the service role
 * key: still secret and stable per deployment, never a public constant.
 */
function rateLimitSalt(): string {
  const value = raw("RATE_LIMIT_SALT");
  if (value && value.length >= MIN_SALT_LENGTH) return value;
  warnOnce("RATE_LIMIT_SALT", value ? `is shorter than ${MIN_SALT_LENGTH} characters` : "is not set");
  const secret = raw("SUPABASE_SERVICE_ROLE_KEY");
  if (secret) return createHmac("sha256", secret).update("cybarq-rate-limit-salt-v1").digest("hex");
  if (process.env.NODE_ENV === "production") throw new MissingServerEnvError("RATE_LIMIT_SALT");
  return "cybarq-development-salt-change-me";
}

export type ServerEnv = {
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly RESEND_API_KEY: string | undefined;
  readonly EMAIL_FROM: string;
  readonly CONTACT_INBOX: string;
  readonly RATE_LIMIT_SALT: string;
  readonly CRON_SECRET: string | undefined;
};

/** Resolves a value once, on first use. */
function lazy<T>(resolve: () => T): () => T {
  let box: { value: T } | null = null;
  return () => (box ??= { value: resolve() }).value;
}

const serviceRoleKeyValue = lazy(serviceRoleKey);
const resendApiKeyValue = lazy(() => raw("RESEND_API_KEY"));
const emailFromValue = lazy(emailFrom);
const contactInboxValue = lazy(contactInbox);
const rateLimitSaltValue = lazy(rateLimitSalt);
const cronSecretValue = lazy(() => raw("CRON_SECRET"));

const env: ServerEnv = {
  get SUPABASE_SERVICE_ROLE_KEY() {
    return serviceRoleKeyValue();
  },
  get RESEND_API_KEY() {
    return resendApiKeyValue();
  },
  get EMAIL_FROM() {
    return emailFromValue();
  },
  get CONTACT_INBOX() {
    return contactInboxValue();
  },
  get RATE_LIMIT_SALT() {
    return rateLimitSaltValue();
  },
  get CRON_SECRET() {
    return cronSecretValue();
  },
};

/** Server side secrets, each validated on first use. */
export function serverEnv(): ServerEnv {
  return env;
}
