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

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// "15 Okt 2026, 07.40", in the doctor's local time zone.
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return `${shortDateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

const dayMonthFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

// "15 Okt"
export function formatDayMonth(date: Date): string {
  return dayMonthFormatter.format(date);
}

// "15 Okt, 07.00"
export function formatDayMonthTime(date: Date): string {
  return `${dayMonthFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

// "07.12"
export function formatTimeOnly(date: Date): string {
  return timeFormatter.format(date);
}

// Date-only values ("2026-09-01") are calendar dates, not instants: read them as local dates
// so they never shift by a day. → "1 Sep 2026"
export function formatDateOnly(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return shortDateFormatter.format(new Date(year, month - 1, day));
}

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "Kamis, 15 Oktober 2026"
export function formatFullDate(date: Date): string {
  return fullDateFormatter.format(date);
}
