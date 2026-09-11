import "server-only";
import { NextResponse, type NextRequest } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function preferredLocale(request: NextRequest): "en" | "ar" {
  const fromReferer = request.headers.get("referer")?.match(/\/(en|ar)(\/|$)/)?.[1];
  if (fromReferer === "ar" || fromReferer === "en") return fromReferer;
  return /^ar\b/i.test(request.headers.get("accept-language") ?? "") ? "ar" : "en";
}

const COPY = {
  404: {
    en: { title: "Document not available", body: "This document doesn't exist or you don't have access to it." },
    ar: { title: "المستند غير متاح", body: "هذا المستند غير موجود أو لا تملك صلاحية الوصول إليه." },
  },
  500: {
    en: { title: "We couldn't prepare this document", body: "Please try again in a moment. If it keeps happening, contact CyBarq." },
    ar: { title: "تعذّر تجهيز المستند", body: "حاول مجدداً بعد قليل، وإن تكررت المشكلة فتواصل مع سايبرق." },
  },
} as const;

/**
 * Error answer for document and file links opened in a browser: signed-out
 * visitors are sent to sign in and come back; other failures get a short,
 * translated page instead of raw JSON.
 */
export function documentError(request: NextRequest, status: 401 | 404 | 500): Response {
  const locale = preferredLocale(request);
  if (status === 401) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set("next", `/${locale}/app`);
    return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
  }
  const c = COPY[status][locale];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${c.title}</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f4f5f6;color:#0d0e13;font-family:-apple-system,"Segoe UI",Tahoma,Arial,sans-serif}main{max-width:28rem;padding:2rem;background:#fff;border:1px solid #e6e8ea}h1{font-size:1.25rem;margin:0 0 .5rem}p{margin:0 0 1.25rem;color:#5a616b;line-height:1.6}a{color:#0d0e13}</style></head>
<body><main><h1>${c.title}</h1><p>${c.body}</p><a href="/${locale}">${locale === "ar" ? "العودة إلى سايبرق" : "Back to CyBarq"}</a></main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}

/** Streams a PDF inline with a safe file name. Never cached by shared caches. */
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
