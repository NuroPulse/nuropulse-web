import { Activity, CircleMinus } from "lucide-react";

import type { MeasurementStatus } from "~/lib/patient-status";
import { cn } from "~/lib/utils";

// The single place that maps a measurement status to its label (CLAUDE.md Section 8).
// Neutral badges only, never red or green, and always text plus an icon. The labels describe
// one measurement, never the patient.
const statusStyles = {
  tremor: {
    label: "Pola tremor terdeteksi",
    icon: Activity,
    className: "bg-primary-50 text-primary-800",
  },
  none: {
    label: "Pola tremor tidak terdeteksi",
    icon: CircleMinus,
    className: "bg-surface-sunken text-ink-muted",
  },
} satisfies Record<MeasurementStatus, unknown>;

export function TremorStatusBadge({ status }: { status: MeasurementStatus }) {
  const { label, icon: Icon, className } = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sh9 whitespace-nowrap",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}
