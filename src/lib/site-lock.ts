/**
 * Maintenance lock ("Under Maintenance" screen).
 *
 * SITE_LOCKED=true shows the maintenance screen on every page. Developers
 * unlock the site for their browser session with SITE_LOCK_PASSWORD, which is
 * only ever read on the server (middleware and the /api/site-access route).
 *
 * Access lasts 4 hours. The cookie holds `<expiry>.<hmac>` where the HMAC of
 * the expiry is keyed by the password: it reveals nothing about the password,
 * cannot be forged or extended without it, expires on its own, and every
 * token is invalidated when the password changes. Web Crypto only, so the same
 * code runs in the Edge middleware and in Node route handlers.
 */
export const SITE_ACCESS_COOKIE = "cybarq_site_access";
export const MAINTENANCE_PATH = "/maintenance";
export const SITE_ACCESS_TTL_SECONDS = 4 * 60 * 60;
const TOKEN_LABEL = "cybarq-site-access-v2";

export function isSiteLocked(): boolean {
  return (process.env.SITE_LOCKED ?? "").trim().toLowerCase() === "true";
}

function lockPassword(): string | null {
  const value = process.env.SITE_LOCK_PASSWORD;
  return value && value.length > 0 ? value : null;
}

const encoder = new TextEncoder();

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length independent comparison of two strings. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** Issues a signed access token valid for SITE_ACCESS_TTL_SECONDS, or null when no password is configured. */
export async function issueAccessToken(nowMs: number = Date.now()): Promise<string | null> {
  const password = lockPassword();
  if (!password) return null;
  const expiresAt = Math.floor(nowMs / 1000) + SITE_ACCESS_TTL_SECONDS;
  return `${expiresAt}.${await hmacHex(password, `${TOKEN_LABEL}:${expiresAt}`)}`;
}

/** True when the cookie carries an unexpired token signed with the current password. */
export async function hasValidAccessToken(cookieValue: string | undefined, nowMs: number = Date.now()): Promise<boolean> {
  const password = lockPassword();
  if (!cookieValue || !password) return false;
  const match = /^(\d{10})\.([0-9a-f]{64})$/.exec(cookieValue);
  if (!match) return false;
  const expiresAt = Number(match[1]);
  const now = Math.floor(nowMs / 1000);
  if (expiresAt <= now || expiresAt > now + SITE_ACCESS_TTL_SECONDS) return false;
  const expected = await hmacHex(password, `${TOKEN_LABEL}:${expiresAt}`);
  return safeEqual(match[2] ?? "", expected);
}

/**
 * Server side password check. Both sides are hashed with a per-process random
 * key first so the comparison is constant time regardless of input length.
 */
export async function verifyLockPassword(candidate: string): Promise<boolean> {
  const password = lockPassword();
  if (!password || !candidate) return false;
  const nonce = crypto.randomUUID();
  const [a, b] = await Promise.all([hmacHex(nonce, candidate), hmacHex(nonce, password)]);
  return safeEqual(a, b);
}

/** Only same site relative paths are allowed as the post unlock destination. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith(MAINTENANCE_PATH)) return "/";
  return value;
}

export type MaintenanceLang = "en" | "ar";

/** Maintenance language: the URL's locale prefix first, then the browser preference. */
export function maintenanceLang(pathname: string, acceptLanguage: string | null): MaintenanceLang {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return (acceptLanguage ?? "").trim().toLowerCase().startsWith("ar") ? "ar" : "en";
}
