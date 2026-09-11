import { ZodError, type ZodIssue } from "zod";
import { getTranslations } from "next-intl/server";
import { AuthorizationError } from "@/lib/auth/session";
import { dbMessageKey } from "./db-errors";

/** Discriminated result returned by every server action. Never leaks internals. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; code?: "FORBIDDEN" | "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "ERROR" };

type FailCode = NonNullable<Extract<ActionResult, { ok: false }>["code"]>;

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** A failure with an already translated message (see actionError). */
export function fail(error: string, code: FailCode = "ERROR"): ActionResult<never> {
  return { ok: false, error, code };
}

type PostgrestLikeError = { code?: string; message?: string; details?: string; hint?: string };
type Translate = (key: string, values?: Record<string, string | number>) => string;

function isPostgrestLike(error: unknown): error is PostgrestLikeError & { code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string";
}

/** Translated, human message for one validation issue. */
function issueMessage(issue: ZodIssue, t: Translate): string {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined" || issue.received === "null") return t("field.required");
      if (issue.expected === "number") return t("field.number");
      if (issue.expected === "date") return t("field.date");
      return t("field.format");
    case "too_small":
      if (issue.type === "string") return Number(issue.minimum) <= 1 ? t("field.required") : t("field.tooShort", { min: Number(issue.minimum) });
      if (issue.type === "array") return t("field.required");
      if (issue.type === "number") return Number(issue.minimum) === 0 && !issue.inclusive ? t("field.positive") : t("field.min", { min: Number(issue.minimum) });
      return t("field.format");
    case "too_big":
      if (issue.type === "string") return t("field.tooLong", { max: Number(issue.maximum) });
      if (issue.type === "number") return t("field.max", { max: Number(issue.maximum) });
      return t("field.format");
    case "invalid_string":
      if (issue.validation === "email") return t("field.email");
      if (issue.validation === "url") return t("field.url");
      if (issue.validation === "uuid") return t("field.choice");
      if (issue.validation === "regex") return t("field.format");
      return t("field.format");
    case "invalid_enum_value":
    case "invalid_literal":
    case "invalid_union":
    case "invalid_union_discriminator":
      return t("field.choice");
    case "invalid_date":
      return t("field.date");
    case "not_finite":
      return t("field.number");
    case "custom":
      // Custom refinements carry an errors.json key as their message when they have one.
      return issue.message && /^[a-zA-Z.]+$/.test(issue.message) ? t(issue.message) : t("field.format");
    default:
      return t("field.format");
  }
}

function fieldErrorsOf(error: ZodError, t: Translate): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    (out[key] ??= []).push(issueMessage(issue, t));
  }
  return out;
}

/** Maps thrown errors to safe, translated results. Logs the original server side. */
export async function toActionError(error: unknown): Promise<ActionResult<never>> {
  const t: Translate = await getTranslations("errors");
  if (error instanceof ZodError) {
    return { ok: false, error: t("checkFields"), fieldErrors: fieldErrorsOf(error, t), code: "VALIDATION" };
  }
  if (error instanceof AuthorizationError) {
    return { ok: false, error: t("forbidden"), code: "FORBIDDEN" };
  }
  if (isPostgrestLike(error)) {
    const pg = error;
    const known = dbMessageKey(pg.message);
    if (known) {
      const code: FailCode = pg.code === "42501" ? "FORBIDDEN" : pg.code === "40001" ? "CONFLICT" : pg.code === "P0002" ? "NOT_FOUND" : "VALIDATION";
      return { ok: false, error: t(known), code };
    }
    if (pg.code === "42501") return { ok: false, error: t("forbidden"), code: "FORBIDDEN" };
    if (pg.code === "40001") return { ok: false, error: t("conflict"), code: "CONFLICT" };
    if (pg.code === "23505") return { ok: false, error: t("duplicate"), code: "CONFLICT" };
    if (pg.code === "23503") return { ok: false, error: t("referenced"), code: "CONFLICT" };
    if (pg.code === "22023" || pg.code === "23514" || pg.code === "22P02" || pg.code === "22007" || pg.code === "22008") {
      console.error("[action] validation", pg.code, pg.message);
      return { ok: false, error: t("invalid"), code: "VALIDATION" };
    }
    if (pg.code === "PGRST116" || pg.code === "P0002") return { ok: false, error: t("notFound"), code: "NOT_FOUND" };
  }
  console.error("[action]", error);
  return { ok: false, error: t("generic"), code: "ERROR" };
}

/** Wraps an action body so every failure becomes a safe ActionResult. */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return toActionError(error);
  }
}
