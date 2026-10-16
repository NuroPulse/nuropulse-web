import { supabase } from "~/lib/supabase";
import type { Tables } from "~/lib/database.types";
import {
  MedicineFailure,
  type Medicine,
  type MedicineListParams,
  type MedicineListResult,
  type MedicineUsage,
  type NewMedicineInput,
} from "./types";

export const MEDICINES_PAGE_SIZE = 20;

const MEDICINE_COLUMNS = "id, name, common_dosage, notes, created_by, created_by_name, created_at";

type MedicineRow = Pick<
  Tables<"medicines">,
  "id" | "name" | "common_dosage" | "notes" | "created_by" | "created_by_name" | "created_at"
>;

function toMedicine(row: MedicineRow): Medicine {
  return {
    id: row.id,
    name: row.name,
    commonDosage: row.common_dosage,
    notes: row.notes,
    createdBy: row.created_by,
    createdByName: row.created_by_name ?? null,
    createdAt: row.created_at,
  };
}

// First word of the full name. Profile names never carry a title such as "dr.".
export function getFirstName(fullName: string): string | null {
  return fullName.trim().split(/\s+/)[0] || null;
}

// Escapes the LIKE wildcards so a search for "50%" matches literally.
function escapeLikePattern(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

export async function listMedicines({ search, page }: MedicineListParams): Promise<MedicineListResult> {
  const term = search.trim();
  const start = (page - 1) * MEDICINES_PAGE_SIZE;

  let query = supabase
    .from("medicines")
    .select(MEDICINE_COLUMNS, { count: "exact" })
    .order("name", { ascending: true })
    .range(start, start + MEDICINES_PAGE_SIZE - 1);
  if (term) query = query.ilike("name", `%${escapeLikePattern(term)}%`);

  const { data, error, count } = await query;
  if (error) throw toMedicineFailure(error);
  return { items: data.map(toMedicine), total: count ?? data.length };
}

export async function getMedicine(id: string): Promise<Medicine | null> {
  const { data, error } = await supabase
    .from("medicines")
    .select(MEDICINE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  // 22P02: the id in the URL is not a valid uuid, so no such medicine exists.
  if (error?.code === "22P02") return null;
  if (error) throw toMedicineFailure(error);
  return data ? toMedicine(data) : null;
}

// Active schedules of the signed-in doctor's own patients that use this medicine.
// TODO: query medication_schedules once its schema matches the contract
// (the generated `times` column is text, the contract says text[]).
export async function listMedicineUsage(_medicineId: string): Promise<MedicineUsage[]> {
  return [];
}

export async function addMedicine(input: NewMedicineInput): Promise<Medicine> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw toMedicineFailure(sessionError);
  const doctorId = sessionData.session?.user.id;
  // The app layout guard only renders this page for a signed-in doctor.
  if (!doctorId) throw new MedicineFailure("unknown");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", doctorId)
    .maybeSingle();
  if (profileError) throw toMedicineFailure(profileError);

  // created_by is set by the backend; created_by_name is the label other doctors see.
  const firstName = profile?.full_name ? getFirstName(profile.full_name) : null;
  const { data, error } = await supabase
    .from("medicines")
    .insert({
      name: input.name.trim(),
      common_dosage: input.commonDosage.trim(),
      notes: input.notes.trim() || null,
      created_by_name: firstName ? `dr. ${firstName}` : null,
    })
    .select(MEDICINE_COLUMNS)
    .single();
  if (error) throw toMedicineFailure(error);
  return toMedicine(data);
}

// Postgres codes come back from Supabase, not the contract names
// (CLAUDE.md Section 4, "Backend error codes").
export function toMedicineFailure(error: unknown): MedicineFailure {
  if (typeof navigator !== "undefined" && !navigator.onLine) return new MedicineFailure("network");
  // fetch() rejects with a TypeError when the network is unreachable.
  if (error instanceof TypeError) return new MedicineFailure("network");
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  switch (code) {
    case "23505":
      return new MedicineFailure("medicine_duplicate");
    case "42501":
      return new MedicineFailure("forbidden");
    default:
      return new MedicineFailure("unknown");
  }
}
