import { supabase } from "~/lib/supabase";
import { PatientFailure, type PatientListItem } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
// Kepatuhan check-in window (CLAUDE.md Section 10).
const CHECK_IN_WINDOW_DAYS = 7;

function toPatientFailure(error: unknown): PatientFailure {
  if (typeof navigator !== "undefined" && !navigator.onLine) return new PatientFailure("network");
  // fetch() rejects with a TypeError when the network is unreachable.
  if (error instanceof TypeError) return new PatientFailure("network");
  return new PatientFailure("unknown");
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

// All patients connected to the signed-in doctor, most recent measurement first, read from the
// patient_details table. RLS is the security boundary; the doctor_id filter only narrows the
// rows the backend already allows.
export async function listMyPatients(): Promise<PatientListItem[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw toPatientFailure(sessionError);
  const doctorId = sessionData.session?.user.id;
  // The app layout guard only renders this page for a signed-in doctor.
  if (!doctorId) throw new PatientFailure("unknown");

  const { data, error } = await supabase
    .from("patient_details")
    .select("id, full_name, phone, connected_at, last_measured_at")
    .eq("doctor_id", doctorId)
    // Never-measured patients go last (CLAUDE.md Section 9).
    .order("last_measured_at", { ascending: false, nullsFirst: false });
  if (error) throw toPatientFailure(error);

  // measurements.patient_id references profiles, not patient_details, so the recent
  // measurements cannot be embedded and are read in a second query.
  const recentByPatient = await listRecentMeasuredAts(data.map((row) => row.id));

  return data.flatMap((row): PatientListItem[] => {
    // A row without a name cannot be shown.
    if (!row.full_name) return [];
    return [
      {
        id: row.id,
        fullName: row.full_name,
        phone: row.phone,
        connectedAt: row.connected_at,
        lastMeasuredAt: row.last_measured_at,
        // TODO(backend): read from the patient_flags view once it exists (CLAUDE.md Section 10).
        flag: null,
        // TODO: compute from medication_schedules and medication_logs once their schema is fixed.
        medicationCompliance: null,
        checkInCompliance: getCheckInCompliance(recentByPatient.get(row.id) ?? []),
      },
    ];
  });
}
