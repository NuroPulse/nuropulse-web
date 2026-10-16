// TEMPORARY dummy data to preview the tremor trend chart, shown with `?dummy-trend` in the URL
// (development and the deployed site) under a "Data contoh" banner. Delete this file and its
// use in tremor-section.tsx when the preview is no longer needed.

import type { DoseMarker, Measurement } from "./types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Seeded so the preview looks the same on every reload.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function buildDummyMeasurements(now: Date): Measurement[] {
  const random = seededRandom(7);
  const measurements: Measurement[] = [];

  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    // A few days without a check-in, so gaps show on the line.
    if (random() < 0.15) continue;
    const perDay = random() < 0.4 ? 2 : 1;
    for (let index = 0; index < perDay; index++) {
      const hour = index === 0 ? 8 + random() * 3 : 16 + random() * 4;
      const measuredAt = new Date(now.getTime() - daysAgo * DAY_MS);
      measuredAt.setHours(Math.floor(hour), Math.floor(random() * 60), 0, 0);
      if (measuredAt > now) continue;

      const detected = random() < 0.55;
      const frequency = detected ? 4.3 + random() * 1.8 : 1.5 + random() * 9;
      measurements.push({
        id: `dummy-${daysAgo}-${index}`,
        measuredAt: measuredAt.toISOString(),
        condition: "rest",
        durationS: 15,
        status: detected ? "tremor" : "none",
        features: {
          peakFrequencyHz: frequency,
          bandPowerRatio: detected ? 0.5 + random() * 0.3 : 0.1 + random() * 0.2,
          snr: detected ? 6 + random() * 6 : 1 + random() * 2,
          bandRmsG: detected ? 0.02 + random() * 0.03 : 0.002 + random() * 0.005,
          consistency: detected ? 0.6 + random() * 0.4 : random() * 0.3,
        },
        algoVersion: daysAgo > 20 ? "0.1.0" : "0.1.1",
        device: {
          model: daysAgo > 40 ? "Pixel 6" : "Pixel 7",
          os: "android",
          appVersion: "1.0.0",
          effectiveSamplingHz: 100,
        },
      });
    }
  }

  // Newest first, like the API.
  return measurements.reverse();
}

export function buildDummyDoses(from: Date, now: Date): DoseMarker[] {
  const random = seededRandom(11);
  const doses: DoseMarker[] = [];
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  while (day <= now) {
    for (const hour of [7, 13, 19]) {
      const scheduledAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
      // Not yet "missed" (2 hours) → pending, which the strip does not draw.
      if (scheduledAt < from || now.getTime() - scheduledAt.getTime() < 2 * HOUR_MS) continue;
      const roll = random();
      const status = roll < 0.8 ? "taken" : roll < 0.9 ? "skipped" : "missed";
      const takenAt = status === "taken" ? new Date(scheduledAt.getTime() + random() * 45 * 60 * 1000) : null;
      doses.push({
        time: (takenAt ?? scheduledAt).getTime(),
        status,
        scheduledAt,
        takenAt,
        medicineName: "Levodopa/Karbidopa (contoh)",
      });
    }
    day.setDate(day.getDate() + 1);
  }

  return doses;
}
