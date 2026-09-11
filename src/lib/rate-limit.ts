import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";

/**
 * Small in-memory token bucket. On Vercel each function instance keeps its own
 * bucket, so this is a first line of defense against bursts, not a global
 * quota. Sensitive endpoints additionally rely on database constraints and
 * Supabase Auth's own rate limits. Documented as a residual risk.
 */
const buckets = new Map<string, { tokens: number; updatedAt: number }>();
const MAX_KEYS = 5000;

export type RateLimitOptions = { key: string; limit: number; windowMs: number };

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) if (now - v.updatedAt > windowMs) buckets.delete(k);
  }
  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const refill = ((now - bucket.updatedAt) / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = now;
  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0 };
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, remaining: Math.floor(bucket.tokens) };
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
