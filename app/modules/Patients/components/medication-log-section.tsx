import { CircleCheck, CircleMinus, CircleX, Clock, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { TablePagination } from "~/components/elements/table-pagination";
import { formatDayMonthTime, formatTimeOnly } from "~/lib/date";
import {
  deriveDoses,
  medicationComplianceRatio,
  toLocalDateKey,
  type DoseStatus,
  type ScheduleForDoses,
} from "~/lib/medication";
import { formatPercent } from "~/lib/number";
import { getComplianceBucket, type ComplianceBucket } from "~/lib/patient-status";
import { cn } from "~/lib/utils";
import type { MedicationLog, MedicationSchedule } from "../types";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

type LogRange = 7 | 30;

const doseStatusStyles: Record<DoseStatus, { label: string; icon: LucideIcon; className: string }> = {
  taken: { label: "Diminum", icon: CircleCheck, className: "bg-secondary-50 text-secondary-700" },
  skipped: { label: "Dilewati", icon: CircleMinus, className: "bg-surface-sunken text-ink-muted" },
  missed: { label: "Terlewat", icon: CircleX, className: "bg-warning-soft text-warning" },
  pending: { label: "Menunggu", icon: Clock, className: "bg-primary-50 text-primary-700" },
};

const bucketLabels: Record<ComplianceBucket, string> = { good: "Baik", fair: "Sedang", low: "Rendah" };

type MedicationLogSectionProps = {
  // All schedules, so past doses keep their medicine name.
  schedules: MedicationSchedule[];
  logs: MedicationLog[];
  now: Date;
};

export function MedicationLogSection({ schedules, logs, now }: MedicationLogSectionProps) {
  const [range, setRange] = useState<LogRange>(7);
  const [page, setPage] = useState(1);

  // A stopped schedule has no doses from now on, but its past doses still belong in the
  // history: count it as running until the day it was stopped (updated_at).
  const historySchedules = useMemo<ScheduleForDoses[]>(
    () =>
      schedules.map((schedule) => {
        if (schedule.isActive) return schedule;
        const stoppedOn = toLocalDateKey(new Date(schedule.updatedAt));
        const endDate = schedule.endDate && schedule.endDate < stoppedOn ? schedule.endDate : stoppedOn;
        return { ...schedule, isActive: true, endDate };
      }),
    [schedules],
  );

  const entries = useMemo(
    () => deriveDoses(historySchedules, logs, new Date(now.getTime() - range * DAY_MS), now),
    [historySchedules, logs, now, range],
  );

  // The summary always covers the last 7 days, whatever range the table shows.
  const weekCompliance = useMemo(
    () =>
      medicationComplianceRatio(
        deriveDoses(historySchedules, logs, new Date(now.getTime() - 7 * DAY_MS), now),
      ),
    [historySchedules, logs, now],
  );
  const weekBucket = getComplianceBucket(weekCompliance);

  const medicineBySchedule = new Map(schedules.map((schedule) => [schedule.id, schedule.medicineName]));
  const pageRows = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section
      id="riwayat-minum-obat"
      aria-labelledby="riwayat-minum-obat-title"
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-line bg-surface-raised"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-4">
        <div>
          <h2 id="riwayat-minum-obat-title" className="text-sh7 text-ink">
            Riwayat Minum Obat
          </h2>
          <p className="text-b9 text-ink-muted">
            Dicatat pasien di aplikasi. Terlewat = tidak ada catatan 2 jam setelah jadwal.
          </p>
        </div>
        <div role="group" aria-label="Rentang waktu" className="flex rounded-lg bg-surface-sunken p-1">
          {([7, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={range === days}
              onClick={() => {
                setRange(days);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sh9 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                range === days ? "bg-surface-raised text-primary-600 shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {days} Hari
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="px-6 pb-6 text-b8 text-ink-muted">Belum ada dosis terjadwal dalam rentang ini.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left">
              <thead className="bg-surface">
                <tr>
                  {["Jadwal", "Obat", "Status", "Waktu diminum"].map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 text-sh9 whitespace-nowrap text-ink-muted">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map((entry) => {
                  const { label, icon: Icon, className } = doseStatusStyles[entry.status];
                  return (
                    <tr key={`${entry.scheduleId}-${entry.scheduledAt.getTime()}`}>
                      <td className="px-4 py-3 text-sh9 whitespace-nowrap text-ink">
                        {formatDayMonthTime(entry.scheduledAt)}
                      </td>
                      <td className="px-4 py-3 text-b9 text-ink-muted">
                        {medicineBySchedule.get(entry.scheduleId) ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sh9 whitespace-nowrap",
                            className,
                          )}
                        >
                          <Icon aria-hidden="true" className="size-3.5" />
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                        {entry.takenAt ? formatTimeOnly(entry.takenAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={entries.length}
            itemLabel="dosis"
            label="Halaman riwayat minum obat"
            onPageChange={setPage}
          />
        </>
      )}

      <p className="border-t border-line px-6 py-3 text-b9 text-ink-muted">
        Kepatuhan obat 7 hari terakhir:{" "}
        <span className="text-sh9 text-ink">
          {weekCompliance === null || !weekBucket
            ? "belum ada dosis terjadwal"
            : `${formatPercent(weekCompliance)} (${bucketLabels[weekBucket]})`}
        </span>
      </p>
    </section>
  );
}
