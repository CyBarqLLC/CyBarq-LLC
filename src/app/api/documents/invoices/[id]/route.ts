import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadBuffer, uploadBuffer } from "@/lib/storage";
import { audit } from "@/lib/audit";
import { invoiceDocumentData } from "@/lib/pdf/documents";
import { renderCommercialPdf } from "@/lib/pdf/render";
import { isUuid, jsonError, pdfResponse } from "../../_lib/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "private-finance-documents";

/**
 * GET /api/documents/invoices/[id]
 * The invoice is loaded through the caller's RLS scoped client, so finance
 * staff and the client organisation (issued documents only) can reach it.
 * Issued invoices are rendered once and stored; drafts render on the fly.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(404, "Not found");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "Unauthorized");

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) return jsonError(404, "Not found");

  const isDraft = invoice.status === "draft";
  const fileName = invoice.number ?? `draft-invoice-${invoice.id.slice(0, 8)}`;

  if (!isDraft && invoice.pdf_path) {
    try {
      const stored = await downloadBuffer(BUCKET, invoice.pdf_path);
      await audit("document.downloaded", "invoice", invoice.id, { number: invoice.number, source: "stored" }, invoice.client_id);
      return pdfResponse(stored, fileName);
    } catch (error) {
      console.error("[documents] stored invoice unavailable, rendering", error);
    }
  }

  const [{ data: items }, { data: client }, { data: replaced }, { data: quote }] = await Promise.all([
    supabase.from("invoice_items").select("description_en, description_ar, quantity, unit_price, amount").eq("invoice_id", invoice.id).order("position"),
    supabase.from("clients").select("name_en, name_ar, legal_name, tax_number, address, city, country").eq("id", invoice.client_id).maybeSingle(),
    invoice.replaces_invoice_id
      ? supabase.from("invoices").select("number").eq("id", invoice.replaces_invoice_id).maybeSingle()
      : Promise.resolve({ data: null }),
    invoice.quote_id ? supabase.from("quotes").select("number").eq("id", invoice.quote_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const data = invoiceDocumentData(invoice, items ?? [], client ?? null, { replacesNumber: replaced?.number ?? null, quoteNumber: quote?.number ?? null });

  let buffer: Buffer;
  try {
    buffer = await renderCommercialPdf(data);
  } catch (error) {
    console.error("[documents] invoice render failed", error);
    return jsonError(500, "Could not render the document");
  }

  if (!isDraft) {
    // The RLS scoped read above succeeded, so storing with the service role is safe.
    const path = `invoices/${invoice.id}.pdf`;
    try {
      await uploadBuffer(BUCKET, path, buffer, "application/pdf");
      if (invoice.pdf_path !== path) {
        const admin = createAdminClient();
        const { error } = await admin.from("invoices").update({ pdf_path: path }).eq("id", invoice.id);
        if (error) console.error("[documents] could not record invoice pdf_path", error.message);
      }
    } catch (error) {
      console.error("[documents] could not store invoice PDF", error);
    }
  }

  await audit("document.downloaded", "invoice", invoice.id, { number: invoice.number, source: isDraft ? "draft" : "rendered" }, invoice.client_id);
  return pdfResponse(buffer, fileName);
}
