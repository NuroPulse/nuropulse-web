import type { Route } from "./+types/medicine-detail";
import { MedicineDetailPage } from "~/modules/Medicines";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Detail Obat | NuroPulse" }];
}

export default function MedicineDetailRoute() {
  return <MedicineDetailPage />;
}
