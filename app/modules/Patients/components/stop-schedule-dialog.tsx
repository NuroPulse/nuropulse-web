import { CircleAlert, Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import { useStopSchedule } from "../hooks";
import { scheduleErrorText } from "../schedule-error-text";
import type { MedicationSchedule } from "../types";

type StopScheduleDialogProps = {
  patientId: string;
  // The schedule to stop; null closes the dialog.
  schedule: MedicationSchedule | null;
  patientName: string;
  onClose: () => void;
};

// Stopping sets is_active = false; schedules are never deleted, so past logs keep their dose.
export function StopScheduleDialog({ patientId, schedule, patientName, onClose }: StopScheduleDialogProps) {
  const stopSchedule = useStopSchedule(patientId);
  const { reset: resetStop } = stopSchedule;

  useEffect(() => {
    if (schedule) resetStop();
  }, [schedule, resetStop]);

  function handleOpenChange(open: boolean) {
    // Keep the dialog open while saving so the result is not lost.
    if (!open && !stopSchedule.isPending) onClose();
  }

  function handleConfirm() {
    if (!schedule) return;
    stopSchedule.mutate(schedule.id, {
      onSuccess: () => {
        toast.success("Jadwal dihentikan.");
        onClose();
      },
    });
  }

  return (
    <Dialog open={schedule !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 sm:max-w-md sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-h5 text-ink">Hentikan jadwal ini?</DialogTitle>
          <DialogDescription className="mt-2 text-b8 text-ink-muted">
            {schedule?.medicineName} untuk {patientName} tidak akan dijadwalkan lagi. Riwayat minum
            obat yang sudah ada tetap tersimpan.
          </DialogDescription>
        </DialogHeader>
        {stopSchedule.error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
            <p className="text-b8 text-danger">{scheduleErrorText(stopSchedule.error.code)}</p>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={stopSchedule.isPending}
              className="h-11 px-5 text-sh8"
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={stopSchedule.isPending}
            aria-busy={stopSchedule.isPending}
            className="h-11 gap-2 bg-danger px-5 text-sh8 text-primary-foreground hover:bg-danger/90"
          >
            {stopSchedule.isPending && <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />}
            Hentikan Jadwal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
