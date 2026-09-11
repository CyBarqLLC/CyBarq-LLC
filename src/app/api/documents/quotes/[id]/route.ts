import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadBuffer, uploadBuffer } from "@/lib/storage";
import { quoteDocumentData } from "@/lib/pdf/documents";
import { renderCommercialPdf } from "@/lib/pdf/render";
import { isUuid, jsonError, pdfResponse } from "../../_lib/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "private-finance-documents";

/**
 * GET /api/documents/quotes/[id]
 * Loaded through the caller's RLS scoped client (finance staff, or the client
 * organisation for sent quotes). Issued quotes are stored after the first render.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(404, "Not found");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "Unauthorized");

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) return jsonError(404, "Not found");

  const isDraft = quote.status === "draft";
  const fileName = quote.number ?? `draft-quote-${quote.id.slice(0, 8)}`;

  if (!isDraft && quote.pdf_path) {
    try {
      const stored = await downloadBuffer(BUCKET, quote.pdf_path);
      return pdfResponse(stored, fileName);
    } catch (error) {
      console.error("[documents] stored quote unavailable, rendering", error);
    }
  }

  const [{ data: items }, { data: client }] = await Promise.all([
    supabase.from("quote_items").select("description_en, description_ar, quantity, unit_price, amount").eq("quote_id", quote.id).order("position"),
    supabase.from("clients").select("name_en, name_ar, legal_name, tax_number, address, city, country").eq("id", quote.client_id).maybeSingle(),
  ]);

  let buffer: Buffer;
  try {
    buffer = await renderCommercialPdf(quoteDocumentData(quote, items ?? [], client ?? null));
  } catch (error) {
    console.error("[documents] quote render failed", error);
    return jsonError(500, "Could not render the document");
  }

  if (!isDraft) {
    const path = `quotes/${quote.id}.pdf`;
    try {
      await uploadBuffer(BUCKET, path, buffer, "application/pdf");
      if (quote.pdf_path !== path) {
        const admin = createAdminClient();
        const { error } = await admin.from("quotes").update({ pdf_path: path }).eq("id", quote.id);
        if (error) console.error("[documents] could not record quote pdf_path", error.message);
      }
    } catch (error) {
      console.error("[documents] could not store quote PDF", error);
    }
  }

  return pdfResponse(buffer, fileName);
}
