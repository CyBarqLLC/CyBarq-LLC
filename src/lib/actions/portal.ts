"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requireClientUser, type Viewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { actionError } from "@/lib/actions/messages";
import { formToObject } from "@/lib/validation/common";
import { supportRequestSchema, portalUploadFileSchema, portalDocumentRegisterSchema } from "@/lib/validation/portal";
import { signedUploadUrl, safeFileName } from "@/lib/storage";
import { audit } from "@/lib/audit";

type UploadTicket = { signedUrl: string; token: string; path: string };

class NotFound extends Error {
  readonly code = "PGRST116";
}

/**
 * A project is uploadable by a client user only when it is visible through
 * one of their clients (RLS: private.my_client_project_ids). The row must be
 * selectable AND belong to one of the viewer's clients.
 */
async function loadClientProject(viewer: Viewer, projectId: string): Promise<{ id: string; client_id: string }> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, client_id, client_visible, status").eq("id", projectId).maybeSingle();
  if (!data || !data.client_id || !data.client_visible || data.status === "draft" || !viewer.clientIds.includes(data.client_id)) throw new NotFound();
  return { id: data.id, client_id: data.client_id };
}

export async function requestPortalDocumentUpload(projectId: string, file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    const viewer = await requireClientUser();
    const parsed = portalUploadFileSchema.parse(file);
    const project = await loadClientProject(viewer, projectId);
    const path = `${project.id}/${randomUUID()}-${safeFileName(parsed.name)}`;
    const ticket = await signedUploadUrl("private-project-documents", path);
    return ok(ticket);
  });
}

export async function registerPortalDocument(input: { project_id: string; path: string; name: string; size: number; type: string; title?: string }): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireClientUser();
    const parsed = portalDocumentRegisterSchema.parse(input);
    const project = await loadClientProject(viewer, parsed.project_id);
    if (!parsed.path.startsWith(`${project.id}/`)) return fail(await actionError("filePath"), "VALIDATION");
    const supabase = await createClient();
    // The database trigger forces client_visible = true for client uploads; set it explicitly as well.
    const { data, error } = await supabase
      .from("project_documents")
      .insert({
        project_id: project.id,
        title: parsed.title || parsed.name,
        category: "general",
        storage_path: parsed.path,
        size_bytes: parsed.size,
        mime_type: parsed.type || null,
        client_visible: true,
        uploaded_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await audit("portal.document_uploaded", "project_document", data.id, { project_id: project.id }, project.client_id);
    revalidatePath("/[locale]/portal/projects/[id]", "page");
    revalidatePath("/[locale]/portal/documents", "page");
    return ok(undefined);
  });
}

export async function createSupportRequest(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const result = await runAction(async () => {
    const viewer = await requireClientUser();
    const input = supportRequestSchema.parse(formToObject(formData));
    if (!viewer.clientIds.includes(input.client_id)) return fail(await actionError("forbidden"), "FORBIDDEN");
    if (input.project_id) {
      // Only projects visible to this client may be referenced.
      await loadClientProject(viewer, input.project_id);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_requests")
      .insert({
        client_id: input.client_id,
        project_id: input.project_id ?? null,
        subject: input.subject,
        body: input.body,
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/[locale]/portal/support", "page");
    revalidatePath("/[locale]/portal", "page");
    return ok({ id: data.id });
  });
  if (result.ok) {
    const locale = (await getLocale()) as Locale;
    redirect({ href: "/portal/support", locale });
  }
  return result;
}

export async function markPortalNotificationsRead(): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireClientUser();
    const supabase = await createClient();
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", viewer.userId).is("read_at", null);
    if (error) throw error;
    revalidatePath("/[locale]/portal", "layout");
    return ok(undefined);
  });
}
