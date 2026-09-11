import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  CURRENCY_LABELS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  auditActionLabel,
  auditEntityHref,
  currencyOption,
  humanizeKey,
  isAuditAction,
  label,
  labelOf,
  roleLabel,
} from "@/lib/labels";
import { PERMISSIONS, ROLE_KEYS } from "@/lib/auth/permissions";
import { CURRENCIES } from "@/lib/validation/finance";

const ROOT = path.resolve(__dirname, "../..");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|sql)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Every audit action key written by a migration trigger or by `audit("...")` in the application. */
function auditActionsInCode(): string[] {
  const keys = new Set<string>();
  for (const file of walk(path.join(ROOT, "supabase/migrations"))) {
    const sql = readFileSync(file, "utf8");
    for (const m of sql.matchAll(/log_audit\(\s*'([a-z_]+\.[a-z_]+)'/g)) keys.add(m[1] ?? "");
    for (const m of sql.matchAll(/(?:when|then|else)\s+'([a-z_]+\.[a-z_]+)'/g)) keys.add(m[1] ?? "");
  }
  for (const dir of ["src/lib/actions", "src/app/api"]) {
    for (const file of walk(path.join(ROOT, dir))) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/audit\(\s*"([a-z_]+\.[a-z_]+)"/g)) keys.add(m[1] ?? "");
      for (const m of src.matchAll(/audit\(\s*[a-zA-Z_.]+\s*\?\s*"([a-z_]+\.[a-z_]+)"\s*:\s*"([a-z_]+\.[a-z_]+)"/g)) {
        keys.add(m[1] ?? "");
        keys.add(m[2] ?? "");
      }
    }
  }
  keys.delete("");
  return [...keys].sort();
}

const LOCALES = ["en", "ar"] as const;

function expectComplete(map: Record<string, { en: string; ar: string }>) {
  for (const [key, value] of Object.entries(map)) {
    for (const locale of LOCALES) {
      expect(value[locale], `${key}.${locale}`).toBeTruthy();
      expect(value[locale], `${key}.${locale}`).not.toMatch(/[_.]{1}[a-z]/);
    }
  }
}

describe("labels", () => {
  it("covers every audit action used by migrations and the application", () => {
    const missing = auditActionsInCode().filter((k) => !isAuditAction(k));
    expect(missing).toEqual([]);
  });

  it("covers every role and permission in the seed", () => {
    for (const role of ROLE_KEYS) {
      expect(ROLE_LABELS[role].en).toBeTruthy();
      expect(ROLE_DESCRIPTIONS[role].ar).toBeTruthy();
    }
    for (const permission of PERMISSIONS) {
      expect(PERMISSION_LABELS[permission].ar).toBeTruthy();
      expect(PERMISSION_DESCRIPTIONS[permission].en).toBeTruthy();
    }
  });

  it("names every allowed currency", () => {
    for (const code of CURRENCIES) {
      expect(CURRENCY_LABELS[code].en).toBeTruthy();
      expect(currencyOption(code, "ar")).toContain(code);
    }
    expect(currencyOption("XXX", "en")).toBe("XXX");
  });

  it("has no raw keys inside labels", () => {
    expectComplete(AUDIT_ACTION_LABELS);
    expectComplete(AUDIT_ENTITY_LABELS);
    expectComplete(ROLE_LABELS);
    expectComplete(PERMISSION_LABELS);
  });

  it("humanises unknown keys instead of showing them raw", () => {
    expect(humanizeKey("invoice.status_changed")).toBe("Invoice status changed");
    expect(humanizeKey("client_user")).toBe("Client user");
    expect(humanizeKey("")).toBe("");
    expect(auditActionLabel("widget.frobnicated", "en")).toBe("Widget frobnicated");
    expect(auditActionLabel("invoice.issued", "ar")).toBe("تم إصدار الفاتورة");
    expect(roleLabel("not_a_role", "en")).toBe("Not a role");
    expect(labelOf({ a: { en: "A", ar: "أ" } }, "b_c", "ar")).toBe("B c");
    expect(label({ open: { en: "Open", ar: "مفتوح" } }, "open", "ar")).toBe("مفتوح");
  });

  it("links audited entities to their pages when the id is a uuid", () => {
    const id = "11111111-2222-3333-4444-555555555555";
    expect(auditEntityHref("invoice", id)).toBe(`/app/finance/invoices/${id}`);
    expect(auditEntityHref("finding", id, { engagementId: id })).toBe(`/app/security/${id}/findings/${id}`);
    expect(auditEntityHref("finding", id)).toBeNull();
    expect(auditEntityHref("role", "admin")).toBe("/app/users/roles");
    expect(auditEntityHref("invoice", "not-a-uuid")).toBeNull();
    expect(auditEntityHref("employee_document", id)).toBeNull();
    expect(auditEntityHref("employee_document", id, { employeeUserId: id })).toBe(`/app/employees/${id}`);
    expect(auditEntityHref("project_documents", id, { projectId: id })).toBe(`/app/projects/${id}/documents`);
    expect(auditEntityHref("engagement_reports", id, { engagementId: id })).toBe(`/app/security/${id}`);
  });
});
