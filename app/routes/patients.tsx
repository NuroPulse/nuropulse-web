import type { Route } from "./+types/patients";
import { PatientListPage } from "~/modules/Patients";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daftar Pasien | NuroPulse" }];
}

export default function PatientsRoute() {
  return <PatientListPage />;
}
