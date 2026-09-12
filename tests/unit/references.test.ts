import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REFERENCE_CODES, REFERENCE_PATTERN, findReferences, formatReference, isReference, referenceKind, type ReferenceKind } from "@/lib/references";

/* Vitest runs from the repository root. */
const ROOT = process.cwd();
const MIGRATION = path.join(ROOT, "supabase/migrations/20260912000800_reference_numbers.sql");

describe("reference scheme", () => {
  it("writes references as CyB-<KIND>-<six digits>", () => {
    expect(formatReference("invoice", 50)).toBe("CyB-INV-000050");
    expect(formatReference("client", 1)).toBe("CyB-CLT-000001");
    /* Six digits is a width, not a ceiling: the series keeps counting past it. */
    expect(formatReference("task", 1234567)).toBe("CyB-TSK-1234567");
  });

  it("recognises its own references and nothing else", () => {
    expect(isReference("CyB-INV-000050")).toBe(true);
    expect(isReference("  CyB-QTE-000001  ")).toBe(true);
    expect(isReference("INV-2026-0001")).toBe(false);
    expect(isReference("cyb-inv-000050")).toBe(false);
    expect(isReference("CyB-INV-0050")).toBe(false);
    expect(isReference(null)).toBe(false);
  });

  it("reads the kind back out of a reference", () => {
    expect(referenceKind("CyB-INV-000050")).toBe("invoice");
    expect(referenceKind("CyB-SEC-000004")).toBe("engagement");
    expect(referenceKind("CyB-ZZZ-000001")).toBeNull();
    expect(referenceKind("not a reference")).toBeNull();
  });

  it("finds the references quoted in a message, once each", () => {
    expect(findReferences("Paid CyB-INV-000050 and CyB-INV-000051; see CyB-INV-000050 again.")).toEqual(["CyB-INV-000050", "CyB-INV-000051"]);
    expect(findReferences(null)).toEqual([]);
  });

  it("uses three distinct letters for every kind", () => {
    const codes = Object.values(REFERENCE_CODES);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) expect(code).toMatch(/^[A-Z]{3}$/);
    for (const kind of Object.keys(REFERENCE_CODES) as ReferenceKind[]) {
      expect(formatReference(kind, 1)).toMatch(REFERENCE_PATTERN);
    }
  });

  /* The database assigns references; this file only reads them. If the two
     lists ever drift, a record would be filed under a code the platform does
     not recognise. */
  it("mirrors the kinds and codes the database uses", () => {
    const sql = readFileSync(MIGRATION, "utf8");
    const body = sql.slice(sql.indexOf("function private.reference_code"), sql.indexOf("function private.next_reference"));
    const fromSql = Object.fromEntries([...body.matchAll(/when '([a-z]+)' then '([A-Z]{3})'/g)].map((m) => [m[1], m[2]]));
    expect(fromSql).toEqual(REFERENCE_CODES);
  });
});
