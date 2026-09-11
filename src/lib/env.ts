import { z } from "zod";

/**
 * Public variables are inlined by Next.js and must be referenced explicitly.
 * Validation is lazy (on first access), so importing a module never throws
 * during `next build` page data collection; a missing variable fails loudly
 * with a clear message the first time it is actually used.
 */
const schema = {
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
} as const;

type PublicEnv = { [K in keyof typeof schema]: string };

const DEFAULT_SITE_URL = "https://cybarq.com";

/**
 * Normalises a URL typed into a dashboard: trims spaces and quotes, adds
 * https:// when the scheme is missing and drops trailing slashes. Returns
 * null when the value still is not a valid http(s) URL.
 */
export function normaliseUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let v = raw.trim().replace(/^["']|["']$/g, "").trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

/** The public site origin. Never throws: falls back to https://cybarq.com. */
export function siteUrl(): string {
  return normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL;
}

function read(key: keyof typeof schema): string | undefined {
  switch (key) {
    case "NEXT_PUBLIC_SITE_URL":
      return siteUrl();
    case "NEXT_PUBLIC_SUPABASE_URL":
      return normaliseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? undefined;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  }
}

function get(key: keyof typeof schema): string {
  const parsed = schema[key].safeParse(read(key));
  if (!parsed.success) {
    throw new Error(`Environment variable ${key} is missing or invalid. Set it in .env.local or in the Vercel project settings.`);
  }
  return parsed.data;
}

export const publicEnv: PublicEnv = {
  get NEXT_PUBLIC_SITE_URL() {
    return get("NEXT_PUBLIC_SITE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_URL() {
    return get("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
};

/** True when the Supabase connection is configured (lets public pages degrade gracefully). */
export function hasSupabaseEnv(): boolean {
  return normaliseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) !== null && schema.NEXT_PUBLIC_SUPABASE_ANON_KEY.safeParse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()).success;
}
