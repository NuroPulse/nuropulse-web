import { Cpu, FlaskConical, Info, Smartphone } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { TablePagination } from "~/components/elements/table-pagination";
import { TremorStatusBadge } from "~/components/elements/tremor-status-badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDateOnly, formatDateTime } from "~/lib/date";
import { formatDecimal } from "~/lib/number";
import { deriveDoses, toHistorySchedules, toLocalDateKey } from "~/lib/medication";
import { cn } from "~/lib/utils";
import { MEASUREMENT_HISTORY_PAGE_SIZE } from "../api";
import {
  useLatestMeasurement,
  useMeasurementHistory,
  useMedicationLogs,
  useSchedules,
  useTrendMeasurements,
} from "../hooks";
import { buildDummyDoses, buildDummyMeasurements } from "../trend-dummy";
import type { DoseMarker, Measurement, TrendChange } from "../types";
import { QueryError } from "./query-error";
import { TremorTrendChart } from "./tremor-trend-chart";

const DAY_MS = 24 * 60 * 60 * 1000;

type TrendRange = "7d" | "30d" | "3m";

const trendRanges: { value: TrendRange; label: string; days: number }[] = [
  { value: "7d", label: "7 Hari", days: 7 },
  { value: "30d", label: "30 Hari", days: 30 },
  { value: "3m", label: "3 Bulan", days: 90 },
];

const noMeasurements: Measurement[] = [];

type TremorSectionProps = {
  patientId: string;
  now: Date;
};

