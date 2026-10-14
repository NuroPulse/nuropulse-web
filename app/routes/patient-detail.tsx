import type { Route } from "./+types/patient-detail";
import { PatientDetailPage } from "~/modules/Patients";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Detail Pasien | NuroPulse" }];
}

export default function PatientDetailRoute() {
  return <PatientDetailPage />;
}
