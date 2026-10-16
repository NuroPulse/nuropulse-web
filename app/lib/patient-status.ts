// Shared patient status logic. Pure functions: "now" is passed in so the edges can be
// unit-tested. Labels live in the badge components, not here.

const DAY_MS = 24 * 60 * 60 * 1000;

export const ACTIVE_WITHIN_DAYS = 5;
export const INACTIVE_AFTER_DAYS = 14;

export type ActivityStatus = "active" | "no_check_in" | "inactive" | "no_measurement";

type ActivityInput = {
  lastMeasuredAt: string | null;
  connectedAt: string | null;
};

export function getActivityStatus({ lastMeasuredAt, connectedAt }: ActivityInput, now: Date): ActivityStatus {
  if (lastMeasuredAt) {
    const age = now.getTime() - new Date(lastMeasuredAt).getTime();
    if (age < ACTIVE_WITHIN_DAYS * DAY_MS) return "active";
    if (age < INACTIVE_AFTER_DAYS * DAY_MS) return "no_check_in";
    return "inactive";
  }

  // Never measured: still "no measurement yet" during the first INACTIVE_AFTER_DAYS days after
  // connecting.
  // A missing connectedAt means the connection time is unknown; treat it as just connected.
  if (!connectedAt) return "no_measurement";
  const sinceConnected = now.getTime() - new Date(connectedAt).getTime();
  return sinceConnected < INACTIVE_AFTER_DAYS * DAY_MS ? "no_measurement" : "inactive";
}

// Why a patient is flagged "Perlu ditinjau". Computed on the web when the data is read, from
// the backend's measurement status and the medication log.
export type FlagReason =
  | { kind: "tremor_pattern"; detectedCount: number }
  | { kind: "medication_compliance" };

// Measurement status, filled by a backend trigger (data contract). The web never
// derives it from features.
export type MeasurementStatus = "none" | "tremor";

export type ComplianceBucket = "good" | "fair" | "low";

// Baik ≥ 80%, Sedang 50–79%, Rendah < 50%. `ratio` is 0–1; null means nothing to measure
// (for example no scheduled dose in the window), which has no bucket.
export function getComplianceBucket(ratio: number | null): ComplianceBucket | null {
  if (ratio === null) return null;
  if (ratio >= 0.8) return "good";
  if (ratio >= 0.5) return "fair";
  return "low";
}

// Flag and Kepatuhan check-in windows.
export const FLAG_WINDOW_DAYS = 7;
export const FLAG_RECENT_MEASUREMENTS = 5;
export const FLAG_TREMOR_MIN = 3;
export const CHECK_IN_WINDOW_DAYS = 7;

export type StatusMeasurement = {
  measuredAt: string;
  status: MeasurementStatus;
};

function isWithinDays(timestamp: string, days: number, now: Date): boolean {
  return new Date(timestamp).getTime() >= now.getTime() - days * DAY_MS;
}

// "Pola tremor terdeteksi" among the last 5 measurements of the last 7 days.
export function countRecentTremor(measurements: StatusMeasurement[], now: Date): number {
  return measurements
    .filter((measurement) => isWithinDays(measurement.measuredAt, FLAG_WINDOW_DAYS, now))
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
    .slice(0, FLAG_RECENT_MEASUREMENTS)
    .filter((measurement) => measurement.status === "tremor").length;
}

type FlagInput = {
  measurements: StatusMeasurement[];
  // Kepatuhan obat over the last 7 days (lib/medication.ts); null without scheduled doses.
  medicationCompliance: number | null;
};

// The flag rule. A flag shows one reason; when both hold, the tremor pattern is shown.
export function getPatientFlag({ measurements, medicationCompliance }: FlagInput, now: Date): FlagReason | null {
  const detectedCount = countRecentTremor(measurements, now);
  if (detectedCount >= FLAG_TREMOR_MIN) return { kind: "tremor_pattern", detectedCount };
  if (getComplianceBucket(medicationCompliance) === "low") return { kind: "medication_compliance" };
  return null;
}

// Kepatuhan check-in: local calendar days (the doctor's time zone) with at least one
// measurement in the last 7 days, ÷ 7. A rolling 7 × 24 h window can touch 8 calendar days,
// so the ratio is capped at 1.
export function getCheckInCompliance(measuredAts: string[], now: Date): number {
  const days = new Set(
    measuredAts
      .filter((measuredAt) => isWithinDays(measuredAt, CHECK_IN_WINDOW_DAYS, now))
      .map((measuredAt) => {
        const date = new Date(measuredAt);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }),
  );
  return Math.min(1, days.size / CHECK_IN_WINDOW_DAYS);
}
