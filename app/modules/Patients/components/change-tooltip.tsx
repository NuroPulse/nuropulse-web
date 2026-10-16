import { Cpu, Smartphone } from "lucide-react";

import { formatDateTime } from "~/lib/date";
import type { TrendChange } from "../types";

export function ChangeTooltip({ change }: { change: TrendChange }) {
  const Icon = change.kind === "model" ? Smartphone : Cpu;
  return (
    <div className="flex min-w-48 flex-col gap-1 rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-card">
      <p className="flex items-center gap-1.5 text-sh9 text-ink">
        <Icon aria-hidden="true" className="size-3.5 text-primary-600" />
        {change.kind === "model" ? "Ganti ponsel" : "Versi algoritma berubah"}
      </p>
      <p className="text-b9 text-ink">
        {change.previous} → {change.value}
      </p>
      <p className="text-b9 text-ink-muted">Sejak {formatDateTime(change.measuredAt)}</p>
      {change.kind === "model" && (
        <p className="max-w-56 text-b9 text-ink-muted">Amplitudo hanya sebanding pada model ponsel yang sama.</p>
      )}
    </div>
  );
}
