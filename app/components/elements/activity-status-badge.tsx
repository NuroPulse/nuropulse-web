import { CircleCheck, CircleDashed, CircleMinus, Clock, type LucideIcon } from "lucide-react";

import type { ActivityStatus } from "~/lib/patient-status";
import { cn } from "~/lib/utils";

// The single place that turns an activity status into its label (CLAUDE.md Section 8).
// Always text plus an icon, never colour alone.
const statusStyles: Record<ActivityStatus, { label: string; icon: LucideIcon; className: string }> = {
  active: {
    label: "Aktif",
    icon: CircleCheck,
    className: "bg-secondary-50 text-secondary-700",
  },
  no_check_in: {
    label: "Belum check-in",
    icon: Clock,
    className: "bg-primary-50 text-primary-700",
  },
  inactive: {
    label: "Tidak aktif",
    icon: CircleMinus,
    className: "bg-surface-sunken text-ink-muted",
  },
  no_measurement: {
    label: "Belum ada pengukuran",
    icon: CircleDashed,
    className: "border border-dashed border-line-strong text-ink-muted",
  },
};

export function activityStatusLabel(status: ActivityStatus): string {
  return statusStyles[status].label;
}

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
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
