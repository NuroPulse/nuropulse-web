type TrendLegendProps = {
  hasModelChange: boolean;
  hasAlgoChange: boolean;
};

// Each entry pairs a shape with text, so nothing on the chart is told by colour alone.
export function TrendLegend({ hasModelChange, hasAlgoChange }: TrendLegendProps) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-b9 text-ink-muted">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-primary-600" />
        Pola tremor terdeteksi
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-primary-600 bg-surface-raised" />
        Pola tremor tidak terdeteksi
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-2.5 w-4 rounded-sm border border-primary-100 bg-primary-50" />
        Pita tremor 3,5–7 Hz (acuan)
      </li>
      {hasModelChange && (
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-neutral-500" />
          Ganti ponsel
        </li>
      )}
      {hasAlgoChange && (
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="w-4 border-t-2 border-dotted border-secondary-500" />
          Versi algoritma berubah
        </li>
      )}
    </ul>
  );
}
