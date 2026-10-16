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
  // Last 7 days, 0–1. null: no scheduled dose in the window.
  medicationCompliance: number | null;
  // Days with at least one measurement in the last 7 days ÷ 7.
  checkInCompliance: number;
};

// The schedule codes come from the data contract; RLS cannot tell
// patient_not_connected from forbidden, so both arrive as "forbidden".
export type PatientErrorCode =
  | "network"
  | "forbidden"
  | "schedule_invalid_times"
  | "schedule_invalid_range"
  | "unknown";

// Typed error thrown by api.ts; the UI maps `code` to Indonesian text.
export class PatientFailure extends Error {
  readonly code: PatientErrorCode;

  constructor(code: PatientErrorCode) {
    super(code);
    this.name = "PatientFailure";
    this.code = code;
  }
}

// Measurement (data contract), mapped to camelCase. Only valid rest measurements reach
// the web; a row without status or features is skipped by the mapper.

export type MeasurementFeatures = {
  peakFrequencyHz: number;
  bandPowerRatio: number;
  snr: number;
  bandRmsG: number;
  consistency: number;
};

// device is free JSON in the database, so every key may be missing.
export type MeasurementDevice = {
  model: string | null;
  os: "android" | "ios" | null;
  appVersion: string | null;
  effectiveSamplingHz: number | null;
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

export type MeasurementPage = {
  items: Measurement[];
  total: number;
};

// The only fields that may change in place (data contract).
export type ScheduleChanges = {
  endDate: string | null;
  instructions: string | null;
};

export type NewScheduleInput = {
  medicineId: string;
  dose: string;
  times: string[];
  startDate: string;
  endDate: string;
  instructions: string;
};

// A dose on the tremor trend's dose strip. Pending doses are not drawn.
export type AnsweredDoseStatus = "taken" | "skipped" | "missed";

export type DoseMarker = {
  // Where the marker sits: taken_at for a taken dose, otherwise the scheduled time.
  time: number;
  status: AnsweredDoseStatus;
  scheduledAt: Date;
  takenAt: Date | null;
  medicineName: string;
};

// A switch marked on the trend: phone model (amplitude is only comparable on one model) or
// algorithm version (results of different versions must not be silently mixed).
export type TrendChange = {
  kind: "model" | "algo";
  // The model or version before the switch, and the one from `measuredAt` on.
  previous: string;
  value: string;
  measuredAt: string;
};
