import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { certificateDocumentData } from "@/lib/pdf/documents";
import { renderCertificatePdf } from "@/lib/pdf/render";
import { documentError, pdfResponse } from "../../../documents/_lib/respond";
import { storedOrRendered } from "../../../documents/_lib/stored-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODE = /^[0-9a-f]{12,64}$/i;

/**
 * GET /api/verify/[code]/pdf
 * The certificate PDF for whoever holds its verification code (the recipient,
 * or anyone the recipient shared it with). The code is unguessable and the PDF
 * shows exactly what the public verification page already confirms. Revoked
 * certificates are not downloadable. Rate limited per address.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const normalised = code.trim().toLowerCase();
  if (!CODE.test(normalised)) return documentError(request, 404);
  const ip = await requestIp();
  if (!(await rateLimit({ key: `verify-pdf:${ip}`, limit: 30, windowMs: 10 * 60 * 1000 })).allowed) return documentError(request, 404);

  const admin = createAdminClient();
  const { data: certificate } = await admin.from("certificates").select("*").eq("verification_code", normalised).eq("status", "issued").maybeSingle();
  if (!certificate) return documentError(request, 404);

  try {
    const { buffer } = await storedOrRendered({
      bucket: "private-certificates",
      table: "certificates",
      id: certificate.id,
      isDraft: false,
      pdfPath: certificate.pdf_path,
      storePath: `${certificate.id}.pdf`,
      render: async () => renderCertificatePdf(await certificateDocumentData(certificate)),
    });
    await audit("certificate.public_download", "certificate", certificate.id, { certificate_no: certificate.certificate_no });
    return pdfResponse(buffer, certificate.certificate_no ?? "certificate");
  } catch (error) {
    console.error("[verify] certificate render failed", error);
    return documentError(request, 500);
  }
}
