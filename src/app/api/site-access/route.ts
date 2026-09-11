import { NextResponse, type NextRequest } from "next/server";
import { SITE_ACCESS_COOKIE, SITE_ACCESS_TTL_SECONDS, issueAccessToken, isSiteLocked, maintenanceLang, safeNextPath, verifyLockPassword, MAINTENANCE_PATH } from "@/lib/site-lock";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PASSWORD_LENGTH = 200;

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0]?.trim() : request.headers.get("x-real-ip")) || "unknown";
}

async function readInput(request: NextRequest): Promise<{ password: string; next: string; wantsJson: boolean }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { password?: unknown; next?: unknown };
    return {
      password: typeof body.password === "string" ? body.password.slice(0, MAX_PASSWORD_LENGTH) : "",
      next: typeof body.next === "string" ? body.next : "/",
      wantsJson: true,
    };
  }
  const form = await request.formData().catch(() => null);
  const password = form?.get("password");
  const next = form?.get("next");
  return {
    password: typeof password === "string" ? password.slice(0, MAX_PASSWORD_LENGTH) : "",
    next: typeof next === "string" ? next : "/",
    wantsJson: false,
  };
}

/**
 * POST /api/site-access
 * Validates the development team password on the server and, when correct,
 * sets an httpOnly session cookie that the middleware accepts. Accepts JSON
 * (the enhanced form) or a regular form post (works without JavaScript).
 */
export async function POST(request: NextRequest) {
  const { password, next, wantsJson } = await readInput(request);
  const destination = safeNextPath(next);
  const lang = maintenanceLang(destination, request.headers.get("accept-language"));

  const fail = (status: 401 | 429, code: "invalid" | "rate_limited") => {
    if (wantsJson) return NextResponse.json({ ok: false, error: code }, { status, headers: { "Cache-Control": "no-store" } });
    const url = new URL(`${MAINTENANCE_PATH}/${lang}`, request.url);
    url.searchParams.set("next", destination);
    url.searchParams.set("error", code);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!isSiteLocked()) {
    return wantsJson ? NextResponse.json({ ok: true, next: destination }) : NextResponse.redirect(new URL(destination, request.url), { status: 303 });
  }

  if (!rateLimit({ key: `site-access:${clientIp(request)}`, limit: 8, windowMs: 10 * 60 * 1000 }).allowed) {
    return fail(429, "rate_limited");
  }

  const valid = await verifyLockPassword(password);
  const token = valid ? await issueAccessToken() : null;
  if (!valid || !token) return fail(401, "invalid");

  const response = wantsJson
    ? NextResponse.json({ ok: true, next: destination }, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.redirect(new URL(destination, request.url), { status: 303 });
  // Access lasts 4 hours: the cookie expires then, and the signed expiry inside it is enforced by the middleware.
  response.cookies.set(SITE_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_ACCESS_TTL_SECONDS,
  });
  return response;
}

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
