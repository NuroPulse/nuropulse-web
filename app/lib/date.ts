// Shared date formatting (CLAUDE.md Section 7): data is stored in UTC and rendered in the
// doctor's local time zone, always through these helpers so every page reads the same.

const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "1 September 2026"
export function formatLongDate(isoTimestamp: string): string {
  return longDateFormatter.format(new Date(isoTimestamp));
}
