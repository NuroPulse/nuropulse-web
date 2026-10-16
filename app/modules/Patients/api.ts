import type { Json, Tables } from "~/lib/database.types";
import { getMedicationCompliance, type DoseLog, type ScheduleWithHistory } from "~/lib/medication";
import { getCheckInCompliance, getPatientFlag, type StatusMeasurement } from "~/lib/patient-status";
import { supabase } from "~/lib/supabase";
import {
  PatientFailure,
  type Measurement,
  type MeasurementPage,
  type MedicationLog,
  type MedicationSchedule,
  type NewScheduleInput,
  type PatientListItem,
  type ScheduleChanges,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
// Flags and both compliance measures look at the last 7 days (CLAUDE.md Section 10).
const RECENT_WINDOW_DAYS = 7;

// Postgres codes come back from Supabase, not the contract names
// (CLAUDE.md Section 4, "Backend error codes").
function toPatientFailure(error: unknown): PatientFailure {
  if (typeof navigator !== "undefined" && !navigator.onLine) return new PatientFailure("network");
  // fetch() rejects with a TypeError when the network is unreachable.
  if (error instanceof TypeError) return new PatientFailure("network");
  if (typeof error !== "object" || error === null) return new PatientFailure("unknown");

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  switch (code) {
    case "42501":
      return new PatientFailure("forbidden");
    case "23514":
      // The violated check constraint is named in the message.
      if (message.includes("time")) return new PatientFailure("schedule_invalid_times");
      if (message.includes("date") || message.includes("range")) {
        return new PatientFailure("schedule_invalid_range");
      }
      return new PatientFailure("unknown");
    default:
      return new PatientFailure("unknown");
  }
}

const PATIENT_COLUMNS = "id, full_name, phone, connected_at, last_measured_at";

type PatientRow = Pick<
  Tables<"patient_details">,
  "id" | "full_name" | "phone" | "connected_at" | "last_measured_at"
>;

// What the flag and compliance rules need for one patient.
type RecentActivity = {
  measurements: StatusMeasurement[];
  schedules: ScheduleWithHistory[];
  logs: DoseLog[];
};

function emptyActivity(): RecentActivity {
  return { measurements: [], schedules: [], logs: [] };
}

// The last 7 days of measurements and medication logs, plus every schedule, for all given
// patients in three queries (never one query per patient). measurements.patient_id references
// profiles, not patient_details, so this cannot be embedded in the patient query.
async function listRecentActivity(patientIds: string[], now: Date): Promise<Map<string, RecentActivity>> {
  const byPatient = new Map<string, RecentActivity>(patientIds.map((id) => [id, emptyActivity()]));
  if (patientIds.length === 0) return byPatient;

  const since = new Date(now.getTime() - RECENT_WINDOW_DAYS * DAY_MS).toISOString();
  // Log times come from the patient's device clock; a day of margin keeps a slightly early
  // scheduled_at from dropping out of the window.
  const logsSince = new Date(now.getTime() - (RECENT_WINDOW_DAYS + 1) * DAY_MS).toISOString();

  const [measurements, schedules, logs] = await Promise.all([
    supabase
      .from("measurements")
      .select("patient_id, measured_at, status")
      .in("patient_id", patientIds)
      .eq("condition", "rest")
      .in("status", ["none", "tremor"])
      .gte("measured_at", since),
    // A patient has few schedules over their lifetime, and stopped ones still count for the
    // days before they were stopped.
    supabase
      .from("medication_schedules")
      .select("id, patient_id, times, start_date, end_date, is_active, updated_at")
      .in("patient_id", patientIds),
    supabase
      .from("medication_logs")
      .select("patient_id, schedule_id, scheduled_at, status, taken_at")
      .in("patient_id", patientIds)
      .gte("scheduled_at", logsSince),
  ]);
  if (measurements.error) throw toPatientFailure(measurements.error);
  if (schedules.error) throw toPatientFailure(schedules.error);
  if (logs.error) throw toPatientFailure(logs.error);

  for (const row of measurements.data) {
    if (!row.patient_id || (row.status !== "none" && row.status !== "tremor")) continue;
    byPatient.get(row.patient_id)?.measurements.push({ measuredAt: row.measured_at, status: row.status });
  }
  for (const row of schedules.data) {
    byPatient.get(row.patient_id)?.schedules.push({
      id: row.id,
      times: row.times,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active,
      updatedAt: row.updated_at,
    });
  }
  for (const row of logs.data) {
    if (row.status !== "taken" && row.status !== "skipped") continue;
    byPatient.get(row.patient_id)?.logs.push({
      scheduleId: row.schedule_id,
      scheduledAt: row.scheduled_at,
      status: row.status,
      takenAt: row.status === "taken" ? row.taken_at : null,
    });
  }
  return byPatient;
}

// Flags and compliance are computed here, when the data is read (CLAUDE.md Section 10), so
// they follow new data and the passing of time without anything stored. Returns null for a
// row without a name, which cannot be shown.
function toPatientListItem(row: PatientRow, activity: RecentActivity, now: Date): PatientListItem | null {
  if (!row.full_name) return null;
  const medicationCompliance = getMedicationCompliance(activity.schedules, activity.logs, now);
  const flagReason = getPatientFlag({ measurements: activity.measurements, medicationCompliance }, now);
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    connectedAt: row.connected_at,
    lastMeasuredAt: row.last_measured_at,
    flag: flagReason ? { reason: flagReason } : null,
    medicationCompliance,
    checkInCompliance: getCheckInCompliance(
      activity.measurements.map((measurement) => measurement.measuredAt),
      now,
    ),
  };
}

