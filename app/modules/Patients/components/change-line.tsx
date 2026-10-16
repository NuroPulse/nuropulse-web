type ChangeLineProps = {
  // Pixel ends of the line, passed in by Recharts' ReferenceLine.
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  stroke: string;
  strokeDasharray: string;
  label: string;
  // Hovered or focused: drawn thicker so focus is visible without relying on the tooltip alone.
  active: boolean;
  onHover: (position: { x: number; y: number } | null) => void;
};

// A reference line that can be hovered or focused. A wide transparent stroke on top makes the
// thin dashed line easy to hit with the mouse.
export function ChangeLine({ x1, y1, x2, y2, stroke, strokeDasharray, label, active, onHover }: ChangeLineProps) {
  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return <g />;
  const show = () => onHover({ x: x1, y: Math.min(y1, y2) });
  const hide = () => onHover(null);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="outline-none"
    >
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeDasharray={strokeDasharray} strokeWidth={active ? 3 : 1.5} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} pointerEvents="stroke" />
    </g>
  );
}
