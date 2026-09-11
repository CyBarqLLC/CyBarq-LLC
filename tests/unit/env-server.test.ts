import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const KEYS = ["SUPABASE_SERVICE_ROLE_KEY", "CONTACT_INBOX", "RATE_LIMIT_SALT", "EMAIL_FROM", "CRON_SECRET", "RESEND_API_KEY"] as const;
type Vars = Partial<Record<(typeof KEYS)[number], string>>;

const saved = { ...process.env };

async function load(vars: Vars) {
  vi.resetModules();
  for (const key of KEYS) delete process.env[key];
  Object.assign(process.env, vars);
  const mod = await import("@/lib/env.server");
  return mod.serverEnv();
}

describe("server env", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    process.env = { ...saved };
    vi.restoreAllMocks();
  });

  it("keeps working when optional values are blank or invalid", async () => {
    const env = await load({ SUPABASE_SERVICE_ROLE_KEY: "x".repeat(40), CONTACT_INBOX: "", RATE_LIMIT_SALT: "short", EMAIL_FROM: "not a sender" });
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("x".repeat(40));
    expect(env.CONTACT_INBOX).toBe("info@cybarq.com");
    expect(env.EMAIL_FROM).toBe("CyBarq <no-reply@cybarq.com>");
    expect(env.RATE_LIMIT_SALT).toMatch(/^[0-9a-f]{64}$/);
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it("derives a stable salt that depends on the service key", async () => {
    const a = (await load({ SUPABASE_SERVICE_ROLE_KEY: "a".repeat(40) })).RATE_LIMIT_SALT;
    const again = (await load({ SUPABASE_SERVICE_ROLE_KEY: "a".repeat(40) })).RATE_LIMIT_SALT;
    const b = (await load({ SUPABASE_SERVICE_ROLE_KEY: "b".repeat(40) })).RATE_LIMIT_SALT;
    expect(a).toBe(again);
    expect(a).not.toBe(b);
  });

  it("uses configured values when they are valid", async () => {
    const env = await load({
      SUPABASE_SERVICE_ROLE_KEY: "k".repeat(40),
      CONTACT_INBOX: " hello@cybarq.com ",
      RATE_LIMIT_SALT: "s".repeat(32),
      EMAIL_FROM: "CyBarq <team@cybarq.com>",
      CRON_SECRET: "c".repeat(24),
    });
    expect(env.CONTACT_INBOX).toBe("hello@cybarq.com");
    expect(env.RATE_LIMIT_SALT).toBe("s".repeat(32));
    expect(env.EMAIL_FROM).toBe("CyBarq <team@cybarq.com>");
    expect(env.CRON_SECRET).toBe("c".repeat(24));
  });

  it("only fails when the missing service role key is actually needed", async () => {
    const env = await load({ CONTACT_INBOX: "info@cybarq.com" });
    expect(env.CONTACT_INBOX).toBe("info@cybarq.com");
    expect(() => env.SUPABASE_SERVICE_ROLE_KEY).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});
