import { CircleCheck, CircleMinus, CircleX, Clock, type LucideIcon } from "lucide-react";

import type { DoseStatus } from "~/lib/medication";

// The single place that maps a dose status to its label, shared by the medication log table and
// the dose strip under the tremor trend so the two never drift apart.
export const doseStatusStyles: Record<DoseStatus, { label: string; icon: LucideIcon; className: string }> = {
  taken: { label: "Diminum", icon: CircleCheck, className: "bg-secondary-50 text-secondary-700" },
  skipped: { label: "Dilewati", icon: CircleMinus, className: "bg-surface-sunken text-ink-muted" },
  missed: { label: "Terlewat", icon: CircleX, className: "bg-warning-soft text-warning" },
  pending: { label: "Menunggu", icon: Clock, className: "bg-primary-50 text-primary-700" },
};
