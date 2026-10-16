import { Calendar, CircleStop, Clock, Pencil, Pill, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatClockTime, formatDateOnly } from "~/lib/date";
import { useSchedules } from "../hooks";
import type { MedicationSchedule } from "../types";
import { AddScheduleDialog } from "./add-schedule-dialog";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { StopScheduleDialog } from "./stop-schedule-dialog";

type ScheduleSectionProps = {
  patientId: string;
  patientName: string;
};

export function ScheduleSection({ patientId, patientName }: ScheduleSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MedicationSchedule | null>(null);
  const [stopping, setStopping] = useState<MedicationSchedule | null>(null);
  const schedulesQuery = useSchedules(patientId);

  let body: ReactNode;

  if (schedulesQuery.isPending) {
    body = (
      <div aria-busy="true" className="mt-4 flex flex-col gap-3">
        <span className="sr-only">Memuat…</span>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  } else if (schedulesQuery.isError) {
    body = (
      <div role="alert" className="mt-6 flex flex-col items-start gap-3">
        <p className="text-b8 text-ink">
          {schedulesQuery.error.code === "network"
            ? "Tidak ada koneksi internet. Coba lagi."
            : "Terjadi kesalahan. Silakan coba lagi."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => schedulesQuery.refetch()}
          className="h-10 px-4 text-sh8"
        >
          Coba lagi
        </Button>
      </div>
    );
  } else {
    // The query also returns stopped schedules, which the medication log needs for past doses;
    // this card lists only the ones still running.
    const schedules = schedulesQuery.data.filter((schedule) => schedule.isActive);
    body = schedules.length === 0 ? (
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
    );
  }

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

      {body}

      <AddScheduleDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        patientId={patientId}
        patientName={patientName}
      />
      <EditScheduleDialog patientId={patientId} schedule={editing} onClose={() => setEditing(null)} />
      <StopScheduleDialog
        patientId={patientId}
        schedule={stopping}
        patientName={patientName}
        onClose={() => setStopping(null)}
      />
    </section>
  );
}
