// Shared medication schedule rules (CLAUDE.md Section 4, "Medication models", and Section 10).
// Pure functions: "now" is passed in so the 2-hour missed rule can be unit-tested.

export const MAX_TIMES_PER_DAY = 8;
// A scheduled dose with no log this long after its time is shown as missed ("Terlewat").
export const MISSED_AFTER_MS = 2 * 60 * 60 * 1000;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ScheduleForDoses = {
  id: string;
  // "HH:MM", local wall-clock time of the patient, no time zone.
  times: string[];
  // "YYYY-MM-DD"; endDate is inclusive, null means no end.
  startDate: string;
  endDate: string | null;
  isActive: boolean;
};

export type DoseLog = {
  scheduleId: string;
  scheduledAt: string;
  status: "taken" | "skipped";
  takenAt: string | null;
};

export type DoseStatus = "taken" | "skipped" | "missed" | "pending";

export type DoseEntry = {
  scheduleId: string;
  scheduledAt: Date;
  status: DoseStatus;
  takenAt: Date | null;
};

// "2026-09-01" → local midnight on that date (not UTC, which would shift the day).
export function parseLocalDate(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// The doses a schedule has on one calendar date, as local date-times.
export function dosesOnDate(schedule: ScheduleForDoses, ymd: string): Date[] {
  if (!schedule.isActive) return [];
  if (ymd < schedule.startDate) return [];
  if (schedule.endDate && ymd > schedule.endDate) return [];
  const date = parseLocalDate(ymd);
  return schedule.times.map((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  });
}

// Every dose that was due between `from` and `now`, matched with its log. A dose without a
// log is "missed" once 2 hours have passed, and "pending" before that.
export function deriveDoses(
  schedules: ScheduleForDoses[],
  logs: DoseLog[],
  from: Date,
  now: Date,
): DoseEntry[] {
  const entries: DoseEntry[] = [];
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  while (day <= now) {
    const ymd = toLocalDateKey(day);
    for (const schedule of schedules) {
      for (const scheduledAt of dosesOnDate(schedule, ymd)) {
        if (scheduledAt < from || scheduledAt > now) continue;
        const log = logs.find(
          (entry) =>
            entry.scheduleId === schedule.id &&
            Math.abs(new Date(entry.scheduledAt).getTime() - scheduledAt.getTime()) < 60_000,
        );
        const overdue = now.getTime() - scheduledAt.getTime() >= MISSED_AFTER_MS;
        entries.push({
          scheduleId: schedule.id,
          scheduledAt,
          status: log ? log.status : overdue ? "missed" : "pending",
          takenAt: log?.takenAt ? new Date(log.takenAt) : null,
        });
      }
    }
    day.setDate(day.getDate() + 1);
  }

  return entries.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
}

// Kepatuhan obat: doses taken ÷ doses whose time has passed (missed or logged). Pending doses
// do not count yet. null when there is nothing to count.
export function medicationComplianceRatio(entries: DoseEntry[]): number | null {
  const counted = entries.filter((entry) => entry.status !== "pending");
  if (counted.length === 0) return null;
  return counted.filter((entry) => entry.status === "taken").length / counted.length;
}

export type TimesError = "required" | "too_many" | "invalid" | "duplicate";

// 1 to 8 "HH:MM" times, no duplicates. Callers keep the list sorted.
export function validateTimes(times: string[]): TimesError | undefined {
  if (times.length === 0) return "required";
  if (times.length > MAX_TIMES_PER_DAY) return "too_many";
  if (times.some((time) => !TIME_PATTERN.test(time))) return "invalid";
  if (new Set(times).size !== times.length) return "duplicate";
  return undefined;
}

// end_date may be empty; when set it must not be before start_date.
export function isEndBeforeStart(startDate: string, endDate: string | null): boolean {
  return Boolean(endDate) && (endDate as string) < startDate;
}
