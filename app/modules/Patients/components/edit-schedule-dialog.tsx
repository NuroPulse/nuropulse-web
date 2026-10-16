import { CircleAlert, Info, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
import { isEndBeforeStart } from "~/lib/medication";
import { useUpdateSchedule } from "../hooks";
import { scheduleErrorText } from "../schedule-error-text";
import type { MedicationSchedule } from "../types";

const TEXT_MAX = 1000;

type EditScheduleDialogProps = {
  patientId: string;
  // The schedule being edited; null closes the dialog.
  schedule: MedicationSchedule | null;
  onClose: () => void;
};

// Only end_date and instructions may change in place (data contract). A different
// medicine, dose, or times means stopping this schedule and creating a new one.
export function EditScheduleDialog({ patientId, schedule, onClose }: EditScheduleDialogProps) {
  const [endDate, setEndDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errors, setErrors] = useState<{ endDate?: string; instructions?: string }>({});
  const updateSchedule = useUpdateSchedule(patientId);
  const { reset: resetUpdate } = updateSchedule;

  useEffect(() => {
    if (!schedule) return;
    setEndDate(schedule.endDate ?? "");
    setInstructions(schedule.instructions ?? "");
    setErrors({});
    resetUpdate();
  }, [schedule, resetUpdate]);

  function handleOpenChange(open: boolean) {
    // Keep the dialog open while saving so the result is not lost.
    if (!open && !updateSchedule.isPending) onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schedule) return;
    const nextErrors: typeof errors = {};
    if (isEndBeforeStart(schedule.startDate, endDate || null)) {
      nextErrors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }
    if (instructions.trim().length > TEXT_MAX) nextErrors.instructions = "Instruksi maksimal 1000 karakter.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    updateSchedule.mutate(
      {
        scheduleId: schedule.id,
        changes: { endDate: endDate || null, instructions: instructions.trim() || null },
      },
      {
        onSuccess: () => {
          toast.success("Jadwal diperbarui.");
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={schedule !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 sm:max-w-lg sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-h5 text-primary-600">Ubah Jadwal</DialogTitle>
          <DialogDescription className="text-b9 text-ink-muted">
            {schedule?.medicineName} · {schedule?.dose}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {updateSchedule.error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
              <p className="text-b8 text-danger">{scheduleErrorText(updateSchedule.error.code)}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-schedule-end" className="text-sh8 text-ink">
              Tanggal selesai <span className="text-b8 text-ink-muted">(opsional)</span>
            </Label>
            <Input
              id="edit-schedule-end"
              type="date"
              min={schedule?.startDate}
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setErrors(({ endDate: _cleared, ...rest }) => rest);
              }}
              aria-invalid={errors.endDate ? true : undefined}
              aria-describedby={errors.endDate ? "edit-schedule-end-error" : "edit-schedule-end-hint"}
              className="h-11 px-3 text-b7 md:text-b7"
            />
            {errors.endDate ? (
              <p id="edit-schedule-end-error" className="text-b9 text-danger">
                {errors.endDate}
              </p>
            ) : (
              <p id="edit-schedule-end-hint" className="text-b9 text-ink-muted">
                Kosongkan untuk tanpa batas.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-schedule-instructions" className="text-sh8 text-ink">
              Instruksi <span className="text-b8 text-ink-muted">(opsional)</span>
            </Label>
            <Textarea
              id="edit-schedule-instructions"
              placeholder="Contoh: sesudah makan"
              rows={3}
              value={instructions}
              onChange={(event) => {
                setInstructions(event.target.value);
                setErrors(({ instructions: _cleared, ...rest }) => rest);
              }}
              aria-invalid={errors.instructions ? true : undefined}
              aria-describedby={errors.instructions ? "edit-schedule-instructions-error" : undefined}
              className="min-h-20 px-3 text-b7 md:text-b7"
            />
            {errors.instructions && (
              <p id="edit-schedule-instructions-error" className="text-b9 text-danger">
                {errors.instructions}
              </p>
            )}
          </div>

          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-success bg-success-soft p-3"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-b9 text-ink">
              Untuk mengganti obat, dosis, atau jam minum, hentikan jadwal ini lalu buat jadwal baru.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={updateSchedule.isPending}
                className="h-11 px-5 text-sh8"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={updateSchedule.isPending}
              aria-busy={updateSchedule.isPending}
              className="h-11 gap-2 px-5 text-sh8"
            >
              {updateSchedule.isPending && <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
