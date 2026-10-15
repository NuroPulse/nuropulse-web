import { Activity, ArrowLeft, Calendar, Clock, Phone, Pill, Smartphone, TriangleAlert, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import { ActivityStatusBadge } from "~/components/elements/activity-status-badge";
import { FlagBadge, flagReasonText } from "~/components/elements/flag-badge";
import { Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/date";
import { toLocalDateKey } from "~/lib/medication";
import { getActivityStatus } from "~/lib/patient-status";
import { formatPhoneNumber } from "~/lib/phone";
import type { Measurement, MedicationLog, MedicationSchedule, NewScheduleInput, PatientListItem } from "../types";
import { MedicationLogSection } from "./medication-log-section";
import { buildSamplePatients } from "./patient-list-page";
import { ScheduleSection } from "./schedule-section";
import { TremorSection } from "./tremor-section";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// TODO: Replace with Supabase query (backend team).
// Sample data only. Generated from the patient id so each sample patient always gets the same
// history; times are relative to "now".

function seededRandom(seed: string) {
  let state = [...seed].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSampleMeasurements(patient: PatientListItem): Measurement[] {
  if (!patient.lastMeasuredAt) return [];
  const random = seededRandom(`${patient.id}-measurements`);
  const latest = new Date(patient.lastMeasuredAt).getTime();
  const count = 40;
  const spacing = (90 * DAY_MS) / (count - 1);

  return Array.from({ length: count }, (_, index) => {
    const measuredAt = index === 0 ? latest : latest - index * spacing + (random() - 0.5) * 6 * HOUR_MS;
    const peakFrequencyHz = Math.round((4 + random() * 5) * 10) / 10;
    const inBand = peakFrequencyHz >= 3.5 && peakFrequencyHz <= 7;
    const status = inBand && random() < 0.8 ? "tremor" : "none";
    return {
      id: `${patient.id}-m${index}`,
      measuredAt: new Date(measuredAt).toISOString(),
      condition: "rest",
      durationS: 10,
      status,
      features: {
        peakFrequencyHz,
        bandPowerRatio: Math.round((status === "tremor" ? 0.6 + random() * 0.3 : 0.2 + random() * 0.3) * 100) / 100,
        snr: Math.round((status === "tremor" ? 40 + random() * 200 : 3 + random() * 10) * 100) / 100,
        bandRmsG: Math.round((status === "tremor" ? 0.02 + random() * 0.02 : 0.004 + random() * 0.01) * 1000) / 1000,
        consistency: Math.round((status === "tremor" ? 0.7 + random() * 0.3 : 0.2 + random() * 0.4) * 100) / 100,
      },
      algoVersion: "0.1.0",
      // One phone change: the older half was measured on another model.
      device: {
        model: index < 18 ? "Pixel 7" : "Pixel 6a",
        os: "android",
        appVersion: "1.0.0",
        effectiveSamplingHz: 100,
      },
    } satisfies Measurement;
  });
}

function buildSampleSchedules(patient: PatientListItem, now: Date): MedicationSchedule[] {
  if (patient.medicationCompliance === null) return [];
  const day = (offset: number) => toLocalDateKey(new Date(now.getTime() + offset * DAY_MS));
  return [
    {
      id: `${patient.id}-s1`,
      patientId: patient.id,
      medicineId: "sample-levodopa",
      medicineName: "Levodopa/Karbidopa",
      dose: "1 tablet",
      times: ["07:00", "13:00", "19:00"],
      startDate: day(-45),
      endDate: null,
      instructions: "Diminum 30 menit sebelum makan.",
      isActive: true,
      updatedAt: new Date(now.getTime() - 45 * DAY_MS).toISOString(),
    },
    {
      id: `${patient.id}-s2`,
      patientId: patient.id,
      medicineId: "sample-pramipeksol",
      medicineName: "Pramipeksol",
      dose: "½ tablet",
      times: ["07:00", "19:00"],
      startDate: day(-25),
      endDate: day(66),
      instructions: "Sesudah makan.",
      isActive: true,
      updatedAt: new Date(now.getTime() - 25 * DAY_MS).toISOString(),
    },
  ];
}

// Taken or skipped logs following the patient's compliance; some doses get no log at all,
// so they show up as "Terlewat" once 2 hours have passed.
function buildSampleLogs(patient: PatientListItem, schedules: MedicationSchedule[], now: Date): MedicationLog[] {
  const random = seededRandom(`${patient.id}-logs`);
  const compliance = patient.medicationCompliance ?? 0;
  const logs: MedicationLog[] = [];

  for (const schedule of schedules) {
    for (let offset = 30; offset >= 0; offset -= 1) {
      const date = new Date(now.getTime() - offset * DAY_MS);
      const ymd = toLocalDateKey(date);
      if (ymd < schedule.startDate) continue;
      for (const time of schedule.times) {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
        if (scheduledAt > now) continue;
        const roll = random();
        if (roll >= compliance + (1 - compliance) / 2) continue;
        const taken = roll < compliance;
        const loggedAt = new Date(scheduledAt.getTime() + random() * 40 * 60 * 1000);
        logs.push({
          id: `${schedule.id}-${scheduledAt.getTime()}`,
          scheduleId: schedule.id,
          scheduledAt: scheduledAt.toISOString(),
          status: taken ? "taken" : "skipped",
          takenAt: taken ? loggedAt.toISOString() : null,
          loggedAt: loggedAt.toISOString(),
        });
      }
    }
  }
  return logs;
}

const jumpLinks = [
  { href: "#tes-tremor", label: "Tes Tremor", icon: Activity },
  { href: "#jadwal-obat", label: "Jadwal Obat", icon: Pill },
  { href: "#riwayat-minum-obat", label: "Riwayat Minum Obat", icon: Calendar },
];

export function PatientDetailPage() {
  const { patientId = "" } = useParams();
  const [now] = useState(() => new Date());

  const patient = useMemo(
    () => buildSamplePatients(now).find((candidate) => candidate.id === patientId) ?? null,
    [now, patientId],
  );
  const measurements = useMemo(() => (patient ? buildSampleMeasurements(patient) : []), [patient]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>(() =>
    patient ? buildSampleSchedules(patient, now) : [],
  );
  // The route stays mounted when moving between patients; start from that patient's schedules.
  useEffect(() => {
    setSchedules(patient ? buildSampleSchedules(patient, now) : []);
  }, [patient, now]);
  const logs = useMemo(
    () => (patient ? buildSampleLogs(patient, buildSampleSchedules(patient, now), now) : []),
    [patient, now],
  );

  if (!patient) {
    return (
      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6">
          <p className="text-b8 text-ink">Pasien tidak ditemukan.</p>
          <Button asChild variant="outline" className="h-10 px-4 text-sh8">
            <Link to="/patients">Kembali ke Daftar Pasien</Link>
          </Button>
        </div>
      </main>
    );
  }

  const status = getActivityStatus(patient, now);
  const latestModel = measurements[0]?.device.model;
  const activeSchedules = schedules.filter((schedule) => schedule.isActive);

  // Local state only until the backend is connected (TODO: backend team).
  function addSchedule(input: NewScheduleInput, medicineName: string) {
    const createdAt = new Date().toISOString();
    setSchedules((current) => [
      ...current,
      {
        id: `${patientId}-s${Date.now()}`,
        patientId,
        medicineId: input.medicineId,
        medicineName,
        dose: input.dose,
        times: input.times,
        startDate: input.startDate,
        endDate: input.endDate || null,
        instructions: input.instructions || null,
        isActive: true,
        updatedAt: createdAt,
      },
    ]);
    toast.success("Jadwal ditambahkan.");
  }

  function updateSchedule(scheduleId: string, changes: { endDate: string | null; instructions: string | null }) {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, ...changes, updatedAt: new Date().toISOString() } : schedule,
      ),
    );
    toast.success("Jadwal diperbarui.");
  }

  function stopSchedule(scheduleId: string) {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, isActive: false, updatedAt: new Date().toISOString() } : schedule,
      ),
    );
    toast.success("Jadwal dihentikan.");
  }

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <nav aria-label="Navigasi halaman" className="flex items-center gap-2 text-b8">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 rounded-lg text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Daftar Pasien
        </Link>
        <span aria-hidden="true" className="text-ink-muted">
          /
        </span>
        <span aria-current="page" className="text-ink-muted">
          Detail Pasien
        </span>
      </nav>

      <section
        aria-label="Identitas pasien"
        className="mt-6 flex flex-wrap items-start gap-5 rounded-2xl border border-line bg-surface-raised p-6"
      >
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <User aria-hidden="true" className="size-8" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="mr-1 text-h4 tracking-tight text-primary-600">{patient.fullName}</h1>
            <ActivityStatusBadge status={status} />
            {patient.flag && <FlagBadge reason={patient.flag.reason} />}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-b9 text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Phone aria-hidden="true" className="size-3.5" />
              {formatPhoneNumber(patient.phone)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="size-3.5" />
              Terakhir aktif {patient.lastMeasuredAt ? formatDateTime(patient.lastMeasuredAt) : "—"}
            </span>
            {latestModel && (
              <span className="inline-flex items-center gap-1.5">
                <Smartphone aria-hidden="true" className="size-3.5" />
                {latestModel}
              </span>
            )}
          </p>
          {patient.flag && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warning bg-warning-soft p-3">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-b9 text-ink">{flagReasonText(patient.flag.reason)}</p>
            </div>
          )}
        </div>
      </section>

      <nav aria-label="Bagian halaman" className="mt-6 flex flex-wrap gap-2">
        {jumpLinks.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-2 text-sh8 text-ink-muted hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-6">
        <TremorSection measurements={measurements} now={now} />
        <ScheduleSection
          patientName={patient.fullName}
          schedules={activeSchedules}
          onAdd={addSchedule}
          onUpdate={updateSchedule}
          onStop={stopSchedule}
        />
        <MedicationLogSection schedules={schedules} logs={logs} now={now} />
      </div>
    </main>
  );
}
