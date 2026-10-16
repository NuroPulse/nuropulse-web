import type { AnsweredDoseStatus } from "../types";

type DoseShapeProps = {
  cx?: number;
  cy?: number;
  status: AnsweredDoseStatus;
  // Outer radius in px; the strip scales it with the range, the legend keeps the default.
  radius?: number;
};

// Taken: filled circle. Skipped: hollow circle. Missed: a cross. Used on the dose strip and in
// its legend so both always match.
export function DoseShape({ cx, cy, status, radius = 4 }: DoseShapeProps) {
  if (cx === undefined || cy === undefined) return null;
  // The stroke sits on the outline, so hollow marks shrink by half of it to match the filled one.
  const inner = radius - 0.5;
  if (status === "taken") {
    return (
      <circle cx={cx} cy={cy} r={radius} fill="var(--color-secondary-500)" stroke="var(--color-surface-raised)" strokeWidth={1.5} />
    );
  }
  if (status === "skipped") {
    return (
      <circle cx={cx} cy={cy} r={inner} fill="var(--color-surface-raised)" stroke="var(--color-neutral-500)" strokeWidth={1.5} />
    );
  }
  return (
    <path
      d={`M${cx - inner} ${cy - inner} L${cx + inner} ${cy + inner} M${cx + inner} ${cy - inner} L${cx - inner} ${cy + inner}`}
      stroke="var(--color-warning)"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}
