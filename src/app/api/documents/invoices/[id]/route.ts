import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { invoiceDocumentData } from "@/lib/pdf/documents";
import { renderCommercialPdf } from "@/lib/pdf/render";
import { documentError, isUuid, pdfResponse } from "../../_lib/respond";
import { storedOrRendered } from "../../_lib/stored-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/documents/invoices/[id]
 * Access is decided by loading the invoice through the caller's own session
 * (finance staff, or the client organisation for issued invoices). The rest of
 * the document (items, client, related numbers) is then read with the service
 * role, so every viewer gets the same, complete PDF.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return documentError(request, 404);
  const viewer = await getViewer();
  if (!viewer) return documentError(request, 401);

  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) return documentError(request, 404);

  const isDraft = invoice.status === "draft";
  try {
    const { buffer, source } = await storedOrRendered({
      bucket: "private-finance-documents",
      table: "invoices",
      id: invoice.id,
      isDraft,
      pdfPath: invoice.pdf_path,
      storePath: `invoices/${invoice.id}.pdf`,
      render: async () => {
        const admin = createAdminClient();
        const [{ data: items }, { data: client }, { data: replaced }, { data: quote }, { data: project }] = await Promise.all([
          admin.from("invoice_items").select("description_en, description_ar, quantity, unit_price, amount").eq("invoice_id", invoice.id).order("position"),
          admin.from("clients").select("name_en, name_ar, legal_name, tax_number, address, city, country").eq("id", invoice.client_id).maybeSingle(),
          invoice.replaces_invoice_id ? admin.from("invoices").select("number").eq("id", invoice.replaces_invoice_id).maybeSingle() : Promise.resolve({ data: null }),
          invoice.quote_id ? admin.from("quotes").select("number").eq("id", invoice.quote_id).maybeSingle() : Promise.resolve({ data: null }),
          invoice.project_id ? admin.from("projects").select("code").eq("id", invoice.project_id).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        const data = await invoiceDocumentData(invoice, items ?? [], client ?? null, { replacesNumber: replaced?.number ?? null, quoteNumber: quote?.number ?? null, projectCode: project?.code ?? null });
        return renderCommercialPdf(data);
      },
    });
    await audit("document.downloaded", "invoice", invoice.id, { number: invoice.number, source }, invoice.client_id);
    return pdfResponse(buffer, invoice.number ?? (invoice.language === "ar" ? "مسودة-فاتورة" : "draft-invoice"));
  } catch (error) {
    console.error("[documents] invoice render failed", error);
    return documentError(request, 500);
  }
}
