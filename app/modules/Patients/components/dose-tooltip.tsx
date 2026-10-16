import { formatDayMonthTime, formatTimeOnly } from "~/lib/date";
import { doseStatusStyles } from "../dose-status";
import type { DoseMarker } from "../types";

export function DoseTooltip({ dose }: { dose: DoseMarker }) {
  const { label, icon: Icon } = doseStatusStyles[dose.status];
  return (
    <div className="flex min-w-44 flex-col gap-1 rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-card">
      <p className="flex items-center gap-1.5 text-sh9 text-ink">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </p>
      <p className="text-b9 text-ink-muted">{dose.medicineName}</p>
      <p className="text-b9 text-ink-muted">Jadwal {formatDayMonthTime(dose.scheduledAt)}</p>
      {dose.takenAt && <p className="text-b9 text-ink-muted">Diminum {formatTimeOnly(dose.takenAt)}</p>}
    </div>
  );
}
