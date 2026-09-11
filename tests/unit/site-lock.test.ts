import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hasValidAccessToken, isSiteLocked, issueAccessToken, maintenanceLang, safeNextPath, SITE_ACCESS_TTL_SECONDS, verifyLockPassword } from "@/lib/site-lock";

const env = { ...process.env };

describe("site lock", () => {
  beforeEach(() => {
    process.env.SITE_LOCKED = "true";
    process.env.SITE_LOCK_PASSWORD = "test-password";
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("reads the lock flag", () => {
    expect(isSiteLocked()).toBe(true);
    process.env.SITE_LOCKED = "false";
    expect(isSiteLocked()).toBe(false);
    delete process.env.SITE_LOCKED;
    expect(isSiteLocked()).toBe(false);
  });

  it("verifies the password on the server only", async () => {
    expect(await verifyLockPassword("test-password")).toBe(true);
    expect(await verifyLockPassword("wrong")).toBe(false);
    expect(await verifyLockPassword("")).toBe(false);
    delete process.env.SITE_LOCK_PASSWORD;
    expect(await verifyLockPassword("anything")).toBe(false);
  });

  it("issues tokens that never contain the password and expire after 4 hours", async () => {
    const now = Date.UTC(2026, 8, 11, 12, 0, 0);
    const token = await issueAccessToken(now);
    expect(token).not.toBeNull();
    expect(token).not.toContain("test-password");
    expect(await hasValidAccessToken(token ?? "", now)).toBe(true);
    expect(await hasValidAccessToken(token ?? "", now + (SITE_ACCESS_TTL_SECONDS - 60) * 1000)).toBe(true);
    expect(await hasValidAccessToken(token ?? "", now + (SITE_ACCESS_TTL_SECONDS + 1) * 1000)).toBe(false);
  });

  it("rejects forged, extended and stale tokens", async () => {
    const now = Date.now();
    const token = (await issueAccessToken(now)) ?? "";
    const [exp, sig] = token.split(".");
    expect(await hasValidAccessToken(`${Number(exp) + 3600}.${sig}`, now)).toBe(false);
    expect(await hasValidAccessToken(`${exp}.${"0".repeat(64)}`, now)).toBe(false);
    expect(await hasValidAccessToken("garbage", now)).toBe(false);
    expect(await hasValidAccessToken(undefined, now)).toBe(false);
    process.env.SITE_LOCK_PASSWORD = "rotated";
    expect(await hasValidAccessToken(token, now)).toBe(false);
  });

  it("only redirects to same site paths", () => {
    expect(safeNextPath("/ar/services")).toBe("/ar/services");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath("/maintenance/en")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });

  it("picks the maintenance language", () => {
    expect(maintenanceLang("/ar/about", "en-US")).toBe("ar");
    expect(maintenanceLang("/en", "ar")).toBe("en");
    expect(maintenanceLang("/", "ar-JO,ar;q=0.9")).toBe("ar");
    expect(maintenanceLang("/", null)).toBe("en");
  });
});
