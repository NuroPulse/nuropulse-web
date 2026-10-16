import type { FlagReason, MeasurementStatus } from "~/lib/patient-status";

export type { MeasurementStatus };

export type PatientFlag = {
  reason: FlagReason;
};

export type PatientListItem = {
  id: string;
  fullName: string;
  // International format, for example "+6281234567890". null when the backend has none.
  phone: string | null;
  connectedAt: string | null;
  // Most recent valid measurement (measured_at), or null if the patient never measured.
  lastMeasuredAt: string | null;
  flag: PatientFlag | null;
  // Last 7 days, 0–1 (CLAUDE.md Section 10). null: no scheduled dose in the window.
  medicationCompliance: number | null;
  // Days with at least one measurement in the last 7 days ÷ 7.
  checkInCompliance: number;
};

export type PatientErrorCode = "network" | "unknown";

// Typed error thrown by api.ts; the UI maps `code` to Indonesian text.
export class PatientFailure extends Error {
  readonly code: PatientErrorCode;

  constructor(code: PatientErrorCode) {
    super(code);
    this.name = "PatientFailure";
    this.code = code;
  }
}

// Measurement (CLAUDE.md Section 4), mapped to camelCase. Only valid rest measurements reach
// the web; a row without status or features is skipped by the mapper.

export type MeasurementFeatures = {
  peakFrequencyHz: number;
  bandPowerRatio: number;
  snr: number;
  bandRmsG: number;
  consistency: number;
};

export type MeasurementDevice = {
  model: string;
  os: "android" | "ios";
  appVersion: string;
  effectiveSamplingHz: number;
};

export type Measurement = {
  id: string;
  measuredAt: string;
  condition: "rest";
  durationS: number;
  status: MeasurementStatus;
  features: MeasurementFeatures;
  algoVersion: string;
  device: MeasurementDevice;
};

export type MedicationSchedule = {
  id: string;
  patientId: string;
  medicineId: string;
  // Joined from medicines for display.
  medicineName: string;
  // Dose per intake for this patient, free text.
  dose: string;
  // "HH:MM", ascending, 1 to 8 entries.
  times: string[];
  startDate: string;
  endDate: string | null;
  instructions: string | null;
  isActive: boolean;
  // Backend-set; for a stopped schedule this is when it was stopped.
  updatedAt: string;
};

export type MedicationLog = {
  id: string;
  scheduleId: string;
  scheduledAt: string;
  status: "taken" | "skipped";
  takenAt: string | null;
  loggedAt: string;
};

export type NewScheduleInput = {
  medicineId: string;
  dose: string;
  times: string[];
  startDate: string;
  endDate: string;
  instructions: string;
};
