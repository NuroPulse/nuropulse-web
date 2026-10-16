import { describe, expect, it } from "vitest";

import {
  countRecentTremor,
  getActivityStatus,
  getCheckInCompliance,
  getComplianceBucket,
  getPatientFlag,
  type StatusMeasurement,
} from "./patient-status";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Local time, so the calendar-day rules behave the same in every time zone.
const now = new Date(2026, 9, 16, 12, 0);
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

function measurement(msAgo: number, status: StatusMeasurement["status"]): StatusMeasurement {
  return { measuredAt: ago(msAgo), status };
}

describe("getActivityStatus", () => {
  const connectedLongAgo = ago(60 * DAY_MS);

  it("is Aktif just under 5 days after the last measurement", () => {
    expect(getActivityStatus({ lastMeasuredAt: ago(5 * DAY_MS - MINUTE_MS), connectedAt: connectedLongAgo }, now)).toBe(
      "active",
    );
  });

  it("is Belum check-in at exactly 5 days", () => {
    expect(getActivityStatus({ lastMeasuredAt: ago(5 * DAY_MS), connectedAt: connectedLongAgo }, now)).toBe(
      "no_check_in",
    );
  });

  it("is Belum check-in just under 14 days", () => {
    expect(
      getActivityStatus({ lastMeasuredAt: ago(14 * DAY_MS - MINUTE_MS), connectedAt: connectedLongAgo }, now),
    ).toBe("no_check_in");
  });

  it("is Tidak aktif at exactly 14 days", () => {
    expect(getActivityStatus({ lastMeasuredAt: ago(14 * DAY_MS), connectedAt: connectedLongAgo }, now)).toBe(
      "inactive",
    );
  });

  it("is Belum ada pengukuran when never measured and connected under 14 days ago", () => {
    expect(getActivityStatus({ lastMeasuredAt: null, connectedAt: ago(14 * DAY_MS - MINUTE_MS) }, now)).toBe(
      "no_measurement",
    );
  });

  it("is Tidak aktif when never measured and connected 14 days ago or more", () => {
    expect(getActivityStatus({ lastMeasuredAt: null, connectedAt: ago(14 * DAY_MS) }, now)).toBe("inactive");
  });

  it("treats an unknown connection time as just connected", () => {
    expect(getActivityStatus({ lastMeasuredAt: null, connectedAt: null }, now)).toBe("no_measurement");
  });
});

describe("getComplianceBucket", () => {
  it.each([
    [0.49, "low"],
    [0.5, "fair"],
    [0.79, "fair"],
    [0.8, "good"],
    [1, "good"],
  ] as const)("puts %s in %s", (ratio, bucket) => {
    expect(getComplianceBucket(ratio)).toBe(bucket);
  });

  it("has no bucket without scheduled doses", () => {
    expect(getComplianceBucket(null)).toBeNull();
  });
});

describe("countRecentTremor", () => {
  it("counts only the last 5 measurements", () => {
    const measurements = [
      measurement(1 * HOUR_MS, "none"),
      measurement(2 * HOUR_MS, "none"),
      measurement(3 * HOUR_MS, "tremor"),
      measurement(4 * HOUR_MS, "tremor"),
      measurement(5 * HOUR_MS, "none"),
      // Sixth newest: outside the last 5.
      measurement(6 * HOUR_MS, "tremor"),
    ];
    expect(countRecentTremor(measurements, now)).toBe(2);
  });

  it("ignores measurements older than 7 days", () => {
    const measurements = [measurement(1 * DAY_MS, "tremor"), measurement(7 * DAY_MS + MINUTE_MS, "tremor")];
    expect(countRecentTremor(measurements, now)).toBe(1);
  });

  it("does not depend on input order", () => {
    const measurements = [
      measurement(6 * HOUR_MS, "tremor"),
      measurement(1 * HOUR_MS, "none"),
      measurement(5 * HOUR_MS, "none"),
      measurement(2 * HOUR_MS, "none"),
      measurement(4 * HOUR_MS, "tremor"),
      measurement(3 * HOUR_MS, "tremor"),
    ];
    expect(countRecentTremor(measurements, now)).toBe(2);
  });
});

describe("getPatientFlag", () => {
  const threeOfFive = [
    measurement(1 * HOUR_MS, "tremor"),
    measurement(2 * HOUR_MS, "tremor"),
    measurement(3 * HOUR_MS, "tremor"),
    measurement(4 * HOUR_MS, "none"),
    measurement(5 * HOUR_MS, "none"),
  ];
  const twoOfFive = [
    measurement(1 * HOUR_MS, "tremor"),
    measurement(2 * HOUR_MS, "tremor"),
    measurement(3 * HOUR_MS, "none"),
    measurement(4 * HOUR_MS, "none"),
    measurement(5 * HOUR_MS, "none"),
  ];

  it("flags 3 of the last 5 measurements with the count", () => {
    expect(getPatientFlag({ measurements: threeOfFive, medicationCompliance: null }, now)).toEqual({
      kind: "tremor_pattern",
      detectedCount: 3,
    });
  });

  it("does not flag 2 of 5", () => {
    expect(getPatientFlag({ measurements: twoOfFive, medicationCompliance: null }, now)).toBeNull();
  });

  it("flags medication compliance under 50%", () => {
    expect(getPatientFlag({ measurements: twoOfFive, medicationCompliance: 0.49 }, now)).toEqual({
      kind: "medication_compliance",
    });
  });

  it("does not flag medication compliance of exactly 50%", () => {
    expect(getPatientFlag({ measurements: twoOfFive, medicationCompliance: 0.5 }, now)).toBeNull();
  });

  it("shows the tremor reason when both hold", () => {
    expect(getPatientFlag({ measurements: threeOfFive, medicationCompliance: 0.1 }, now)?.kind).toBe(
      "tremor_pattern",
    );
  });
});

describe("getCheckInCompliance", () => {
  it("counts each calendar day once", () => {
    expect(getCheckInCompliance([ago(1 * HOUR_MS), ago(2 * HOUR_MS)], now)).toBeCloseTo(1 / 7);
  });

  it("ignores measurements older than 7 days", () => {
    expect(getCheckInCompliance([ago(1 * HOUR_MS), ago(8 * DAY_MS)], now)).toBeCloseTo(1 / 7);
  });

  it("is capped at 1 when the window touches 8 calendar days", () => {
    const eightDays = Array.from({ length: 8 }, (_, day) => ago(day * DAY_MS - 30 * MINUTE_MS));
    expect(getCheckInCompliance(eightDays, now)).toBe(1);
  });

  it("is 0 without measurements", () => {
    expect(getCheckInCompliance([], now)).toBe(0);
  });
});
