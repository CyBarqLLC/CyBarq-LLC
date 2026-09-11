import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Service role client. Bypasses RLS. Only ever used inside server actions and
 * route handlers AFTER an explicit authorization check, for operations that
 * cannot be expressed through the user's own session (account provisioning,
 * signed URLs for private files, PDF storage, contact submissions).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
