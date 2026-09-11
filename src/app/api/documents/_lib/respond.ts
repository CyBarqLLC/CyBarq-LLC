import "server-only";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function jsonError(status: 401 | 404 | 500, message: string): Response {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

/** Streams a PDF inline with a safe file name. Never cached. */
export function pdfResponse(buffer: Buffer, fileName: string): Response {
  const safe = fileName.replace(/[^\w.\-]+/g, "-").replace(/^-+|-+$/g, "") || "document";
  const body = new Uint8Array(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safe}.pdf"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
