import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PERMISSIONS, ROLE_KEYS, hasPermission, hasAnyPermission, isPermission, type Permission } from "@/lib/auth/permissions";

/**
 * Permission matrix test. Parses the seed migration so the test fails when the
 * database matrix drifts from the security intent documented here.
 */
function seedMatrix(): Record<string, Set<string>> {
  const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/20260911001100_seed_reference.sql"), "utf8");
  const permissions = [...sql.matchAll(/\('([a-z_.]+)', '[^']*'\)/g)].map((m) => m[1]).filter((k): k is string => !!k && k.includes("."));
  const matrix: Record<string, Set<string>> = {};
  for (const role of ROLE_KEYS) matrix[role] = new Set();
  matrix.super_admin = new Set(permissions);
  const blocks = sql.split("union all");
  for (const block of blocks) {
    const role = block.match(/select '([a-z_]+)', p\.key/)?.[1];
    if (!role) continue;
    const list = block.match(/p\.key in \(([\s\S]*?)\)/)?.[1] ?? "";
    for (const m of list.matchAll(/'([a-z_.]+)'/g)) matrix[role]?.add(m[1] as string);
  }
  return matrix;
}

describe("permission keys", () => {
  it("match the keys seeded in the database", () => {
    const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/20260911001100_seed_reference.sql"), "utf8");
    for (const key of PERMISSIONS) expect(sql, `seed is missing ${key}`).toContain(`('${key}',`);
    const seeded = [...sql.matchAll(/\('([a-z_]+\.[a-z_]+)', '/g)].map((m) => m[1]);
    for (const key of seeded) expect(isPermission(key as string), `code is missing ${key}`).toBe(true);
  });
});

describe("role matrix (deny by default)", () => {
  const matrix = seedMatrix();
  const has = (role: string, p: Permission) => matrix[role]?.has(p) ?? false;

  it("gives developer, employee and client no global permissions", () => {
    expect(matrix.developer?.size).toBe(0);
    expect(matrix.employee?.size).toBe(0);
    expect(matrix.client?.size).toBe(0);
  });
  it("keeps finance data away from non finance roles", () => {
    for (const role of ["hr", "project_manager", "security_team", "content_editor", "developer", "employee"]) {
      expect(has(role, "finance.read"), role).toBe(false);
      expect(has(role, "finance.write"), role).toBe(false);
      expect(has(role, "finance.issue"), role).toBe(false);
    }
    expect(has("finance", "finance.issue")).toBe(true);
    expect(has("admin", "finance.read")).toBe(true);
    expect(has("admin", "finance.issue")).toBe(false);
  });
  it("keeps HR data away from non HR roles", () => {
    for (const role of ["finance", "project_manager", "security_team", "content_editor", "developer", "employee"]) {
      expect(has(role, "hr.read"), role).toBe(false);
      expect(has(role, "hr.write"), role).toBe(false);
    }
    expect(has("hr", "hr.write")).toBe(true);
    expect(has("admin", "hr.write")).toBe(false);
  });
  it("does not give security findings to project or admin roles by default", () => {
    for (const role of ["admin", "project_manager", "developer", "finance", "hr", "content_editor", "employee"]) {
      expect(has(role, "security.read_all"), role).toBe(false);
      expect(has(role, "security.write"), role).toBe(false);
    }
    expect(has("security_team", "security.write")).toBe(true);
    expect(has("security_team", "security.read_all")).toBe(false);
  });
  it("separates writing from publishing content", () => {
    expect(has("content_editor", "content.write")).toBe(true);
    expect(has("content_editor", "content.publish")).toBe(false);
    expect(has("admin", "content.publish")).toBe(true);
  });
  it("limits certificate issuance to HR and admins", () => {
    expect(has("hr", "certificates.issue")).toBe(true);
    expect(has("admin", "certificates.issue")).toBe(true);
    for (const role of ["finance", "project_manager", "security_team", "content_editor"]) expect(has(role, "certificates.issue"), role).toBe(false);
  });
  it("gives super admin everything", () => {
    for (const p of PERMISSIONS) expect(has("super_admin", p)).toBe(true);
  });
});

describe("helpers", () => {
  it("hasPermission works with sets and arrays", () => {
    expect(hasPermission(new Set(["finance.read"]), "finance.read")).toBe(true);
    expect(hasPermission(["finance.read"], "finance.write")).toBe(false);
    expect(hasAnyPermission(new Set(["content.read"]), ["content.publish", "content.read"])).toBe(true);
  });
});
