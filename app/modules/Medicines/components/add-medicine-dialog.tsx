import { CircleAlert, Info, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useAddMedicine } from "../hooks";
import type { MedicineFieldErrors, NewMedicineInput } from "../types";
import { validateNewMedicine } from "../validation";

type AddMedicineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyValues: NewMedicineInput = { name: "", commonDosage: "", notes: "" };

const fieldErrorText: Record<keyof NewMedicineInput, Record<"required" | "too_long", string>> = {
  name: {
    required: "Nama obat wajib diisi.",
    too_long: "Nama obat maksimal 120 karakter.",
  },
  commonDosage: {
    required: "Dosis umum wajib diisi.",
    too_long: "Dosis umum maksimal 1000 karakter.",
  },
  notes: {
    required: "",
    too_long: "Catatan maksimal 1000 karakter.",
  },
};

const inputClassName = "px-3 text-b7 md:text-b7";

export function AddMedicineDialog({ open, onOpenChange }: AddMedicineDialogProps) {
  const [values, setValues] = useState<NewMedicineInput>(emptyValues);
  const [errors, setErrors] = useState<MedicineFieldErrors>({});
  const addMedicine = useAddMedicine();

  function reset() {
    setValues(emptyValues);
    setErrors({});
    addMedicine.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    // Keep the dialog open while saving so the result is not lost.
    if (!nextOpen && addMedicine.isPending) return;
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function updateField(field: keyof NewMedicineInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateNewMedicine(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addMedicine.mutate(
      { ...values, name: values.name.trim() },
      {
        onSuccess: () => {
          toast.success("Obat ditambahkan.");
          reset();
          onOpenChange(false);
        },
      },
    );
  }

  const failure = addMedicine.error;
  const duplicateName = failure?.code === "medicine_duplicate";
  const nameError = duplicateName
    ? "Obat dengan nama ini sudah ada."
    : errors.name && fieldErrorText.name[errors.name];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 sm:max-w-lg sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-h5 text-primary-600">Tambah Obat</DialogTitle>
          <DialogDescription className="sr-only">
            Tambahkan obat baru ke katalog bersama semua dokter.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {failure && !duplicateName && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
              <p className="text-b8 text-danger">
                {failure.code === "forbidden"
                  ? "Anda tidak memiliki akses untuk menambah obat."
                  : failure.code === "network"
                    ? "Tidak ada koneksi internet. Coba lagi."
                    : "Terjadi kesalahan. Silakan coba lagi."}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="medicine-name" className="text-sh8 text-ink">
              Nama obat
            </Label>
            <Input
              id="medicine-name"
              placeholder="Contoh: Levodopa/Karbidopa"
              value={values.name}
              onChange={(event) => {
                updateField("name", event.target.value);
                if (duplicateName) addMedicine.reset();
              }}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "medicine-name-error" : undefined}
              className={`h-11 ${inputClassName}`}
            />
            {nameError && (
              <p id="medicine-name-error" className="text-b9 text-danger">
                {nameError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="medicine-common-dosage" className="text-sh8 text-ink">
              Dosis umum
            </Label>
            <Textarea
              id="medicine-common-dosage"
              placeholder="Teks referensi dosis umum"
              rows={3}
              value={values.commonDosage}
              onChange={(event) => updateField("commonDosage", event.target.value)}
              aria-invalid={errors.commonDosage ? true : undefined}
              aria-describedby={
                errors.commonDosage
                  ? "medicine-common-dosage-hint medicine-common-dosage-error"
                  : "medicine-common-dosage-hint"
              }
              className={`min-h-20 ${inputClassName}`}
            />
            <p id="medicine-common-dosage-hint" className="text-b9 text-ink-muted">
              Hanya referensi untuk dokter lain, bukan dosis pasien.
            </p>
            {errors.commonDosage && (
              <p id="medicine-common-dosage-error" className="text-b9 text-danger">
                {fieldErrorText.commonDosage[errors.commonDosage]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="medicine-notes" className="text-sh8 text-ink">
              Catatan <span className="text-b8 text-ink-muted">(opsional)</span>
            </Label>
            <Textarea
              id="medicine-notes"
              placeholder="Catatan tambahan"
              rows={3}
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              aria-invalid={errors.notes ? true : undefined}
              aria-describedby={errors.notes ? "medicine-notes-error" : undefined}
              className={`min-h-20 ${inputClassName}`}
            />
            {errors.notes && (
              <p id="medicine-notes-error" className="text-b9 text-danger">
                {fieldErrorText.notes[errors.notes]}
              </p>
            )}
          </div>

          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-success bg-success-soft p-3"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-b9 text-ink">
              Obat langsung tersedia untuk semua dokter setelah disimpan.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={addMedicine.isPending}
                className="h-11 px-5 text-sh8"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={addMedicine.isPending}
              aria-busy={addMedicine.isPending}
              className="h-11 gap-2 px-5 text-sh8"
            >
              {addMedicine.isPending && (
                <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />
              )}
              Simpan Obat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
