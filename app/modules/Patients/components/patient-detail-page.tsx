import { Activity, ArrowLeft, Calendar, Clock, Phone, Pill, Smartphone, TriangleAlert, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { ActivityStatusBadge } from "~/components/elements/activity-status-badge";
import { FlagBadge, flagReasonText } from "~/components/elements/flag-badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDateTime } from "~/lib/date";
import { getActivityStatus } from "~/lib/patient-status";
import { formatPhoneNumber } from "~/lib/phone";
import { usePatient } from "../hooks";
import type { Measurement, PatientListItem } from "../types";
import { MedicationLogSection } from "./medication-log-section";
import { ScheduleSection } from "./schedule-section";
import { TremorSection } from "./tremor-section";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// TODO: Replace measurements with a Supabase query.
// Sample data only. Generated from the patient id so each patient always gets the same
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

const jumpLinks = [
  { href: "#tes-tremor", label: "Tes Tremor", icon: Activity },
  { href: "#jadwal-obat", label: "Jadwal Obat", icon: Pill },
  { href: "#riwayat-minum-obat", label: "Riwayat Minum Obat", icon: Calendar },
];

export function PatientDetailPage() {
  const { patientId = "" } = useParams();
  const [now] = useState(() => new Date());

  const patientQuery = usePatient(patientId);
  const patient = patientQuery.data ?? null;
  const measurements = useMemo(() => (patient ? buildSampleMeasurements(patient) : []), [patient]);

  if (patientQuery.isPending) {
    return (
      <main aria-busy="true" className="px-6 py-8 lg:px-10 lg:py-10">
        <span className="sr-only">Memuat…</span>
        <Skeleton className="h-5 w-48" />
        <div className="mt-6 flex items-start gap-5 rounded-2xl border border-line bg-surface-raised p-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </main>
    );
  }

  if (patientQuery.isError) {
    return (
      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6"
        >
          <p className="text-b8 text-ink">
            {patientQuery.error.code === "network"
              ? "Tidak ada koneksi internet. Coba lagi."
              : "Terjadi kesalahan. Silakan coba lagi."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => patientQuery.refetch()}
            className="h-10 px-4 text-sh8"
          >
            Coba lagi
          </Button>
        </div>
      </main>
    );
  }

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
              {patient.phone ? formatPhoneNumber(patient.phone) : "Tidak tersedia"}
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
        <ScheduleSection patientId={patient.id} patientName={patient.fullName} />
        <MedicationLogSection patientId={patient.id} now={now} />
      </div>
    </main>
  );
}
