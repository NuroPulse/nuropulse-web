export { PatientDetailPage } from "./components/patient-detail-page";
export { PatientListPage } from "./components/patient-list-page";
// The Dashboard overview reads the same patient list (with flags and compliance) as Daftar
// Pasien, so both share one query and one cache entry.
export { useMyPatients } from "./hooks";
export type { PatientFailure, PatientListItem } from "./types";
