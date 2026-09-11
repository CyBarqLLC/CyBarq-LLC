import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadBuffer, uploadBuffer, type PrivateBucket } from "@/lib/storage";

type Table = "invoices" | "quotes" | "certificates";

/**
 * Issued documents are rendered once and kept, so every later download is the
 * same file. Drafts are always rendered live and never stored.
 * The caller must already have authorised access to the record.
 */
export async function storedOrRendered(opts: {
  bucket: PrivateBucket;
  table: Table;
  id: string;
  isDraft: boolean;
  pdfPath: string | null;
  storePath: string;
  render: () => Promise<Buffer>;
}): Promise<{ buffer: Buffer; source: "stored" | "rendered" | "draft" }> {
  if (!opts.isDraft && opts.pdfPath) {
    try {
      return { buffer: await downloadBuffer(opts.bucket, opts.pdfPath), source: "stored" };
    } catch (error) {
      console.error("[documents] stored copy unavailable, rendering", opts.table, error instanceof Error ? error.message : error);
    }
  }
  const buffer = await opts.render();
  if (opts.isDraft) return { buffer, source: "draft" };
  try {
    await uploadBuffer(opts.bucket, opts.storePath, buffer, "application/pdf");
    if (opts.pdfPath !== opts.storePath) {
      const { error } = await createAdminClient().from(opts.table).update({ pdf_path: opts.storePath }).eq("id", opts.id);
      if (error) console.error("[documents] could not record pdf_path", opts.table, error.message);
    }
  } catch (error) {
    console.error("[documents] could not store PDF", opts.table, error instanceof Error ? error.message : error);
  }
  return { buffer, source: "rendered" };
}
