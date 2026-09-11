import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, isLocale } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabaseEnv } from "@/lib/env";
import { MAINTENANCE_PATH, SITE_ACCESS_COOKIE, hasValidAccessToken, isSiteLocked, maintenanceLang } from "@/lib/site-lock";

const intlMiddleware = createIntlMiddleware(routing);

/** Paths (after the locale segment) that require a signed in user. */
const PROTECTED_PREFIXES = ["/app", "/portal"];
/** Paths that read or change the session (the public site never does). */
const SESSION_PREFIXES = [...PROTECTED_PREFIXES, "/login", "/forgot-password", "/reset-password", "/welcome"];

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

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
      // Plain rewrite: Vercel replaces a 503 from middleware with its own "deployment unavailable" page.
      const locked = NextResponse.rewrite(url);
      locked.headers.set("Cache-Control", "no-store");
      locked.headers.set("X-Robots-Tag", "noindex");
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

  const { pathname } = request.nextUrl;
  const [, maybeLocale, ...rest] = pathname.split("/");
  const locale = isLocale(maybeLocale) ? maybeLocale : routing.defaultLocale;
  const innerPath = "/" + rest.join("/");

  // The public website is static and never touches the session: no auth work on those requests.
  if (!matchesPrefix(innerPath, SESSION_PREFIXES)) return response;

  // Refresh the auth session so server components see a valid token.
  // Without Supabase configured, private areas stay closed.
  const { userId } = hasSupabaseEnv() ? await updateSession(request, response) : { userId: null };

  if (matchesPrefix(innerPath, PROTECTED_PREFIXES) && !userId) {
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
