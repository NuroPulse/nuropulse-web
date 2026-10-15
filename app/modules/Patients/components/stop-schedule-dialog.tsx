import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { MedicationSchedule } from "../types";

type StopScheduleDialogProps = {
  // The schedule to stop; null closes the dialog.
  schedule: MedicationSchedule | null;
  patientName: string;
  onClose: () => void;
  onConfirm: (scheduleId: string) => void;
};

// Stopping sets is_active = false; schedules are never deleted, so past logs keep their dose.
export function StopScheduleDialog({ schedule, patientName, onClose, onConfirm }: StopScheduleDialogProps) {
  return (
    <Dialog open={schedule !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 rounded-2xl p-6 sm:max-w-md sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-h5 text-ink">Hentikan jadwal ini?</DialogTitle>
          <DialogDescription className="mt-2 text-b8 text-ink-muted">
            {schedule?.medicineName} untuk {patientName} tidak akan dijadwalkan lagi. Riwayat minum
            obat yang sudah ada tetap tersimpan.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-11 px-5 text-sh8">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              if (schedule) onConfirm(schedule.id);
              onClose();
            }}
            className="h-11 bg-danger px-5 text-sh8 text-primary-foreground hover:bg-danger/90"
          >
            Hentikan Jadwal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