async function toPatientListItems(rows: PatientRow[]): Promise<PatientListItem[]> {
  const now = new Date();
  const activity = await listRecentActivity(
    rows.map((row) => row.id),
    now,
  );
  return rows.flatMap((row) => toPatientListItem(row, activity.get(row.id) ?? emptyActivity(), now) ?? []);
}

async function getSignedInDoctorId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toPatientFailure(error);
  const doctorId = data.session?.user.id;
  // The app layout guard only renders patient pages for a signed-in doctor.
  if (!doctorId) throw new PatientFailure("unknown");
  return doctorId;
}

// All patients connected to the signed-in doctor, most recent measurement first, read from the
// patient_details table. RLS is the security boundary; the doctor_id filter only narrows the
// rows the backend already allows.
export async function listMyPatients(): Promise<PatientListItem[]> {
  const doctorId = await getSignedInDoctorId();

  const { data, error } = await supabase
    .from("patient_details")
    .select(PATIENT_COLUMNS)
    .eq("doctor_id", doctorId)
    // Never-measured patients go last (CLAUDE.md Section 9).
    .order("last_measured_at", { ascending: false, nullsFirst: false });
  if (error) throw toPatientFailure(error);
  return toPatientListItems(data);
}

// One patient connected to the signed-in doctor; null when the id is unknown or the patient
// is not connected to this doctor.
export async function getPatient(patientId: string): Promise<PatientListItem | null> {
  const doctorId = await getSignedInDoctorId();

  const { data, error } = await supabase
    .from("patient_details")
    .select(PATIENT_COLUMNS)
    .eq("id", patientId)
    .eq("doctor_id", doctorId)
    .maybeSingle();
  // 22P02: the id in the URL is not a valid uuid, so no such patient exists.
  if (error?.code === "22P02") return null;
  if (error) throw toPatientFailure(error);
  if (!data) return null;

  const [patient] = await toPatientListItems([data]);
  return patient ?? null;
}

const SCHEDULE_COLUMNS =
  "id, patient_id, medicine_id, dose, times, start_date, end_date, instructions, is_active, updated_at, medicine:medicines(name)";

type ScheduleRow = Pick<
  Tables<"medication_schedules">,
  | "id"
  | "patient_id"
  | "medicine_id"
  | "dose"
  | "times"
  | "start_date"
  | "end_date"
  | "instructions"
  | "is_active"
  | "updated_at"
> & { medicine: { name: string } | null };

