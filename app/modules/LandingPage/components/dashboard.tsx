import { Search } from "lucide-react";

import { Bubble } from "~/components/elements/bubble";
import { cn } from "~/lib/utils";

// Illustration only: static sample data for the dashboard mockup, never real patients.
const samplePatients = [
  { name: "Pasien A", badge: "Perlu ditinjau", badgeClassName: "bg-warning-soft text-warning" },
  { name: "Pasien B", badge: "Aktif", badgeClassName: "bg-secondary-100 text-secondary-700" },
  { name: "Pasien C", badge: "Belum check-in", badgeClassName: "bg-surface-sunken text-ink-muted" },
  { name: "Pasien D", badge: "Aktif", badgeClassName: "bg-secondary-100 text-secondary-700" },
];

const sampleStats = [
  { label: "Pasien aktif", value: "24" },
  { label: "Belum check-in", value: "5" },
  { label: "Perlu ditinjau", value: "3" },
];

const sampleTrend = [
  { height: "h-1/3", detected: false, dosed: true },
  { height: "h-1/2", detected: false, dosed: false },
  { height: "h-2/5", detected: false, dosed: true },
  { height: "h-2/3", detected: true, dosed: true },
  { height: "h-3/5", detected: true, dosed: false },
  { height: "h-1/2", detected: false, dosed: true },
  { height: "h-3/4", detected: true, dosed: true },
  { height: "h-1/2", detected: false, dosed: true },
  { height: "h-2/5", detected: false, dosed: false },
  { height: "h-3/5", detected: true, dosed: true },
  { height: "h-1/2", detected: false, dosed: true },
  { height: "h-3/4", detected: true, dosed: false },
  { height: "h-2/5", detected: false, dosed: true },
  { height: "h-2/5", detected: false, dosed: true },
];

export function Dashboard() {
  return (
    <section id="pratinjau" className="relative mx-auto max-w-5xl px-4 pt-24 sm:px-8">
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
          <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
          Dashboard neurolog
        </p>
        <h2 className="mt-3 text-h4 tracking-tight text-primary-600 lg:text-h3">
          Semua pasien Anda dalam satu layar
        </h2>
        <p className="mt-4 text-body text-ink-muted">
          Ringkasan pasien aktif, yang belum check-in, dan yang perlu ditinjau, lalu langsung ke
          tren tremor dan riwayat minum obat tiap pasien.
        </p>
      </div>

      <figure className="relative mt-10">
        <Bubble tone="blue" className="-bottom-16 -left-36 -z-10 size-72 lg:-left-40 lg:size-80" />
        <div className="rounded-2xl border border-line bg-surface-raised p-4 text-card-foreground sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-h7">Hai, dr. Vanka</p>
              <p className="text-b9 text-ink-muted">Ringkasan pasien Anda hari ini</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-b9 text-ink-muted">
              <Search aria-hidden="true" className="size-3.5" />
              Cari pasien
            </span>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-line border-b border-line py-4">
            {sampleStats.map((stat) => (
              <div key={stat.label} className="px-3 first:pl-0">
                <dt className="text-b9 text-ink-muted">{stat.label}</dt>
                <dd className="text-h5 text-primary-600">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-6 pt-4 md:grid-cols-2">
            <div>
              <p className="text-h8">Daftar Pasien</p>
              <ul className="mt-2 divide-y divide-line">
                {samplePatients.map((patient) => (
                  <li key={patient.name} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-b8">{patient.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-sh9 whitespace-nowrap",
                        patient.badgeClassName,
                      )}
                    >
                      {patient.badge}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-h8">Tren tremor · Pasien A</p>
              </div>
              <div
                aria-hidden="true"
                className="relative mt-2 flex h-28 items-end gap-1 border-b border-line-strong"
              >
                <div className="absolute inset-x-0 top-7.5 h-8.5 border-y border-dashed border-primary-400 bg-primary-50" />
                {sampleTrend.map((bar, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative flex-1",
                      bar.height,
                      bar.detected ? "bg-primary-600" : "bg-primary-200",
                    )}
                  />
                ))}
              </div>
              <div aria-hidden="true" className="mt-1 flex gap-1">
                {sampleTrend.map((bar, i) => (
                  <span
                    key={i}
                    className={cn("h-2 flex-1 rounded-full", bar.dosed ? "bg-secondary-500" : "bg-surface-sunken")}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-b9 text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary-600" />
                  Pola tremor terdeteksi
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-secondary-500" />
                  Obat diminum
                </span>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-b9 text-ink-muted">
          Ilustrasi tampilan dashboard dokter dengan data contoh, bukan data pasien sungguhan.
        </figcaption>
      </figure>
    </section>
  );
}
