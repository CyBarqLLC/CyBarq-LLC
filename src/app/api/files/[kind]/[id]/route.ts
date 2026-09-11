import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signedDownloadUrl, type PrivateBucket } from "@/lib/storage";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Private file access. The owning record is loaded through the caller's RLS
 * scoped client (so visibility rules decide), then a 2 minute signed URL is
 * issued with the service role and the caller is redirected to it.
 *
 * Kinds: project-documents, employee-documents, reports (security), evidence (security findings).
 */
type Kind = "project-documents" | "employee-documents" | "reports" | "evidence";

const KINDS: Record<Kind, { table: "project_documents" | "employee_documents" | "engagement_reports" | "finding_evidence"; bucket: PrivateBucket; nameColumn: "title" | "caption" }> = {
  "project-documents": { table: "project_documents", bucket: "private-project-documents", nameColumn: "title" },
  "employee-documents": { table: "employee_documents", bucket: "private-hr-documents", nameColumn: "title" },
  reports: { table: "engagement_reports", bucket: "private-security-reports", nameColumn: "title" },
  evidence: { table: "finding_evidence", bucket: "private-security-reports", nameColumn: "caption" },
};

function isKind(value: string): value is Kind {
  return value in KINDS;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await context.params;
  if (!isKind(kind) || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const def = KINDS[kind];
  const { data: row } = await supabase.from(def.table).select("id, storage_path").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fileName = row.storage_path.split("/").pop() ?? "file";
  const url = await signedDownloadUrl(def.bucket, row.storage_path, fileName);
  if (kind === "reports" || kind === "evidence" || kind === "employee-documents") {
    await audit("file.accessed", def.table, id, { bucket: def.bucket });
  }
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
