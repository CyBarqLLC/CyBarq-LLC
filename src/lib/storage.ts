import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PrivateBucket =
  | "private-project-documents"
  | "private-security-reports"
  | "private-hr-documents"
  | "private-finance-documents"
  | "private-certificates";

export type PublicBucket = "public-content" | "public-brand-assets";

const SIGNED_URL_TTL_SECONDS = 120;

/**
 * Creates a short lived download URL for a private object. Callers MUST have
 * already verified, through the user's own RLS scoped client, that the caller
 * may access the owning record. The service role is used only to sign.
 */
export async function signedDownloadUrl(bucket: PrivateBucket, path: string, downloadName?: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS, downloadName ? { download: downloadName } : undefined);
  if (error || !data) throw new Error(`Could not sign ${bucket}/${path}: ${error?.message ?? "unknown"}`);
  return data.signedUrl;
}

/** Signed upload target for a path the caller has been authorised to write. */
export async function signedUploadUrl(bucket: PrivateBucket | PublicBucket, path: string): Promise<{ signedUrl: string; token: string; path: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not create upload URL: ${error?.message ?? "unknown"}`);
  return data;
}

export async function uploadBuffer(bucket: PrivateBucket | PublicBucket, path: string, body: Buffer | Uint8Array, contentType: string) {
  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function downloadBuffer(bucket: PrivateBucket, path: string): Promise<Buffer> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Download failed: ${error?.message ?? "unknown"}`);
  return Buffer.from(await data.arrayBuffer());
}

export function publicUrl(bucket: PublicBucket, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/** Safe object key: strips path tricks and keeps a readable file name. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^\w.\-؀-ۿ]+/g, "-").replace(/^\.+/, "").slice(0, 120) || "file";
}
