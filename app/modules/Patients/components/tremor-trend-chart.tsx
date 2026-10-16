import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import { formatDateTime, formatDayMonth } from "~/lib/date";
import { cn } from "~/lib/utils";
import {
  MIN_Y_MAX_HZ,
  TREMOR_BAND_HZ,
  TREND_CHART_MARGIN,
  TREND_Y_AXIS_WIDTH,
  buildDayTicks,
  doseStripLayout,
  trendChartConfig,
  trendMarkRadius,
} from "../trend-chart";
import type { DoseMarker, Measurement, TrendChange } from "../types";
import { ChangeLine } from "./change-line";
import { ChangeTooltip } from "./change-tooltip";
import { DoseStrip } from "./dose-strip";
import { MeasurementTooltip } from "./measurement-tooltip";
import { TrendLegend } from "./trend-legend";

type TrendPoint = {
  time: number;
  frequency: number;
  measurement: Measurement;
};

type DotProps = { cx?: number; cy?: number; index?: number; payload?: TrendPoint };

type TremorTrendChartProps = {
  // Already limited to the range, in any order.
  measurements: Measurement[];
  // null while the schedules or logs are loading or failed; the caller shows that state.
  doses: DoseMarker[] | null;
  changes: TrendChange[];
  from: Date;
  now: Date;
  rangeDays: number;
};

export function TremorTrendChart({ measurements, doses, changes, from, now, rangeDays }: TremorTrendChartProps) {
  const points: TrendPoint[] = measurements
    .map((measurement) => ({
      time: new Date(measurement.measuredAt).getTime(),
      frequency: measurement.features.peakFrequencyHz,
      measurement,
    }))
    .sort((a, b) => a.time - b.time);

  const domain: [number, number] = [from.getTime(), now.getTime()];
  const radius = trendMarkRadius(rangeDays);
  // The change line under the pointer or keyboard focus, with where to anchor its tooltip.
  const [hoveredChange, setHoveredChange] = useState<{ change: TrendChange; x: number; y: number } | null>(null);
  // Past the middle of the chart the tooltip opens to the left so it stays inside the card.
  const opensLeft =
    hoveredChange !== null &&
    new Date(hoveredChange.change.measuredAt).getTime() > domain[0] + (domain[1] - domain[0]) * 0.6;

  return (
    <div className="mt-5">
      <TrendLegend
        hasModelChange={changes.some((change) => change.kind === "model")}
        hasAlgoChange={changes.some((change) => change.kind === "algo")}
      />

      <p className="mt-4 text-b9 text-ink-muted">Hz</p>
      <div className="relative">
        <ChartContainer
          config={trendChartConfig}
          role="group"
          aria-label={`Grafik frekuensi puncak, ${points.length} pengukuran dalam rentang ini.`}
          className="aspect-auto h-64 w-full"
        >
          <LineChart data={points} margin={TREND_CHART_MARGIN}>
            <CartesianGrid vertical={false} />
            <ReferenceArea
              y1={TREMOR_BAND_HZ.from}
              y2={TREMOR_BAND_HZ.to}
              fill="var(--color-primary-50)"
              fillOpacity={1}
              stroke="none"
              ifOverflow="extendDomain"
            />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={domain}
              allowDataOverflow
              ticks={buildDayTicks(from, now, rangeDays)}
              tickFormatter={(value: number) => formatDayMonth(new Date(value))}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              width={TREND_Y_AXIS_WIDTH}
              domain={[0, (dataMax: number) => Math.max(MIN_Y_MAX_HZ, Math.ceil(dataMax + 1))]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            {changes.map((change) => {
              const key = `${change.kind}-${change.measuredAt}`;
              const title = change.kind === "model" ? "Ganti ponsel" : "Versi algoritma berubah";
              return (
                <ReferenceLine
                  key={key}
                  x={new Date(change.measuredAt).getTime()}
                  shape={(props: { x1?: number; y1?: number; x2?: number; y2?: number }) => (
                    <ChangeLine
                      x1={props.x1}
                      y1={props.y1}
                      x2={props.x2}
                      y2={props.y2}
                      stroke={change.kind === "model" ? "var(--color-neutral-500)" : "var(--color-secondary-500)"}
                      strokeDasharray={change.kind === "model" ? "4 4" : "1 3"}
                      label={`${title}: ${change.previous} ke ${change.value}, sejak ${formatDateTime(change.measuredAt)}.`}
                      active={hoveredChange !== null && `${hoveredChange.change.kind}-${hoveredChange.change.measuredAt}` === key}
                      onHover={(position) => setHoveredChange(position && { change, ...position })}
                    />
                  )}
                />
              );
            })}
            <ChartTooltip
              cursor={{ stroke: "var(--color-line-strong)" }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as TrendPoint | undefined;
                // A hovered change line shows its own tooltip instead.
                if (!active || !point || hoveredChange) return null;
                return <MeasurementTooltip measurement={point.measurement} />;
              }}
            />
            <Line
              dataKey="frequency"
              type="linear"
              stroke="var(--color-frequency)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={(props: DotProps) => renderStatusDot(props, radius.measurement)}
              activeDot={(props: DotProps) => renderStatusDot(props, radius.measurement + 2)}
            />
          </LineChart>
        </ChartContainer>
        {hoveredChange && (
          // Positioned at the line's pixel coordinates, which only exist at runtime.
          <div
            className={cn("pointer-events-none absolute z-10", opensLeft && "-translate-x-full")}
            style={{ left: hoveredChange.x + (opensLeft ? -8 : 8), top: hoveredChange.y }}
          >
            <ChangeTooltip change={hoveredChange.change} />
          </div>
        )}
      </div>

      <DoseStrip doses={doses} domain={domain} radius={radius.dose} layout={doseStripLayout(rangeDays)} />
    </div>
  );
}

// Filled = "Pola tremor terdeteksi", hollow = not detected, so the result never relies on colour
// alone. The surface ring keeps overlapping points apart.
function renderStatusDot({ cx, cy, index, payload }: DotProps, radius: number) {
  if (cx === undefined || cy === undefined) return <g key={index} />;
  const detected = payload?.measurement.status === "tremor";
  return (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r={radius}
      fill={detected ? "var(--color-primary-600)" : "var(--color-surface-raised)"}
      stroke={detected ? "var(--color-surface-raised)" : "var(--color-primary-600)"}
      strokeWidth={2}
    />
  );
}
