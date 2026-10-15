// TEMPORARY sample data. Replace with Supabase queries (backend team).
// Shared by the Dashboard and the patient pages so their numbers match. It lives in lib/ only
// because two modules need it; delete this file once the real queries exist.

import type { FlagReason } from "./patient-status";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Same shape as PatientListItem in modules/Patients/types.ts (lib/ does not import modules/).
export type SamplePatient = {
  id: string;
  fullName: string;
  phone: string;
  connectedAt: string | null;
  lastMeasuredAt: string | null;
  flag: { reason: FlagReason } | null;
  medicationCompliance: number | null;
  checkInCompliance: number;
};

// Fictional patients. Times are relative to "now" so each patient keeps the activity status
// it was written for, whatever day the app is opened.
export function buildSamplePatients(now: Date): SamplePatient[] {
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const tremor = (detectedCount: number) => ({ reason: { kind: "tremor_pattern" as const, detectedCount } });
  const lowMedication = { reason: { kind: "medication_compliance" as const } };

  return [
    { id: "sample-01", fullName: "Budi Santoso", phone: "+6281234567890", connectedAt: ago(90 * DAY_MS), lastMeasuredAt: ago(5 * HOUR_MS), flag: tremor(4), medicationCompliance: 0.86, checkInCompliance: 1 },
    { id: "sample-02", fullName: "Siti Rahmawati", phone: "+6281322104471", connectedAt: ago(60 * DAY_MS), lastMeasuredAt: ago(6 * HOUR_MS), flag: lowMedication, medicationCompliance: 0.38, checkInCompliance: 0.86 },
    { id: "sample-03", fullName: "Agus Pratama", phone: "+6285711882034", connectedAt: ago(45 * DAY_MS), lastMeasuredAt: ago(4 * DAY_MS), flag: tremor(3), medicationCompliance: 0.71, checkInCompliance: 0.43 },
    { id: "sample-04", fullName: "Dewi Lestari", phone: "+6282177310092", connectedAt: ago(40 * DAY_MS), lastMeasuredAt: ago(16 * HOUR_MS), flag: null, medicationCompliance: 0.95, checkInCompliance: 1 },
    { id: "sample-05", fullName: "Hendra Wijaya", phone: "+6287855201180", connectedAt: ago(70 * DAY_MS), lastMeasuredAt: ago(5 * DAY_MS), flag: null, medicationCompliance: 0.62, checkInCompliance: 0.29 },
    { id: "sample-06", fullName: "Rina Marlina", phone: "+6281299023317", connectedAt: ago(35 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: null, medicationCompliance: 0.81, checkInCompliance: 0.86 },
    { id: "sample-07", fullName: "Joko Susilo", phone: "+6285644712209", connectedAt: ago(80 * DAY_MS), lastMeasuredAt: ago(16 * DAY_MS), flag: null, medicationCompliance: 0.2, checkInCompliance: 0 },
    { id: "sample-08", fullName: "Sri Wahyuni", phone: "+6281133076612", connectedAt: ago(4 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-09", fullName: "Andi Kurniawan", phone: "+6281245678901", connectedAt: ago(55 * DAY_MS), lastMeasuredAt: ago(2 * HOUR_MS), flag: null, medicationCompliance: 0.9, checkInCompliance: 1 },
    { id: "sample-10", fullName: "Lukas Halim", phone: "+6281366120045", connectedAt: ago(50 * DAY_MS), lastMeasuredAt: ago(6 * DAY_MS), flag: null, medicationCompliance: 0.55, checkInCompliance: 0.14 },
    { id: "sample-11", fullName: "Maria Ulfa", phone: "+6285233419087", connectedAt: ago(30 * DAY_MS), lastMeasuredAt: ago(2 * DAY_MS), flag: tremor(3), medicationCompliance: 0.79, checkInCompliance: 0.71 },
    { id: "sample-12", fullName: "Yusuf Hidayat", phone: "+6281277458830", connectedAt: ago(100 * DAY_MS), lastMeasuredAt: ago(30 * DAY_MS), flag: null, medicationCompliance: 0.1, checkInCompliance: 0 },
    { id: "sample-13", fullName: "Nur Aini", phone: "+6287812094456", connectedAt: ago(25 * DAY_MS), lastMeasuredAt: ago(20 * HOUR_MS), flag: lowMedication, medicationCompliance: 0.45, checkInCompliance: 0.57 },
    { id: "sample-14", fullName: "Bambang Suryadi", phone: "+6281390875521", connectedAt: ago(65 * DAY_MS), lastMeasuredAt: ago(9 * DAY_MS), flag: null, medicationCompliance: 0.6, checkInCompliance: 0 },
    { id: "sample-15", fullName: "Fitri Handayani", phone: "+6285798762310", connectedAt: ago(20 * DAY_MS), lastMeasuredAt: ago(10 * HOUR_MS), flag: null, medicationCompliance: 1, checkInCompliance: 0.86 },
    { id: "sample-16", fullName: "Rudi Hartono", phone: "+6281211223344", connectedAt: ago(18 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-17", fullName: "Wulan Sari", phone: "+6282133445566", connectedAt: ago(2 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-18", fullName: "Teguh Prasetyo", phone: "+6281355667788", connectedAt: ago(75 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: tremor(5), medicationCompliance: 0.68, checkInCompliance: 0.71 },
    { id: "sample-19", fullName: "Ayu Lestari", phone: "+6285677889900", connectedAt: ago(45 * DAY_MS), lastMeasuredAt: ago(3 * HOUR_MS), flag: null, medicationCompliance: 0.88, checkInCompliance: 1 },
    { id: "sample-20", fullName: "Dimas Saputra", phone: "+6281299887766", connectedAt: ago(85 * DAY_MS), lastMeasuredAt: ago(21 * DAY_MS), flag: null, medicationCompliance: 0.3, checkInCompliance: 0 },
    { id: "sample-21", fullName: "Lina Marlina", phone: "+6287766554433", connectedAt: ago(15 * DAY_MS), lastMeasuredAt: ago(12 * HOUR_MS), flag: null, medicationCompliance: 0.92, checkInCompliance: 0.71 },
    { id: "sample-22", fullName: "Eko Saputro", phone: "+6281344332211", connectedAt: ago(28 * DAY_MS), lastMeasuredAt: ago(8 * HOUR_MS), flag: null, medicationCompliance: null, checkInCompliance: 0.57 },
    { id: "sample-23", fullName: "Ratna Dewi", phone: "+6285611223344", connectedAt: ago(33 * DAY_MS), lastMeasuredAt: ago(7 * DAY_MS), flag: lowMedication, medicationCompliance: 0.42, checkInCompliance: 0.14 },
    { id: "sample-24", fullName: "Gilang Ramadhan", phone: "+6281277665544", connectedAt: ago(12 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: null, medicationCompliance: 0.75, checkInCompliance: 0.86 },
    { id: "sample-25", fullName: "Putri Ayuningtyas", phone: "+6282155443322", connectedAt: ago(38 * DAY_MS), lastMeasuredAt: ago(15 * HOUR_MS), flag: null, medicationCompliance: 0.83, checkInCompliance: 1 },
  ];
}
