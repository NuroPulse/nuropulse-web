import {
  MedicineFailure,
  type Medicine,
  type MedicineListParams,
  type MedicineListResult,
  type MedicineUsage,
  type NewMedicineInput,
} from "./types";

// TODO(backend): replace the in-memory sample data below with Supabase queries once the
// backend fixes the medicines schema (see the report in the conversation). Keep these
// function signatures so hooks.ts and the components do not change.

export const MEDICINES_PAGE_SIZE = 20;

// Sample data only. Names are fictional.
const sampleMedicines: Medicine[] = [
  {
    id: "sample-levodopa",
    name: "Levodopa/Karbidopa",
    commonDosage: "Teks referensi dosis umum yang ditulis dokter saat menambahkan obat ini.",
    notes: "Catatan dari dokter yang menambahkan.",
    createdBy: "sample-doctor-vanka",
    createdByName: "dr. Vanka",
    createdAt: "2026-09-02T03:00:00Z",
  },
  {
    id: "sample-pramipeksol",
    name: "Pramipeksol",
    commonDosage: "Teks referensi dosis umum",
    notes: null,
    createdBy: "sample-doctor-andi",
    createdByName: "dr. Andi",
    createdAt: "2026-09-03T03:00:00Z",
  },
  {
    id: "sample-ropinirol",
    name: "Ropinirol",
    commonDosage: "Teks referensi dosis umum",
    notes: "Catatan dari dokter yang menambahkan.",
    createdBy: "sample-doctor-vanka",
    createdByName: "dr. Vanka",
    createdAt: "2026-09-04T03:00:00Z",
  },
  {
    id: "sample-rasagilin",
    name: "Rasagilin",
    commonDosage: "Teks referensi dosis umum",
    notes: null,
    createdBy: "sample-doctor-tania",
    createdByName: "dr. Tania",
    createdAt: "2026-09-05T03:00:00Z",
  },
  {
    id: "sample-amantadin",
    name: "Amantadin",
    commonDosage: "Teks referensi dosis umum",
    notes: "Catatan dari dokter yang menambahkan.",
    createdBy: "sample-doctor-zika",
    createdByName: "dr. Zika",
    createdAt: "2026-09-06T03:00:00Z",
  },
  {
    id: "sample-triheksifenidil",
    name: "Triheksifenidil",
    commonDosage: "Teks referensi dosis umum",
    notes: null,
    createdBy: "sample-doctor-athaya",
    createdByName: "dr. Athaya",
    createdAt: "2026-09-07T03:00:00Z",
  },
];

const sampleUsage: Record<string, MedicineUsage[]> = {
  "sample-levodopa": [
    {
      scheduleId: "sample-schedule-1",
      patientId: "sample-patient-budi",
      patientName: "Budi Santoso",
      dose: "1 tablet",
      times: ["07:00", "13:00", "19:00"],
    },
    {
      scheduleId: "sample-schedule-2",
      patientId: "sample-patient-dewi",
      patientName: "Dewi Lestari",
      dose: "1 tablet",
      times: ["08:00", "20:00"],
    },
    {
      scheduleId: "sample-schedule-3",
      patientId: "sample-patient-rina",
      patientName: "Rina Marlina",
      dose: "½ tablet",
      times: ["07:00"],
    },
  ],
};

export async function listMedicines({ search, page }: MedicineListParams): Promise<MedicineListResult> {
  const term = search.trim().toLowerCase();
  const matches = sampleMedicines
    .filter((medicine) => medicine.name.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
  const start = (page - 1) * MEDICINES_PAGE_SIZE;
  return { items: matches.slice(start, start + MEDICINES_PAGE_SIZE), total: matches.length };
}

export async function getMedicine(id: string): Promise<Medicine | null> {
  return sampleMedicines.find((medicine) => medicine.id === id) ?? null;
}

// Active schedules of the signed-in doctor's own patients that use this medicine.
export async function listMedicineUsage(medicineId: string): Promise<MedicineUsage[]> {
  return sampleUsage[medicineId] ?? [];
}

export async function addMedicine(input: NewMedicineInput): Promise<Medicine> {
  const name = input.name.trim();
  // Mirrors the database rule: names are unique ignoring case.
  if (sampleMedicines.some((medicine) => medicine.name.toLowerCase() === name.toLowerCase())) {
    throw new MedicineFailure("medicine_duplicate");
  }
  const medicine: Medicine = {
    id: `sample-${Date.now()}`,
    name,
    commonDosage: input.commonDosage.trim(),
    notes: input.notes.trim() || null,
    createdBy: null,
    createdByName: "Anda",
    createdAt: new Date().toISOString(),
  };
  sampleMedicines.push(medicine);
  return medicine;
}

// Ready for the Supabase version (CLAUDE.md Section 4, "Backend error codes"):
// Postgres codes come back from Supabase, not the contract names.
export function toMedicineFailure(error: { code?: string } | null | undefined): MedicineFailure {
  if (typeof navigator !== "undefined" && !navigator.onLine) return new MedicineFailure("network");
  switch (error?.code) {
    case "23505":
      return new MedicineFailure("medicine_duplicate");
    case "42501":
      return new MedicineFailure("forbidden");
    default:
      return new MedicineFailure("unknown");
  }
}
