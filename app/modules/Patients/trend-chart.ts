import type { ChartConfig } from "~/components/ui/chart";

// The tremor band from the data contract, drawn as a reference only.
export const TREMOR_BAND_HZ = { from: 3.5, to: 7 };
// Keeps the band and some headroom in view when every point sits low.
export const MIN_Y_MAX_HZ = 10;
// The trend chart and the dose strip share this left gutter and margin so their time axes
// line up.
export const TREND_Y_AXIS_WIDTH = 44;
export const TREND_CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 };

export const trendChartConfig = {
  frequency: { label: "Frekuensi puncak", color: "var(--chart-1)" },
} satisfies ChartConfig;

// Shorter ranges have fewer, wider-spaced points, so they get larger marks. On 3 Bulan a day
// column is only a few pixels wide, so the doses stay small.
export function trendMarkRadius(rangeDays: number): { measurement: number; dose: number } {
  if (rangeDays <= 7) return { measurement: 6, dose: 6 };
  if (rangeDays <= 30) return { measurement: 5, dose: 5 };
  return { measurement: 4, dose: 3 };
}

// How the dose strip lays out its marks:
// - "timeline" (7 Hari): one row, each dose at its own time.
// - "stacked" (30 Hari, 3 Bulan): one column per day and one row per intake time, labelled with
//   the time, because side by side the doses of a day run together.
export type DoseStripLayout = "timeline" | "stacked";

export function doseStripLayout(rangeDays: number): DoseStripLayout {
  return rangeDays <= 7 ? "timeline" : "stacked";
}

// Stacked strip heights for 1 to 8 rows, about 14px per row so each time label fits. Literal
// classes so Tailwind finds them.
const STACKED_HEIGHTS = ["h-5", "h-8", "h-12", "h-15", "h-19", "h-22", "h-26", "h-29"];

export function doseStripHeightClass(layout: DoseStripLayout, rows: number): string {
  if (layout === "timeline") return "h-12";
  return STACKED_HEIGHTS[Math.min(rows, STACKED_HEIGHTS.length) - 1];
}

// Day labels, newest last, spaced so each range gets about six or seven. On 7 Hari a label sits
// at noon, in the middle of its day, so it lines up under that day's points; longer ranges mark
// midnight.
export function buildDayTicks(from: Date, now: Date, rangeDays: number): number[] {
  const stepDays = rangeDays <= 7 ? 1 : rangeDays <= 30 ? 5 : 15;
  const offsetHours = rangeDays <= 7 ? 12 : 0;
  const ticks: number[] = [];
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), offsetHours);
  while (day.getTime() >= from.getTime()) {
    if (day.getTime() <= now.getTime()) ticks.unshift(day.getTime());
    day.setDate(day.getDate() - stepDays);
  }
  return ticks;
}

export type StripPoint<T> = T & {
  // Position on the time axis.
  x: number;
  // Row in the strip, 0 = top.
  slot: number;
};

// Rows beyond this fall back to one row per dose of the day, without time labels.
const MAX_TIME_ROWS = 8;

function clockKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Doses as strip points. On a timeline each dose sits at its own time on one row. Stacked, the
// doses of a day share that day's noon. Rows are the intake times ("HH:MM", earliest on top)
// when there are at most 8 of them in the range, so a row always means the same time; with
// more (several schedule changes), a dose takes the next free row of its day and `rowTimes`
// is null.
export function toStripPoints<T extends { time: number; scheduledAt: Date }>(
  doses: T[],
  stacked: boolean,
): { points: StripPoint<T>[]; rows: number; rowTimes: string[] | null } {
  if (!stacked) {
    return { points: doses.map((dose) => ({ ...dose, x: dose.time, slot: 0 })), rows: 1, rowTimes: null };
  }

  const noonOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
  const times = [...new Set(doses.map((dose) => clockKey(dose.scheduledAt)))].sort();

  if (times.length <= MAX_TIME_ROWS) {
    const points = doses.map((dose) => ({
      ...dose,
      x: noonOf(dose.scheduledAt),
      slot: times.indexOf(clockKey(dose.scheduledAt)),
    }));
    return { points, rows: Math.max(times.length, 1), rowTimes: times };
  }

  const byDay = new Map<number, T[]>();
  for (const dose of doses) {
    const noon = noonOf(dose.scheduledAt);
    byDay.set(noon, [...(byDay.get(noon) ?? []), dose]);
  }
  const points: StripPoint<T>[] = [];
  let rows = 1;
  for (const [noon, dayDoses] of byDay) {
    const ordered = [...dayDoses].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    ordered.forEach((dose, slot) => points.push({ ...dose, x: noon, slot }));
    rows = Math.max(rows, ordered.length);
  }
  return { points, rows, rowTimes: null };
}
