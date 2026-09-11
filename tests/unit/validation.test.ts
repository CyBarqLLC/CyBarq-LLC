import { describe, expect, it } from "vitest";
import { z } from "zod";
import { optionalString, requiredString, money, checkbox, optionalDate, formToObject, positiveInt } from "@/lib/validation/common";

describe("common validation", () => {
  it("turns empty optional strings into undefined", () => {
    const s = z.object({ a: optionalString() });
    expect(s.parse({ a: "" })).toEqual({});
    expect(s.parse({ a: "  x " })).toEqual({ a: "x" });
  });
  it("rejects empty required strings", () => {
    expect(() => requiredString().parse("   ")).toThrow();
  });
  it("parses money from form input", () => {
    expect(money.parse("1,250.500")).toBe(1250.5);
    expect(() => money.parse("-1")).toThrow();
    expect(() => money.parse("abc")).toThrow();
  });
  it("parses checkboxes and integers", () => {
    expect(checkbox.parse("on")).toBe(true);
    expect(checkbox.parse(undefined)).toBe(false);
    expect(positiveInt.parse("3")).toBe(3);
    expect(() => positiveInt.parse("0")).toThrow();
  });
  it("accepts ISO dates only", () => {
    expect(optionalDate.parse("2026-09-11")).toBe("2026-09-11");
    expect(optionalDate.parse("")).toBeUndefined();
    expect(() => optionalDate.parse("11/09/2026")).toThrow();
  });
  it("collects repeated form keys into arrays", () => {
    const fd = new FormData();
    fd.append("tag", "a");
    fd.append("tag", "b");
    fd.append("name", "x");
    expect(formToObject(fd)).toEqual({ tag: ["a", "b"], name: "x" });
  });
});
