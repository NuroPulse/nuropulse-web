import { Calendar, CircleStop, Clock, Pencil, Pill, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { formatClockTime, formatDateOnly } from "~/lib/date";
import type { MedicationSchedule, NewScheduleInput } from "../types";
import { AddScheduleDialog } from "./add-schedule-dialog";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { StopScheduleDialog } from "./stop-schedule-dialog";

type ScheduleSectionProps = {
  patientName: string;
  // Active schedules only.
  schedules: MedicationSchedule[];
  onAdd: (input: NewScheduleInput, medicineName: string) => void;
  onUpdate: (scheduleId: string, changes: { endDate: string | null; instructions: string | null }) => void;
  onStop: (scheduleId: string) => void;
};

export function ScheduleSection({ patientName, schedules, onAdd, onUpdate, onStop }: ScheduleSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MedicationSchedule | null>(null);
  const [stopping, setStopping] = useState<MedicationSchedule | null>(null);

  return (
    <section
      id="jadwal-obat"
      aria-labelledby="jadwal-obat-title"
      className="scroll-mt-6 rounded-2xl border border-line bg-surface-raised p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="jadwal-obat-title" className="text-sh7 text-ink">
            Jadwal Obat
          </h2>
          <p className="text-b9 text-ink-muted">Jadwal aktif yang Anda atur untuk pasien ini</p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)} className="h-11 gap-2 px-5 text-sh8">
          <Plus aria-hidden="true" className="size-4.5" />
          Tambah Jadwal
        </Button>
      </div>

      {schedules.length === 0 ? (
        <p className="mt-6 text-b8 text-ink-muted">Belum ada jadwal obat aktif untuk pasien ini.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="flex flex-wrap items-start gap-4 py-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
                <Pill aria-hidden="true" className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sh7 text-ink">{schedule.medicineName}</p>
                <p className="text-b9 text-ink-muted">
                  Dosis per minum: <span className="text-sh9 text-ink">{schedule.dose}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-b9 text-ink-muted">Jam minum</span>
                  {schedule.times.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-sh9 text-primary-700"
                    >
                      <Clock aria-hidden="true" className="size-3.5" />
                      {formatClockTime(time)}
                    </span>
                  ))}
                </div>

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-b9 text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar aria-hidden="true" className="size-3.5" />
                    Mulai {formatDateOnly(schedule.startDate)}
                  </span>
                  <span>
                    Selesai: {schedule.endDate ? formatDateOnly(schedule.endDate) : "Tanpa batas"}
                  </span>
                </p>
                {schedule.instructions && (
                  <p className="mt-1 text-b9 text-ink">{schedule.instructions}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(schedule)}
                  className="h-9 gap-1.5 border px-3 text-sh9"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Ubah
                  <span className="sr-only">{schedule.medicineName}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStopping(schedule)}
                  className="h-9 gap-1.5 border border-danger px-3 text-sh9 text-danger hover:bg-danger-soft hover:text-danger"
                >
                  <CircleStop aria-hidden="true" className="size-4" />
                  Hentikan Jadwal
                  <span className="sr-only">{schedule.medicineName}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddScheduleDialog open={addOpen} onOpenChange={setAddOpen} patientName={patientName} onSubmit={onAdd} />
      <EditScheduleDialog schedule={editing} onClose={() => setEditing(null)} onSubmit={onUpdate} />
      <StopScheduleDialog
        schedule={stopping}
        patientName={patientName}
        onClose={() => setStopping(null)}
        onConfirm={onStop}
      />
    </section>
  );
}