function toMedicationSchedule(row: ScheduleRow): MedicationSchedule {
  return {
    id: row.id,
    patientId: row.patient_id,
    medicineId: row.medicine_id,
    // medicine_id is a required foreign key, so the name is only missing if RLS hides the row.
    medicineName: row.medicine?.name ?? "—",
    dose: row.dose,
    times: row.times,
    startDate: row.start_date,
    endDate: row.end_date,
    instructions: row.instructions,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

// Every schedule of the patient, active and stopped: the medication log needs stopped ones to
// name past doses.
export async function listSchedules(patientId: string): Promise<MedicationSchedule[]> {
  const { data, error } = await supabase
    .from("medication_schedules")
    .select(SCHEDULE_COLUMNS)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true });
  if (error) throw toPatientFailure(error);
  return data.map(toMedicationSchedule);
}

export async function createSchedule(patientId: string, input: NewScheduleInput): Promise<MedicationSchedule> {
  const doctorId = await getSignedInDoctorId();
  // The generated types require the timestamps on insert (the columns have no default).
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("medication_schedules")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      medicine_id: input.medicineId,
      dose: input.dose.trim(),
      times: input.times,
      start_date: input.startDate,
      end_date: input.endDate || null,
      instructions: input.instructions.trim() || null,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select(SCHEDULE_COLUMNS)
    .single();
  if (error) throw toPatientFailure(error);
  return toMedicationSchedule(data);
}

// RLS turns an update of someone else's schedule into "0 rows changed" rather than an error,
// so an empty result is reported as forbidden.
async function patchSchedule(
  scheduleId: string,
  patch: { end_date?: string | null; instructions?: string | null; is_active?: boolean },
): Promise<MedicationSchedule> {
  const { data, error } = await supabase
    .from("medication_schedules")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", scheduleId)
    .select(SCHEDULE_COLUMNS)
    .maybeSingle();
  if (error) throw toPatientFailure(error);
  if (!data) throw new PatientFailure("forbidden");
  return toMedicationSchedule(data);
}

export function updateSchedule(scheduleId: string, changes: ScheduleChanges): Promise<MedicationSchedule> {
  return patchSchedule(scheduleId, { end_date: changes.endDate, instructions: changes.instructions });
}

// Schedules are never deleted; stopping keeps past logs pointing at the right dose.
export function stopSchedule(scheduleId: string): Promise<MedicationSchedule> {
  return patchSchedule(scheduleId, { is_active: false });
}

const MEASUREMENT_COLUMNS =
  "id, measured_at, condition, duration_s, status, peak_frequency_hz, band_power_ratio, snr, band_rms_g, consistency, features, algo_version, device";

// Longest trend range (3 Bulan).
const TREND_WINDOW_DAYS = 90;
export const MEASUREMENT_HISTORY_PAGE_SIZE = 10;

type MeasurementRow = Pick<
  Tables<"measurements">,
  | "id"
  | "measured_at"
  | "condition"
  | "duration_s"
  | "status"
  | "peak_frequency_hz"
  | "band_power_ratio"
  | "snr"
  | "band_rms_g"
  | "consistency"
  | "features"
  | "algo_version"
  | "device"
>;

function readObject(value: Json | undefined): { [key: string]: Json | undefined } | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}

