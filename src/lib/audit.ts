import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requestIp, requestUserAgent } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Writes an audit row for an application level action (admin operations,
 * sensitive document access). Database triggers cover data changes.
 * Never pass secrets in metadata.
 */
export async function audit(action: string, entityType: string, entityId: string | null, metadata: Record<string, Json> = {}, clientId?: string | null) {
  const supabase = await createClient();
  const [ip, ua] = await Promise.all([requestIp(), requestUserAgent()]);
  const { error } = await supabase.rpc("record_audit_event", {
    _action: action,
    _entity_type: entityType,
    _entity_id: entityId ?? "",
    _metadata: metadata,
    _client_id: clientId ?? undefined,
    _ip: ip,
    _user_agent: ua,
  });
  if (error) console.error("[audit] failed", action, error.message);
}
