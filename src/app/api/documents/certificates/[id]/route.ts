import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { certificateDocumentData } from "@/lib/pdf/documents";
import { renderCertificatePdf } from "@/lib/pdf/render";
import { documentError, isUuid, pdfResponse } from "../../_lib/respond";
import { storedOrRendered } from "../../_lib/stored-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/documents/certificates/[id]
 * For certificates.read holders and the recipient (RLS). Issued and revoked
 * certificates are stored after the first render; drafts render live.
 * Recipients without an account use the public link on the verification page.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return documentError(request, 404);
  const viewer = await getViewer();
  if (!viewer) return documentError(request, 401);

  const supabase = await createClient();
  const { data: certificate } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (!certificate) return documentError(request, 404);

  try {
    const { buffer, source } = await storedOrRendered({
      bucket: "private-certificates",
      table: "certificates",
      id: certificate.id,
      isDraft: certificate.status === "draft",
      pdfPath: certificate.pdf_path,
      storePath: `${certificate.id}.pdf`,
      render: async () => renderCertificatePdf(await certificateDocumentData(certificate)),
    });
    await audit("document.downloaded", "certificate", certificate.id, { certificate_no: certificate.certificate_no, source });
    return pdfResponse(buffer, certificate.certificate_no ?? (certificate.language === "ar" ? "مسودة-شهادة" : "draft-certificate"));
  } catch (error) {
    console.error("[documents] certificate render failed", error);
    return documentError(request, 500);
  }
}
