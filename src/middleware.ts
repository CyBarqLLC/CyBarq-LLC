import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, isLocale } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabaseEnv } from "@/lib/env";

const intlMiddleware = createIntlMiddleware(routing);

/** Paths (after the locale segment) that require a signed in user. */
const PROTECTED_PREFIXES = ["/app", "/portal"];

export async function middleware(request: NextRequest) {
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
