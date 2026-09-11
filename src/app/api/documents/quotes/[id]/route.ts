import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { quoteDocumentData } from "@/lib/pdf/documents";
import { renderCommercialPdf } from "@/lib/pdf/render";
import { documentError, isUuid, pdfResponse } from "../../_lib/respond";
import { storedOrRendered } from "../../_lib/stored-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/documents/quotes/[id]: same access model as invoices. */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return documentError(request, 404);
  const viewer = await getViewer();
  if (!viewer) return documentError(request, 401);

  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) return documentError(request, 404);

  try {
    const { buffer, source } = await storedOrRendered({
      bucket: "private-finance-documents",
      table: "quotes",
      id: quote.id,
      isDraft: quote.status === "draft",
      pdfPath: quote.pdf_path,
      storePath: `quotes/${quote.id}.pdf`,
      render: async () => {
        const admin = createAdminClient();
        const [{ data: items }, { data: client }] = await Promise.all([
          admin.from("quote_items").select("description_en, description_ar, quantity, unit_price, amount").eq("quote_id", quote.id).order("position"),
          admin.from("clients").select("name_en, name_ar, legal_name, tax_number, address, city, country").eq("id", quote.client_id).maybeSingle(),
        ]);
        return renderCommercialPdf(quoteDocumentData(quote, items ?? [], client ?? null));
      },
    });
    await audit("document.downloaded", "quote", quote.id, { number: quote.number, source }, quote.client_id);
    return pdfResponse(buffer, quote.number ?? (quote.language === "ar" ? "مسودة-عرض-سعر" : "draft-quote"));
  } catch (error) {
    console.error("[documents] quote render failed", error);
    return documentError(request, 500);
  }
}
