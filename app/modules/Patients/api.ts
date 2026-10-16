import type { Tables } from "~/lib/database.types";
import { supabase } from "~/lib/supabase";
import {
  PatientFailure,
  type MedicationLog,
  type MedicationSchedule,
  type NewScheduleInput,
  type PatientListItem,
  type ScheduleChanges,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
// Kepatuhan check-in window (CLAUDE.md Section 10).
const CHECK_IN_WINDOW_DAYS = 7;

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

// Local calendar days (the doctor's time zone) with at least one measurement, ÷ 7.
// A rolling 7 × 24 h window can touch 8 calendar days, so the ratio is capped at 1.
function getCheckInCompliance(measuredAts: string[]): number {
  const days = new Set(
    measuredAts.map((measuredAt) => {
      const date = new Date(measuredAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }),
  );
  return Math.min(1, days.size / CHECK_IN_WINDOW_DAYS);
}

// Measured-at times of the last 7 days per patient, for Kepatuhan check-in.
async function listRecentMeasuredAts(patientIds: string[]): Promise<Map<string, string[]>> {
  const byPatient = new Map<string, string[]>();
  if (patientIds.length === 0) return byPatient;

  const since = new Date(Date.now() - CHECK_IN_WINDOW_DAYS * DAY_MS).toISOString();
  const { data, error } = await supabase
    .from("measurements")
    .select("patient_id, measured_at")
    .in("patient_id", patientIds)
    .gte("measured_at", since);
  if (error) throw toPatientFailure(error);

  for (const { patient_id, measured_at } of data) {
    if (!patient_id) continue;
    byPatient.set(patient_id, [...(byPatient.get(patient_id) ?? []), measured_at]);
  }
  return byPatient;
}

const PATIENT_COLUMNS = "id, full_name, phone, connected_at, last_measured_at";

type PatientRow = Pick<
  Tables<"patient_details">,
  "id" | "full_name" | "phone" | "connected_at" | "last_measured_at"
>;

// Returns null for a row without a name, which cannot be shown.
function toPatientListItem(row: PatientRow, recentMeasuredAts: string[]): PatientListItem | null {
  if (!row.full_name) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    connectedAt: row.connected_at,
    lastMeasuredAt: row.last_measured_at,
    // TODO(backend): read from the patient_flags view once it exists (CLAUDE.md Section 10).
    flag: null,
    // TODO: compute from medication_schedules and medication_logs once their schema is fixed.
    medicationCompliance: null,
    checkInCompliance: getCheckInCompliance(recentMeasuredAts),
  };
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

  // measurements.patient_id references profiles, not patient_details, so the recent
  // measurements cannot be embedded and are read in a second query.
  const recentByPatient = await listRecentMeasuredAts(data.map((row) => row.id));

  return data.flatMap((row) => toPatientListItem(row, recentByPatient.get(row.id) ?? []) ?? []);
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

  const recentByPatient = await listRecentMeasuredAts([data.id]);
  return toPatientListItem(data, recentByPatient.get(data.id) ?? []);
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

// Longest range the medication log shows (7 or 30 days).
const MEDICATION_LOG_WINDOW_DAYS = 30;

// The patient's answered doses of the last 30 days. Written by mobile only; the web reads them.
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