function readNumber(value: Json | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(value: Json | undefined): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

// Returns null for a row the dashboard must not show: no status label or missing features
// (CLAUDE.md Section 8). Features are read from the columns first, then from the features JSON.
function toMeasurement(row: MeasurementRow): Measurement | null {
  if (row.status !== "none" && row.status !== "tremor") return null;

  const json = readObject(row.features ?? undefined);
  const peakFrequencyHz = row.peak_frequency_hz ?? readNumber(json?.peak_frequency_hz);
  const bandPowerRatio = row.band_power_ratio ?? readNumber(json?.band_power_ratio);
  const snr = row.snr ?? readNumber(json?.snr);
  const bandRmsG = row.band_rms_g ?? readNumber(json?.band_rms_g);
  const consistency = row.consistency ?? readNumber(json?.consistency);
  if (
    peakFrequencyHz === null ||
    bandPowerRatio === null ||
    snr === null ||
    bandRmsG === null ||
    consistency === null
  ) {
    return null;
  }

  const device = readObject(row.device);
  const os = device?.os;
  return {
    id: row.id,
    measuredAt: row.measured_at,
    condition: "rest",
    durationS: row.duration_s,
    status: row.status,
    features: { peakFrequencyHz, bandPowerRatio, snr, bandRmsG, consistency },
    algoVersion: row.algo_version,
    device: {
      model: readString(device?.model),
      os: os === "android" || os === "ios" ? os : null,
      appVersion: readString(device?.app_version),
      effectiveSamplingHz: readNumber(device?.effective_sampling_hz),
    },
  };
}

function toMeasurements(rows: MeasurementRow[]): Measurement[] {
  return rows.flatMap((row) => toMeasurement(row) ?? []);
}

// Shared filters: only rest checks with a status label, newest first by measured_at
// (never uploaded_at, CLAUDE.md Section 9).
function measurementsOf(patientId: string, options?: { count: "exact" }) {
  return supabase
    .from("measurements")
    .select(MEASUREMENT_COLUMNS, options)
    .eq("patient_id", patientId)
    .eq("condition", "rest")
    .in("status", ["none", "tremor"])
    .order("measured_at", { ascending: false });
}

// The most recent showable measurement, however old.
export async function getLatestMeasurement(patientId: string): Promise<Measurement | null> {
  // A few rows, in case the newest ones lack features and are skipped.
  const { data, error } = await measurementsOf(patientId).limit(5);
  if (error) throw toPatientFailure(error);
  return toMeasurements(data)[0] ?? null;
}

// Every measurement of the last 3 months, newest first; the trend filters 7 / 30 days from it.
export async function listTrendMeasurements(patientId: string): Promise<Measurement[]> {
  const since = new Date(Date.now() - TREND_WINDOW_DAYS * DAY_MS).toISOString();
  const { data, error } = await measurementsOf(patientId).gte("measured_at", since);
  if (error) throw toPatientFailure(error);
  return toMeasurements(data);
}

// One page of the full measurement history, paginated in the query.
export async function listMeasurementHistory(patientId: string, page: number): Promise<MeasurementPage> {
  const start = (page - 1) * MEASUREMENT_HISTORY_PAGE_SIZE;
  const { data, error, count } = await measurementsOf(patientId, { count: "exact" }).range(
    start,
    start + MEASUREMENT_HISTORY_PAGE_SIZE - 1,
  );
  if (error) throw toPatientFailure(error);
  return { items: toMeasurements(data), total: count ?? data.length };
}

// Longest range that reads the medication log: the log table (7 or 30 days) and the dose strip
// under the tremor trend (up to 3 Bulan).
const MEDICATION_LOG_WINDOW_DAYS = 90;

// The patient's answered doses of the last 90 days. Written by mobile only; the web reads them.
// "Terlewat" is not stored: it is derived from schedules and logs in the component.
export async function listMedicationLogs(patientId: string): Promise<MedicationLog[]> {
  const since = new Date(Date.now() - MEDICATION_LOG_WINDOW_DAYS * DAY_MS).toISOString();
  const { data, error } = await supabase
    .from("medication_logs")
    .select("id, schedule_id, scheduled_at, status, taken_at, logged_at")
    .eq("patient_id", patientId)
    .gte("scheduled_at", since)
    .order("scheduled_at", { ascending: false });
  if (error) throw toPatientFailure(error);

  return data.flatMap((row): MedicationLog[] => {
    // status is plain text in the database; the contract allows only these two values.
    if (row.status !== "taken" && row.status !== "skipped") return [];
    return [
      {
        id: row.id,
        scheduleId: row.schedule_id,
        scheduledAt: row.scheduled_at,
        status: row.status,
        takenAt: row.status === "taken" ? row.taken_at : null,
        loggedAt: row.logged_at,
      },
    ];
  });
}