export function TremorSection({ patientId, now }: TremorSectionProps) {
  const [range, setRange] = useState<TrendRange>("30d");
  const [historyPage, setHistoryPage] = useState(1);

  const latestQuery = useLatestMeasurement(patientId);
  const trendQuery = useTrendMeasurements(patientId);
  const historyQuery = useMeasurementHistory(patientId, historyPage);
  // Shared with the medication log section through the query cache.
  const schedulesQuery = useSchedules(patientId);
  const logsQuery = useMedicationLogs(patientId);

  // TEMPORARY: preview the trend with dummy data via `?dummy-trend`, also on the deployed site,
  // always behind the "Data contoh" banner below so it is never mistaken for patient data.
  const showDummyTrend = new URLSearchParams(window.location.search).has("dummy-trend");
  const dummyMeasurements = useMemo(() => (showDummyTrend ? buildDummyMeasurements(now) : null), [showDummyTrend, now]);

  const trendMeasurements = dummyMeasurements ?? trendQuery.data ?? noMeasurements;
  const rangeDays = trendRanges.find((option) => option.value === range)?.days ?? 30;
  const from = useMemo(() => new Date(now.getTime() - rangeDays * DAY_MS), [now, rangeDays]);
  const inRange = useMemo(
    () => trendMeasurements.filter((measurement) => new Date(measurement.measuredAt) >= from),
    [trendMeasurements, from],
  );

  // Amplitude is only comparable on the same phone model, and results of different algorithm
  // versions must not be silently mixed, so both switches are marked. Walk oldest → newest and
  // note each switch; an unknown model is not a switch.
  const changes = useMemo(() => {
    const found: TrendChange[] = [];
    let previousModel: string | null = null;
    let previousAlgo: string | null = null;
    for (const measurement of [...inRange].reverse()) {
      const model = measurement.device.model;
      if (model) {
        if (previousModel && previousModel !== model) {
          found.push({ kind: "model", previous: previousModel, value: model, measuredAt: measurement.measuredAt });
        }
        previousModel = model;
      }
      if (previousAlgo && previousAlgo !== measurement.algoVersion) {
        found.push({
          kind: "algo",
          previous: previousAlgo,
          value: measurement.algoVersion,
          measuredAt: measurement.measuredAt,
        });
      }
      previousAlgo = measurement.algoVersion;
    }
    return found;
  }, [inRange]);

  // Answered and missed doses in the range, placed where they happened; pending doses are not
  // drawn yet. All schedules, stopped ones included, so past doses keep their place.
  const doses = useMemo((): DoseMarker[] | null => {
    if (showDummyTrend) return buildDummyDoses(from, now);
    if (!schedulesQuery.data || !logsQuery.data) return null;
    const medicineNames = new Map(schedulesQuery.data.map((schedule) => [schedule.id, schedule.medicineName]));
    return deriveDoses(toHistorySchedules(schedulesQuery.data), logsQuery.data, from, now).flatMap((dose) =>
      dose.status === "pending"
        ? []
        : [
            {
              time: (dose.takenAt ?? dose.scheduledAt).getTime(),
              status: dose.status,
              scheduledAt: dose.scheduledAt,
              takenAt: dose.takenAt,
              medicineName: medicineNames.get(dose.scheduleId) ?? "",
            },
          ],
    );
  }, [showDummyTrend, schedulesQuery.data, logsQuery.data, from, now]);

  let latestCard: ReactNode;
  if (latestQuery.isPending) {
    latestCard = (
      <div aria-busy="true" className="mt-4 flex flex-col gap-3">
        <span className="sr-only">Memuat…</span>
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  } else if (latestQuery.isError) {
    latestCard = <QueryError failure={latestQuery.error} onRetry={() => latestQuery.refetch()} className="mt-4" />;
  } else if (!latestQuery.data) {
    latestCard = <p className="mt-2 text-b8 text-ink-muted">Belum ada pengukuran.</p>;
  } else {
    const latest = latestQuery.data;
    latestCard = (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-b9 text-ink-muted">
            {formatDateTime(latest.measuredAt)} · Tremor saat istirahat · algoritma {latest.algoVersion}
          </p>
          <TremorStatusBadge status={latest.status} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Frekuensi puncak", value: formatDecimal(latest.features.peakFrequencyHz, 1), unit: "Hz" },
            { label: "Amplitudo pita (RMS)", value: formatDecimal(latest.features.bandRmsG, 3), unit: "g" },
            { label: "Rasio daya pita", value: formatDecimal(latest.features.bandPowerRatio, 2) },
            { label: "Konsistensi", value: formatDecimal(latest.features.consistency, 2) },
            { label: "Durasi", value: String(latest.durationS), unit: "detik" },
          ].map((metric) => (
            <div key={metric.label}>
              <dt className="text-b9 text-ink-muted">{metric.label}</dt>
              <dd className="mt-1 text-h5 text-ink">
                {metric.value}
                {metric.unit && <span className="ml-1 text-b8 text-ink-muted">{metric.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </>
    );
  }

  let trendBody: ReactNode;
  if (trendQuery.isPending && !showDummyTrend) {
    trendBody = (
      <div aria-busy="true" className="mt-5">
        <span className="sr-only">Memuat…</span>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  } else if (trendQuery.isError) {
    trendBody = <QueryError failure={trendQuery.error} onRetry={() => trendQuery.refetch()} className="mt-5" />;
  } else if (inRange.length === 0) {
    trendBody = <p className="mt-5 text-b8 text-ink-muted">Belum ada pengukuran dalam rentang ini.</p>;
  } else {
    trendBody = (
      <>
        <TremorTrendChart
          measurements={inRange}
          doses={doses}
          changes={changes}
          from={from}
          now={now}
          rangeDays={rangeDays}
        />
        {/* The chart still renders while the doses load; only the strip waits. */}
        {(schedulesQuery.isPending || logsQuery.isPending) && (
          <div aria-busy="true" className="mt-2">
            <span className="sr-only">Memuat…</span>
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        )}
        {schedulesQuery.isError && (
          <QueryError failure={schedulesQuery.error} onRetry={() => schedulesQuery.refetch()} className="mt-3" />
        )}
        {!schedulesQuery.isError && logsQuery.isError && (
          <QueryError failure={logsQuery.error} onRetry={() => logsQuery.refetch()} className="mt-3" />
        )}

        {changes.map((change) => {
          const since = formatDateOnly(toLocalDateKey(new Date(change.measuredAt)));
          return change.kind === "model" ? (
            <p key={`model-${change.measuredAt}`} className="mt-3 flex items-center gap-2 text-b9 text-ink-muted">
              <Smartphone aria-hidden="true" className="size-4 shrink-0 text-primary-600" />
              Ganti ponsel: {change.value} sejak {since}. Amplitudo hanya sebanding pada model ponsel yang sama.
            </p>
          ) : (
            <p key={`algo-${change.measuredAt}`} className="mt-3 flex items-center gap-2 text-b9 text-ink-muted">
              <Cpu aria-hidden="true" className="size-4 shrink-0 text-primary-600" />
              Versi algoritma berubah: {change.value} sejak {since}.
            </p>
          );
        })}
      </>
    );
  }

  let historyBody: ReactNode;
  if (historyQuery.isPending) {
    historyBody = (
      <div aria-busy="true" className="flex flex-col gap-3 px-6 pb-6">
        <span className="sr-only">Memuat…</span>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  } else if (historyQuery.isError) {
    historyBody = (
      <QueryError failure={historyQuery.error} onRetry={() => historyQuery.refetch()} className="px-6 pb-6" />
    );
  } else if (historyQuery.data.total === 0) {
    historyBody = <p className="px-6 pb-6 text-b8 text-ink-muted">Belum ada pengukuran.</p>;
  } else {
    historyBody = (
      <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left">
            <thead className="bg-surface">
              <tr>
                {["Waktu pengukuran", "Status", "Frekuensi puncak", "Amplitudo (RMS)", "Durasi", "Ponsel", "Algoritma"].map(
                  (column) => (
                    <th key={column} scope="col" className="px-4 py-3 text-sh9 whitespace-nowrap text-ink-muted">
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {historyQuery.data.items.map((measurement) => (
                <tr key={measurement.id}>
                  <td className="px-4 py-3 text-sh9 whitespace-nowrap text-ink">
                    {formatDateTime(measurement.measuredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <TremorStatusBadge status={measurement.status} />
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {formatDecimal(measurement.features.peakFrequencyHz, 1)} Hz
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {formatDecimal(measurement.features.bandRmsG, 3)} g
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {measurement.durationS} dtk
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {measurement.device.model ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {measurement.algoVersion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={historyPage}
          pageSize={MEASUREMENT_HISTORY_PAGE_SIZE}
          total={historyQuery.data.total}
          itemLabel="pengukuran"
          label="Halaman riwayat pengukuran"
          onPageChange={setHistoryPage}
        />
      </>
    );
  }

  return (
    <section id="tes-tremor" aria-labelledby="tes-tremor-title" className="scroll-mt-6">
      <h2 id="tes-tremor-title" className="sr-only">
        Tes Tremor
      </h2>

      {/* Cannot be dismissed until the team says the thresholds are calibrated. */}
      <div role="note" className="flex items-start gap-3 rounded-2xl border border-success bg-success-soft p-4">
        <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-sh8 text-ink">Ambang belum dikalibrasi</p>
          <p className="text-b9 text-ink-muted">
            Status pola tremor memakai ambang awal yang belum divalidasi. Gunakan sebagai penanda,
            bukan kesimpulan klinis.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface-raised p-6">
        <p className="text-sh7 text-ink">Pengukuran terakhir</p>
        {latestCard}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface-raised p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sh7 text-ink">Tren frekuensi puncak</p>
            <p className="text-b9 text-ink-muted">
              Setiap titik adalah satu pengukuran. Strip di bawah menunjukkan dosis obat harian.
            </p>
          </div>
          <div role="group" aria-label="Rentang waktu" className="flex rounded-lg bg-surface-sunken p-1">
            {trendRanges.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sh9 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  range === option.value ? "bg-surface-raised text-primary-600 shadow-card" : "text-ink-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {/* Cannot be dismissed: the dummy trend sits on a real patient's page. */}
        {showDummyTrend && (
          <div role="note" className="mt-5 flex items-start gap-3 rounded-2xl border border-warning bg-warning-soft p-4">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="text-sh8 text-ink">Data contoh, bukan data pasien</p>
              <p className="text-b9 text-ink-muted">
                Grafik tren dan strip dosis di bawah memakai data buatan untuk pratinjau. Hapus
                ?dummy-trend dari alamat halaman untuk melihat data pasien.
              </p>
            </div>
          </div>
        )}
        {trendBody}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface-raised">
        <div className="p-6 pb-4">
          <p className="text-sh7 text-ink">Riwayat pengukuran</p>
          <p className="text-b9 text-ink-muted">Diurutkan berdasarkan waktu pengukuran</p>
        </div>
        {historyBody}
      </div>
    </section>
  );
}
