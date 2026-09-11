"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser client (anon key + user session). Used for auth flows only. */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return browserClient;
}
