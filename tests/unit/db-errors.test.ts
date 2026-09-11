import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { dbMessageKey } from "@/lib/actions/db-errors";
import en from "../../messages/en/errors.json";
import ar from "../../messages/ar/errors.json";

const MIGRATIONS = path.resolve(__dirname, "../../supabase/migrations");

function raisedMessages(): string[] {
  const out = new Set<string>();
  for (const file of readdirSync(MIGRATIONS)) {
    const sql = readFileSync(path.join(MIGRATIONS, file), "utf8");
    for (const m of sql.matchAll(/raise exception '((?:[^']|'')*)'/g)) {
      const text = (m[1] ?? "").replace(/''/g, "'");
      if (text.startsWith("FAIL") || text.includes("audit triggers produced")) continue;
      out.add(text.replace(/^%/, "the assignee"));
    }
  }
  return [...out];
}

describe("database error messages", () => {
  it("every message raised by a migration has a translated key", () => {
    const missing = raisedMessages().filter((m) => dbMessageKey(m) === null);
    expect(missing).toEqual([]);
  });
  it("every mapped key exists in both languages", () => {
    const keys = raisedMessages().map((m) => dbMessageKey(m)).filter((k): k is string => k !== null);
    for (const key of keys) {
      expect(en).toHaveProperty(key);
      expect(ar).toHaveProperty(key);
    }
  });
  it("both languages have the same error keys", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(ar.field).sort()).toEqual(Object.keys(en.field).sort());
  });
});
