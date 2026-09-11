/**
 * Business time for CyBarq.
 *
 * - Instants (created_at, issued_at, ...) are stored in UTC and shown in the
 *   business time zone, whatever the time zone of the server or the browser.
 * - Calendar dates (due dates, issue dates, start and end dates) are plain
 *   `YYYY-MM-DD` values. They are never converted between time zones.
 * - "Today" for business rules is the calendar date in Amman.
 *
 * Safe to import from server and client code.
 */
export const BUSINESS_TIME_ZONE = "Asia/Amman";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: unknown): value is string {
  return typeof value === "string" && DATE_ONLY.test(value);
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedParts(instant: Date): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(instant)) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out;
}

/** Today's calendar date in Amman as YYYY-MM-DD. */
export function businessToday(now: Date = new Date()): string {
  const p = zonedParts(now);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Adds whole days to a calendar date (YYYY-MM-DD), without time zone effects. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Offset of the business time zone from UTC at a given instant, in minutes. */
function businessOffsetMinutes(instant: Date): number {
  const p = zonedParts(instant);
  const asUtc = Date.UTC(p.year ?? 1970, (p.month ?? 1) - 1, p.day ?? 1, p.hour ?? 0, p.minute ?? 0, p.second ?? 0);
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/**
 * The UTC instant at which a business calendar day starts (00:00 in Amman).
 * Used for "from/to date" filters on timestamp columns.
 */
export function businessDayStart(date: string): string {
  const guess = new Date(`${date}T00:00:00Z`);
  const offset = businessOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60_000).toISOString();
}

/** Converts a `datetime-local` value typed in Amman time into a UTC ISO string. */
export function businessLocalToUtc(local: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!m) return null;
  const guess = new Date(`${m[1]}T${m[2]}:${m[3]}:00Z`);
  const offset = businessOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60_000).toISOString();
}

/** Formats a UTC instant as a `datetime-local` value in Amman time. */
export function utcToBusinessLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = zonedParts(d);
  const pad = (n: number | undefined) => String(n ?? 0).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Calendar date (in Amman) of a UTC instant. */
export function businessDateOf(iso: string | Date): string {
  return businessToday(typeof iso === "string" ? new Date(iso) : iso);
}
