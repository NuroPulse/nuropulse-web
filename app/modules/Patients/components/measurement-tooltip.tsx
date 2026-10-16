import { TremorStatusBadge } from "~/components/elements/tremor-status-badge";
import { formatDateTime } from "~/lib/date";
import { formatDecimal } from "~/lib/number";
import type { Measurement } from "../types";

export function MeasurementTooltip({ measurement }: { measurement: Measurement }) {
  return (
    <div className="flex min-w-48 flex-col gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-card">
      <p className="text-sh9 text-ink">{formatDateTime(measurement.measuredAt)}</p>
      <TremorStatusBadge status={measurement.status} />
      <p className="text-b9 text-ink-muted">
        Frekuensi puncak{" "}
        <span className="text-sh9 text-ink">{formatDecimal(measurement.features.peakFrequencyHz, 1)} Hz</span>
      </p>
      <p className="text-b9 text-ink-muted">
        Ponsel {measurement.device.model ?? "Tidak tersedia"} · algoritma {measurement.algoVersion}
      </p>
    </div>
  );
}
