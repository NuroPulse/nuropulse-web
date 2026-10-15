import type { MedicineFieldErrors, NewMedicineInput } from "./types";

// Limits from CLAUDE.md Section 4 (Medicine).
export const MEDICINE_NAME_MAX = 120;
export const MEDICINE_TEXT_MAX = 1000;

export function validateNewMedicine(values: NewMedicineInput): MedicineFieldErrors {
  const errors: MedicineFieldErrors = {};
  const name = values.name.trim();
  const commonDosage = values.commonDosage.trim();

  if (!name) errors.name = "required";
  else if (name.length > MEDICINE_NAME_MAX) errors.name = "too_long";

  if (!commonDosage) errors.commonDosage = "required";
  else if (commonDosage.length > MEDICINE_TEXT_MAX) errors.commonDosage = "too_long";

  if (values.notes.trim().length > MEDICINE_TEXT_MAX) errors.notes = "too_long";

  return errors;
}
