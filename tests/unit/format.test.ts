import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatNumber, initials } from "@/lib/utils/format";

describe("formatting", () => {
  it("uses Western numerals in Arabic", () => {
    const ar = formatNumber(1234567, "ar");
    expect(ar).toMatch(/1/);
    expect(ar).not.toMatch(/[٠-٩]/);
    expect(formatDate("2026-09-11", "ar")).not.toMatch(/[٠-٩]/);
  });
  it("formats JOD with three decimals", () => {
    expect(formatMoney(10, "JOD", "en")).toMatch(/10\.000/);
    expect(formatMoney("2.5", "USD", "en")).toMatch(/2\.50/);
  });
  it("builds initials", () => {
    expect(initials("Mohamad Alnajjar")).toBe("MA");
    expect(initials("")).toBe("");
  });
  it("handles invalid dates", () => {
    expect(formatDate("not a date", "en")).toBe("");
  });
});
