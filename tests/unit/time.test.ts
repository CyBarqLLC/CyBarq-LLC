import { describe, expect, it } from "vitest";
import { addDays, businessDayStart, businessLocalToUtc, businessToday, daysBetween, utcToBusinessLocal } from "@/lib/time";
import { formatDate, formatDateTime } from "@/lib/utils/format";

describe("business time (Asia/Amman, UTC+3)", () => {
  it("uses the Amman calendar date, not the UTC date, just after midnight", () => {
    // 22:30 UTC on 11 Sep is 01:30 on 12 Sep in Amman.
    expect(businessToday(new Date("2026-09-11T22:30:00Z"))).toBe("2026-09-12");
    expect(businessToday(new Date("2026-09-11T20:59:00Z"))).toBe("2026-09-11");
  });
  it("adds calendar days without time zone drift", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-09-01", "2026-10-01")).toBe(30);
  });
  it("converts Amman wall time to UTC and back", () => {
    expect(businessLocalToUtc("2026-09-12T09:00")).toBe("2026-09-12T06:00:00.000Z");
    expect(utcToBusinessLocal("2026-09-12T06:00:00.000Z")).toBe("2026-09-12T09:00");
    expect(businessDayStart("2026-09-12")).toBe("2026-09-11T21:00:00.000Z");
  });
  it("shows calendar dates exactly as stored and instants in Amman time", () => {
    expect(formatDate("2026-09-11", "en")).toBe("11 Sep 2026");
    // An instant late on 11 Sep UTC is already 12 Sep in Amman.
    expect(formatDate("2026-09-11T22:30:00Z", "en")).toBe("12 Sep 2026");
    expect(formatDateTime("2026-09-11T22:30:00Z", "en")).toBe("12 Sep 2026, 01:30");
    expect(formatDate("2026-09-11", "ar")).not.toMatch(/[٠-٩]/);
  });
});
