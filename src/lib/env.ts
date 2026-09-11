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

function read(key: keyof typeof schema): string | undefined {
  switch (key) {
    case "NEXT_PUBLIC_SITE_URL":
      return process.env.NEXT_PUBLIC_SITE_URL ?? "https://cybarq.com";
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
  return schema.NEXT_PUBLIC_SUPABASE_URL.safeParse(process.env.NEXT_PUBLIC_SUPABASE_URL).success && schema.NEXT_PUBLIC_SUPABASE_ANON_KEY.safeParse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).success;
}
