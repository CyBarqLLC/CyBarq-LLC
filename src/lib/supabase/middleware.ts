import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { normaliseUrl } from "@/lib/env";

/**
 * Refreshes the Supabase session cookie on every request and returns the user
 * (or null). The response carries any rotated cookies back to the browser.
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
  // getUser() validates the JWT against the auth server; never trust getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, response };
}
