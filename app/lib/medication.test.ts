import { describe, expect, it } from "vitest";

import {
  deriveDoses,
  dosesOnDate,
  getMedicationCompliance,
  isEndBeforeStart,
  toLocalDateKey,
  validateTimes,
  type DoseLog,
  type ScheduleWithHistory,
} from "./medication";

const DAY_MS = 24 * 60 * 60 * 1000;

// Local times, as schedules carry no time zone.
const today = new Date(2026, 9, 16);
const at = (dayOffset: number, hours: number, minutes = 0) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hours, minutes);
const dateKey = (dayOffset: number) => toLocalDateKey(at(dayOffset, 0));

function schedule(overrides: Partial<ScheduleWithHistory> = {}): ScheduleWithHistory {
  return {
    id: "schedule-1",
    times: ["08:00", "20:00"],
    startDate: dateKey(-1),
    endDate: null,
    isActive: true,
    updatedAt: at(-1, 0).toISOString(),
    ...overrides,
  };
}

function taken(scheduledAt: Date): DoseLog {
  return {
    scheduleId: "schedule-1",
    scheduledAt: scheduledAt.toISOString(),
    status: "taken",
    takenAt: scheduledAt.toISOString(),
  };
}

describe("dosesOnDate", () => {
  it("has the schedule's times on a date inside the range", () => {
    expect(dosesOnDate(schedule(), dateKey(0))).toEqual([at(0, 8), at(0, 20)]);
  });

  it("has no doses for a stopped schedule", () => {
    expect(dosesOnDate(schedule({ isActive: false }), dateKey(0))).toEqual([]);
  });

  it("has no doses before the start date", () => {
    expect(dosesOnDate(schedule({ startDate: dateKey(0) }), dateKey(-1))).toEqual([]);
  });

  it("includes the end date and nothing after it", () => {
    const ended = schedule({ endDate: dateKey(0) });
    expect(dosesOnDate(ended, dateKey(0))).toHaveLength(2);
    expect(dosesOnDate(ended, dateKey(1))).toEqual([]);
  });
});

describe("deriveDoses", () => {
  const morningOnly = schedule({ times: ["08:00"], startDate: dateKey(0) });

  it("is pending just under 2 hours after the scheduled time", () => {
    const [dose] = deriveDoses([morningOnly], [], at(0, 0), at(0, 9, 59));
    expect(dose.status).toBe("pending");
  });

  it("is missed at 2 hours without a log", () => {
    const [dose] = deriveDoses([morningOnly], [], at(0, 0), at(0, 10));
    expect(dose.status).toBe("missed");
  });

  it("uses the log when there is one", () => {
    const [dose] = deriveDoses([morningOnly], [taken(at(0, 8))], at(0, 0), at(0, 12));
    expect(dose.status).toBe("taken");
  });
});

describe("getMedicationCompliance", () => {
  const now = at(0, 22, 30);

  it("is null without scheduled doses", () => {
    expect(getMedicationCompliance([], [], now)).toBeNull();
  });

  it("is taken ÷ doses that came due", () => {
    // Yesterday 08:00 and 20:00 taken; today 08:00 and 20:00 missed.
    const logs = [taken(at(-1, 8)), taken(at(-1, 20))];
    expect(getMedicationCompliance([schedule()], logs, now)).toBe(0.5);
  });

  it("does not count pending doses", () => {
    const logs = [taken(at(-1, 8)), taken(at(-1, 20)), taken(at(0, 8))];
    // Today 20:00 is still pending at 21:30.
    expect(getMedicationCompliance([schedule()], logs, at(0, 21, 30))).toBe(1);
  });

  it("counts a stopped schedule until the day it was stopped", () => {
    const stopped = schedule({ isActive: false, updatedAt: at(-1, 21).toISOString() });
    // Only yesterday's two doses count; both taken.
    const logs = [taken(at(-1, 8)), taken(at(-1, 20))];
    expect(getMedicationCompliance([stopped], logs, now)).toBe(1);
  });

  it("ignores doses older than 7 days", () => {
    const old = schedule({ startDate: dateKey(-30), endDate: dateKey(-8) });
    expect(getMedicationCompliance([old], [], new Date(now.getTime() + DAY_MS))).toBeNull();
  });
});

describe("validateTimes", () => {
  it("requires at least one time", () => {
    expect(validateTimes([])).toBe("required");
  });

  it("allows at most 8 times", () => {
    const nine = ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00"];
    expect(validateTimes(nine)).toBe("too_many");
    expect(validateTimes(nine.slice(0, 8))).toBeUndefined();
  });

  it("rejects an invalid time", () => {
    expect(validateTimes(["24:00"])).toBe("invalid");
  });

  it("rejects duplicates", () => {
    expect(validateTimes(["08:00", "08:00"])).toBe("duplicate");
  });
});

describe("isEndBeforeStart", () => {
  it("allows no end date and an end date on the start date", () => {
    expect(isEndBeforeStart("2026-10-16", null)).toBe(false);
    expect(isEndBeforeStart("2026-10-16", "2026-10-16")).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    expect(isEndBeforeStart("2026-10-16", "2026-10-15")).toBe(true);
  });
});
