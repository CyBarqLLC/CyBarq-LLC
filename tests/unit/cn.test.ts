import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
  it("treats the brand type scale as sizes, not colours", () => {
    expect(cn("text-white", "text-small")).toBe("text-white text-small");
    expect(cn("text-small", "text-slate")).toBe("text-small text-slate");
    expect(cn("text-body", "text-h2")).toBe("text-h2");
    expect(cn("text-sm", "text-label")).toBe("text-label");
  });
  it("still merges ordinary conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-slate", "text-graphite")).toBe("text-graphite");
  });
});
