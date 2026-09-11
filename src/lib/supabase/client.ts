"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { normaliseUrl } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser client (anon key + user session). Used for auth flows only. */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      normaliseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "",
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
    );
  }
  return browserClient;
}
