import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limiting shared by every server instance: a fixed window counter in the
 * database (public.consume_rate_limit, service role only). Keys are hashed
 * with the server salt before they leave the process, so no raw IP address or
 * email is stored. If the database cannot be reached, a small per-instance
 * bucket still limits bursts rather than failing open completely.
 */
const buckets = new Map<string, { tokens: number; updatedAt: number }>();
const MAX_KEYS = 5000;

export type RateLimitOptions = { key: string; limit: number; windowMs: number };

function localLimit({ key, limit, windowMs }: RateLimitOptions): { allowed: boolean } {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) if (now - v.updatedAt > windowMs) buckets.delete(k);
  }
  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  bucket.tokens = Math.min(limit, bucket.tokens + ((now - bucket.updatedAt) / windowMs) * limit);
  bucket.updatedAt = now;
  const allowed = bucket.tokens >= 1;
  if (allowed) bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed };
}

function hashKey(key: string): string {
  return createHash("sha256").update(`${serverEnv().RATE_LIMIT_SALT}:rl:${key}`).digest("hex").slice(0, 40);
}

export async function rateLimit(options: RateLimitOptions): Promise<{ allowed: boolean }> {
  try {
    const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
      _key: hashKey(options.key),
      _limit: options.limit,
      _window_seconds: Math.max(1, Math.round(options.windowMs / 1000)),
    });
    if (error) throw error;
    return { allowed: data === true };
  } catch (error) {
    console.error("[rate-limit] database limiter unavailable, using local bucket", error);
    return localLimit(options);
  }
}

export async function requestIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0]?.trim() : h.get("x-real-ip")) || "unknown";
}

export async function requestUserAgent(): Promise<string> {
  const h = await headers();
  return h.get("user-agent") ?? "";
}

/** Salted, one way hash of an IP for logs and abuse controls. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${serverEnv().RATE_LIMIT_SALT}:${ip}`).digest("hex").slice(0, 32);
}
