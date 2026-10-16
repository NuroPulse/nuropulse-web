import { Scatter, ScatterChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import { formatClockTime } from "~/lib/date";
import { cn } from "~/lib/utils";
import { doseStatusStyles } from "../dose-status";
import {
  TREND_CHART_MARGIN,
  TREND_Y_AXIS_WIDTH,
  doseStripHeightClass,
  toStripPoints,
  trendChartConfig,
  type DoseStripLayout,
  type StripPoint,
} from "../trend-chart";
import type { AnsweredDoseStatus, DoseMarker } from "../types";
import { DoseShape } from "./dose-shape";
import { DoseTooltip } from "./dose-tooltip";

const statuses: AnsweredDoseStatus[] = ["taken", "skipped", "missed"];

type ShapeProps = { cx?: number; cy?: number };

type DoseStripProps = {
  doses: DoseMarker[] | null;
  // Same time domain as the trend chart above it.
  domain: [number, number];
  radius: number;
  layout: DoseStripLayout;
};

// Only the time axis has to line up with the trend chart, so the strip keeps its sides and
// drops most of the vertical margin to pack the rows.
const STRIP_MARGIN = { ...TREND_CHART_MARGIN, top: 2, bottom: 2 };

// Doses on the same time axis as the measurements, so tremor can be read next to medication
// timing (CLAUDE.md Section 10). The shape tells the status apart, not colour alone.
export function DoseStrip({ doses, domain, radius, layout }: DoseStripProps) {
  if (doses === null) return null;
  if (doses.length === 0) {
    return <p className="mt-3 text-b9 text-ink-muted">Belum ada dosis terjadwal dalam rentang ini.</p>;
  }

  const { points, rows, rowTimes } = toStripPoints(doses, layout !== "timeline");
  // Stacked rows are labelled with their intake time and the strip gets an "Obat" caption;
  // otherwise one "Obat" label sits in the middle of the rows.
  const timeLabels = rowTimes !== null;
  const ticks = timeLabels ? rowTimes.map((_, row) => row) : [(rows - 1) / 2];

  return (
    <>
      {timeLabels && <p className="mt-3 text-b9 text-ink-muted">Obat</p>}
      <ChartContainer
        config={trendChartConfig}
        role="img"
        aria-label={`Strip dosis obat, ${doses.length} dosis terjadwal dalam rentang ini.`}
        className={cn("mt-2 aspect-auto w-full", doseStripHeightClass(layout, rows))}
      >
        <ScatterChart margin={STRIP_MARGIN}>
          <XAxis dataKey="x" type="number" scale="time" domain={domain} allowDataOverflow hide />
          {/* Reversed so the earliest dose of the day is on top. */}
          <YAxis
            dataKey="slot"
            type="number"
            domain={[-0.5, rows - 0.5]}
            reversed
            ticks={ticks}
            interval={0}
            tickFormatter={(row: number) => (timeLabels ? formatClockTime(rowTimes[row]) : "Obat")}
            width={TREND_Y_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const dose = payload?.[0]?.payload as StripPoint<DoseMarker> | undefined;
              if (!active || !dose) return null;
              return <DoseTooltip dose={dose} />;
            }}
          />
          {statuses.map((status) => (
            <Scatter
              key={status}
              data={points.filter((point) => point.status === status)}
              isAnimationActive={false}
              shape={(props: ShapeProps) => <DoseShape cx={props.cx} cy={props.cy} status={status} radius={radius} />}
            />
          ))}
        </ScatterChart>
      </ChartContainer>

      <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2 text-b9 text-ink-muted">
        {statuses.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
              <DoseShape cx={6} cy={6} status={status} />
            </svg>
            {doseStatusStyles[status].label}
          </li>
        ))}
      </ul>
    </>
  );
}
