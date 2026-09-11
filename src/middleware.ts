import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, isLocale } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabaseEnv } from "@/lib/env";
import { MAINTENANCE_PATH, SITE_ACCESS_COOKIE, hasValidAccessToken, isSiteLocked, maintenanceLang } from "@/lib/site-lock";

const intlMiddleware = createIntlMiddleware(routing);

/** Paths (after the locale segment) that require a signed in user. */
const PROTECTED_PREFIXES = ["/app", "/portal"];

export async function middleware(request: NextRequest) {
  const { pathname: requestPath } = request.nextUrl;
  const isMaintenanceRoute = requestPath === MAINTENANCE_PATH || requestPath.startsWith(`${MAINTENANCE_PATH}/`);

  // Maintenance lock: runs before anything else so no page renders while locked.
  if (isSiteLocked()) {
    const unlocked = await hasValidAccessToken(request.cookies.get(SITE_ACCESS_COOKIE)?.value);
    if (!unlocked) {
      if (isMaintenanceRoute) return NextResponse.next();
      const url = request.nextUrl.clone();
      url.pathname = `${MAINTENANCE_PATH}/${maintenanceLang(requestPath, request.headers.get("accept-language"))}`;
      url.search = `?next=${encodeURIComponent(requestPath + request.nextUrl.search)}`;
      // 503 + Retry-After tells crawlers the outage is temporary, so rankings and the index are kept.
      const locked = NextResponse.rewrite(url, { status: 503 });
      locked.headers.set("Retry-After", "3600");
      locked.headers.set("Cache-Control", "no-store");
      return locked;
    }
  }
  // The maintenance screen is never reachable directly when the site is open (or already unlocked).
  if (isMaintenanceRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const response = intlMiddleware(request);

  // Refresh the auth session on every page request so server components see a valid user.
  // Without Supabase configured, the public site still renders and private areas stay closed.
  const { user } = hasSupabaseEnv() ? await updateSession(request, response) : { user: null };

  const { pathname } = request.nextUrl;
  const [, maybeLocale, ...rest] = pathname.split("/");
  const locale = isLocale(maybeLocale) ? maybeLocale : routing.defaultLocale;
  const innerPath = "/" + rest.join("/");

  const isProtected = PROTECTED_PREFIXES.some((p) => innerPath === p || innerPath.startsWith(p + "/"));
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    const redirect = NextResponse.redirect(url);
    // Carry refreshed cookies on the redirect as well.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  // Skip static files, images, fonts, API routes and Next internals.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
