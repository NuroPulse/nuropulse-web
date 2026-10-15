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

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// "2 Sep 2026"
export function formatShortDate(isoTimestamp: string): string {
  return shortDateFormatter.format(new Date(isoTimestamp));
}

// Schedule times are stored as "HH:MM" wall-clock time with no time zone (CLAUDE.md
// Section 4); Indonesian writes them with a dot: "07.00".
export function formatClockTime(time: string): string {
  return time.replace(":", ".");
}
