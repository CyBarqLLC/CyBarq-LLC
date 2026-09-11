import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

/**
 * Exchanges an auth code (PKCE links started from this site) for a session.
 * Invitations and password resets use the token pages (/welcome and
 * /reset-password) instead; this route stays for links already in inboxes.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), { fallback: "/en/app" });
  const locale = next.split("/")[1] === "ar" ? "ar" : "en";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/${locale}/login?error=link`);
}
