/**
 * The platform's reference scheme: CyB-<KIND>-<six digits>, for example
 * CyB-INV-000050.
 *
 * Every record a person may need to quote back to us carries one, in the same
 * shape, from an invoice to an enquiry sent through the website. The series is
 * continuous per kind rather than per year, so a reference identifies one
 * record for good.
 *
 * The database assigns them (private.next_reference in migration 0019) and
 * this list mirrors the one held there; a test keeps the two from drifting.
 * Nothing here generates a reference — that would invite two sources of truth.
 */

/** Three letters per kind. The keys are the kinds the database knows. */
export const REFERENCE_CODES = {
  invoice: "INV",
  quote: "QTE",
  payment: "PAY",
  certificate: "CRT",
  project: "PRJ",
  engagement: "SEC",
  report: "RPT",
  client: "CLT",
  employee: "EMP",
  task: "TSK",
  support: "SUP",
  enquiry: "MSG",
} as const;

export type ReferenceKind = keyof typeof REFERENCE_CODES;

export const REFERENCE_PREFIX = "CyB";

/** A complete reference, anchored. Six digits is the written width, not a ceiling. */
export const REFERENCE_PATTERN = /^CyB-[A-Z]{3}-\d{6,}$/;

/** The same shape, for finding a reference inside a sentence (a support email, a payment note). */
export const REFERENCE_SEARCH = /\bCyB-[A-Z]{3}-\d{6,}\b/g;

/** How a reference reads once assigned. Used for examples and tests, never to assign one. */
export function formatReference(kind: ReferenceKind, value: number): string {
  return `${REFERENCE_PREFIX}-${REFERENCE_CODES[kind]}-${String(value).padStart(6, "0")}`;
}

export function isReference(value: string | null | undefined): boolean {
  return typeof value === "string" && REFERENCE_PATTERN.test(value.trim());
}

/** The kind a reference belongs to, or null for anything that is not one of ours. */
export function referenceKind(value: string | null | undefined): ReferenceKind | null {
  if (!isReference(value)) return null;
  const code = value!.trim().slice(4, 7);
  const found = Object.entries(REFERENCE_CODES).find(([, c]) => c === code);
  return found ? (found[0] as ReferenceKind) : null;
}

/** Every reference mentioned in a piece of text, in order and without repeats. */
export function findReferences(text: string | null | undefined): string[] {
  if (!text) return [];
  return [...new Set(text.match(REFERENCE_SEARCH) ?? [])];
}
