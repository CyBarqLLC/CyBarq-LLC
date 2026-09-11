import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { publicEnv } from "@/lib/env";

/**
 * Request scoped Supabase client using the caller's session cookie.
 * Every query made with it is subject to RLS as the signed in user.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Anonymous client for public pages (published content only). Uses the anon
 * key with no cookies, so it can be used in cached / static rendering.
 */
export function createPublicClient() {
  return createServerClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
