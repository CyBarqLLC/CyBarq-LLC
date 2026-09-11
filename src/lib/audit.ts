import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/auth/session";
import { requestIp, requestUserAgent } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Writes an audit row for an application level action (admin operations,
 * sensitive document access). Database triggers cover data changes.
 *
 * Only the server can write these rows: the entry is recorded with the
 * service role and the acting user is taken from the verified session, so a
 * signed-in user can never add or forge audit entries through the API.
 * Never pass secrets in metadata.
 */
export async function audit(action: string, entityType: string, entityId: string | null, metadata: Record<string, Json> = {}, clientId?: string | null) {
  const [viewer, ip, ua] = await Promise.all([getViewer(), requestIp(), requestUserAgent()]);
  const { error } = await createAdminClient().rpc("record_audit_event", {
    _actor_id: viewer?.userId,
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
