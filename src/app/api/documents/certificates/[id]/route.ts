import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadBuffer, uploadBuffer } from "@/lib/storage";
import { audit } from "@/lib/audit";
import { certificateDocumentData } from "@/lib/pdf/documents";
import { renderCertificatePdf } from "@/lib/pdf/render";
import { isUuid, jsonError, pdfResponse } from "../../_lib/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "private-certificates";

/**
 * GET /api/documents/certificates/[id]
 * Visible to certificates.read holders and to the recipient (RLS). Issued and
 * revoked certificates are stored after the first render; drafts render live.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(404, "Not found");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "Unauthorized");

  const { data: certificate } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (!certificate) return jsonError(404, "Not found");

  const isDraft = certificate.status === "draft";
  const fileName = certificate.certificate_no ?? `draft-certificate-${certificate.id.slice(0, 8)}`;

  if (!isDraft && certificate.pdf_path) {
    try {
      const stored = await downloadBuffer(BUCKET, certificate.pdf_path);
      await audit("document.downloaded", "certificate", certificate.id, { certificate_no: certificate.certificate_no, source: "stored" });
      return pdfResponse(stored, fileName);
    } catch (error) {
      console.error("[documents] stored certificate unavailable, rendering", error);
    }
  }

  let buffer: Buffer;
  try {
    buffer = await renderCertificatePdf(await certificateDocumentData(certificate));
  } catch (error) {
    console.error("[documents] certificate render failed", error);
    return jsonError(500, "Could not render the document");
  }

  if (!isDraft) {
    const path = `${certificate.id}.pdf`;
    try {
      await uploadBuffer(BUCKET, path, buffer, "application/pdf");
      if (certificate.pdf_path !== path) {
        const admin = createAdminClient();
        const { error } = await admin.from("certificates").update({ pdf_path: path }).eq("id", certificate.id);
        if (error) console.error("[documents] could not record certificate pdf_path", error.message);
      }
    } catch (error) {
      console.error("[documents] could not store certificate PDF", error);
    }
  }

  await audit("document.downloaded", "certificate", certificate.id, { certificate_no: certificate.certificate_no, source: isDraft ? "draft" : "rendered" });
  return pdfResponse(buffer, fileName);
}
