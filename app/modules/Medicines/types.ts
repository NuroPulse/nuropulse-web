export type Medicine = {
  id: string;
  name: string;
  // Free-text reference only; never the dose a patient takes (data contract).
  commonDosage: string;
  notes: string | null;
  createdBy: string | null;
  // Display name of the doctor who added it; null when it cannot be read.
  createdByName: string | null;
  createdAt: string;
};

// One active schedule of the signed-in doctor's patient that uses a medicine.
export type MedicineUsage = {
  scheduleId: string;
  patientId: string;
  patientName: string;
  dose: string;
  // "HH:MM", ascending.
  times: string[];
};

export type MedicineListParams = {
  search: string;
  page: number;
};

export type MedicineListResult = {
  items: Medicine[];
  total: number;
};

export type NewMedicineInput = {
  name: string;
  commonDosage: string;
  notes: string;
};

export type MedicineErrorCode = "medicine_duplicate" | "forbidden" | "network" | "unknown";

// Typed error thrown by api.ts; the UI maps `code` to Indonesian text.
export class MedicineFailure extends Error {
  readonly code: MedicineErrorCode;

  constructor(code: MedicineErrorCode) {
    super(code);
    this.name = "MedicineFailure";
    this.code = code;
  }
}

export type MedicineFieldErrorCode = "required" | "too_long";

export type MedicineFieldErrors = Partial<Record<keyof NewMedicineInput, MedicineFieldErrorCode>>;
