import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/safe-redirect";

const opts = { fallback: "/en/app", areas: ["app"] };

describe("safeInternalPath", () => {
  it("keeps same-site paths inside the allowed area", () => {
    expect(safeInternalPath("/en/app/projects?tab=tasks", opts)).toBe("/en/app/projects?tab=tasks");
    expect(safeInternalPath("/ar/app", opts)).toBe("/ar/app");
  });
  it("rejects every way out of the site", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "/%09/evil.com", "/\t/evil.com", "https://evil.com", "javascript:alert(1)", "/en/../../evil", "", "app"]) {
      expect(safeInternalPath(bad, opts)).toBe("/en/app");
    }
  });
  it("rejects unknown locales and other areas", () => {
    expect(safeInternalPath("/fr/app", opts)).toBe("/en/app");
    expect(safeInternalPath("/en/portal", opts)).toBe("/en/app");
    expect(safeInternalPath("/en/portal", { fallback: "/en" })).toBe("/en/portal");
  });
});
