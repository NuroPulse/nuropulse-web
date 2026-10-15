// Indonesian number formatting: decimal comma ("5,4"), fixed number of fraction digits.
export function formatDecimal(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

// 0.714 → "71%"
export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat("id-ID", { style: "percent", maximumFractionDigits: 0 }).format(ratio);
}
