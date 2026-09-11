import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled jobs, called by Vercel Cron every 10 minutes (see vercel.json) with
 * `Authorization: Bearer <CRON_SECRET>`: publishes scheduled news and articles,
 * marks overdue invoices and expired quotes, and trims the rate limiter.
 * Safe to run more than once: every step only touches rows that are due.
 */
export async function GET(request: NextRequest) {
  const secret = serverEnv().CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await createAdminClient().rpc("run_scheduled_jobs");
  if (error) {
    console.error("[cron] scheduled jobs failed", error.message);
    return NextResponse.json({ error: "Scheduled jobs failed" }, { status: 500 });
  }
  const result = typeof data === "object" && data !== null && !Array.isArray(data) ? data : {};
  if ("published" in result && Number(result.published) > 0) {
    // New public content: refresh the cached public pages and the sitemap.
    revalidatePath("/[locale]", "layout");
    revalidatePath("/sitemap.xml");
  }
  return NextResponse.json(result);
}
