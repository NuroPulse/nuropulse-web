// Shared patient status logic (CLAUDE.md Section 10). Pure functions: "now" is passed in so
// the edges can be unit-tested. Labels live in the badge components, not here.

const DAY_MS = 24 * 60 * 60 * 1000;

export const ACTIVE_WITHIN_DAYS = 3;
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

  // Never measured: still "no measurement yet" during the first 14 days after connecting.
  // A missing connectedAt means the connection time is unknown; treat it as just connected.
  if (!connectedAt) return "no_measurement";
  const sinceConnected = now.getTime() - new Date(connectedAt).getTime();
  return sinceConnected < INACTIVE_AFTER_DAYS * DAY_MS ? "no_measurement" : "inactive";
}

// Why a patient is flagged "Perlu ditinjau". The backend computes flags in the patient_flags
// view; the web only reads them and shows the reason.
export type FlagReason =
  | { kind: "tremor_pattern"; detectedCount: number }
  | { kind: "medication_compliance" };

// Measurement status, filled by a backend trigger (CLAUDE.md Section 4). The web never
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
