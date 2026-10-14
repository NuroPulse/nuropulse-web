import type { Route } from "./+types/medicines";
import { MedicineListPage } from "~/modules/Medicines";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daftar Obat | NuroPulse" }];
}

export default function MedicinesRoute() {
  return <MedicineListPage />;
}
