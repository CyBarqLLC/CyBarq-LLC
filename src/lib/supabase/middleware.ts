import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { normaliseUrl } from "@/lib/env";

/**
 * Refreshes the Supabase session cookie and returns the signed in user id (or
 * null). The response carries any rotated cookies back to the browser.
 * The access token is verified locally against the project's published signing
 * keys, so a valid session costs no round trip to the auth server; only an
 * expired token triggers a refresh. Authorization itself happens in the
 * server components and the database, never here.
 */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient<Database>(
    normaliseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "",
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data, error } = await supabase.auth.getClaims();
  const userId = !error && data?.claims?.sub ? data.claims.sub : null;
  return { userId, response };
}
