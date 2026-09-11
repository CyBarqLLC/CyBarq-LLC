import { ZodError } from "zod";
import { AuthorizationError } from "@/lib/auth/session";

/** Discriminated result returned by every server action. Never leaks internals. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; code?: "FORBIDDEN" | "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "ERROR" };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, code: NonNullable<Extract<ActionResult, { ok: false }>["code"]> = "ERROR"): ActionResult<never> {
  return { ok: false, error, code };
}

type PostgrestLikeError = { code?: string; message?: string; details?: string };

/** Maps thrown errors to safe, user facing results. Logs the original server side. */
export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Some fields need attention.", fieldErrors: error.flatten().fieldErrors as Record<string, string[]>, code: "VALIDATION" };
  }
  if (error instanceof AuthorizationError) {
    return { ok: false, error: error.message, code: "FORBIDDEN" };
  }
  const pg = error as PostgrestLikeError;
  if (pg && typeof pg === "object" && typeof pg.code === "string") {
    if (pg.code === "42501") return { ok: false, error: "You do not have permission to do this.", code: "FORBIDDEN" };
    if (pg.code === "40001") return { ok: false, error: "This record changed while you were editing it. Reload and try again.", code: "CONFLICT" };
    if (pg.code === "23505") return { ok: false, error: "A record with the same identifier already exists.", code: "CONFLICT" };
    if (pg.code === "23503") return { ok: false, error: "This record is referenced by other data and cannot be changed this way.", code: "CONFLICT" };
    if (pg.code === "22023" || pg.code === "23514") return { ok: false, error: pg.message ?? "Invalid data.", code: "VALIDATION" };
    if (pg.code === "PGRST116") return { ok: false, error: "Not found.", code: "NOT_FOUND" };
  }
  console.error("[action]", error);
  return { ok: false, error: "Something went wrong. Please try again.", code: "ERROR" };
}

/** Wraps an action body so every failure becomes a safe ActionResult. */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return toActionError(error);
  }
}
