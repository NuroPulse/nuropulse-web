import { ChevronRight, Info, KeyRound, TriangleAlert, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { flagReasonText } from "~/components/elements/flag-badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDateTime, formatFullDate } from "~/lib/date";
import { ACTIVE_WITHIN_DAYS, INACTIVE_AFTER_DAYS, getActivityStatus } from "~/lib/patient-status";
import { useCurrentAccount } from "~/modules/Auth";
import { useMyPatients, type PatientListItem } from "~/modules/Patients";

const DAY_MS = 24 * 60 * 60 * 1000;

const noPatients: PatientListItem[] = [];

export function OverviewPage() {
  const account = useCurrentAccount();
  // Fixed for the visit so the numbers do not shift while the doctor reads them.
  const [now] = useState(() => new Date());
  // The same query (and cache) as Daftar Pasien, so the counts match.
  const query = useMyPatients();

  const patients = useMemo(
    () =>
      (query.data ?? noPatients).map((patient) => ({
        ...patient,
        status: getActivityStatus(patient, now),
      })),
    [query.data, now],
  );

  // Flags come with the patient list (computed in the Patients data layer); never recomputed here.
  const flagged = useMemo(
    () =>
      patients
        .filter((patient) => patient.flag)
        .sort((a, b) => (b.lastMeasuredAt ?? "").localeCompare(a.lastMeasuredAt ?? "")),
    [patients],
  );

  // Longest without a measurement first.
  const noCheckIn = useMemo(
    () =>
      patients
        .filter((patient) => patient.status === "no_check_in")
        .sort((a, b) => (a.lastMeasuredAt ?? "").localeCompare(b.lastMeasuredAt ?? "")),
    [patients],
  );

  const activeCount = patients.filter((patient) => patient.status === "active").length;
  const summary = [
    { label: "Pasien terhubung", value: patients.length },
    { label: `Aktif (${ACTIVE_WITHIN_DAYS} hari terakhir)`, value: activeCount },
    { label: "Belum check-in", value: noCheckIn.length },
    { label: "Perlu ditinjau", value: flagged.length },
  ];

  const doctorName = account.data?.profile.fullName;

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
        <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
        {formatFullDate(now)}
      </p>
      <h1 className="mt-2 flex flex-wrap items-center gap-2 text-h4 tracking-tight text-primary-600">
        Hai, dr. {" "}
        {doctorName ?? (account.isPending ? <Skeleton className="h-8 w-40" /> : "Dokter")}
      </h1>
      {query.isPending ? (
        <Skeleton className="mt-2 h-5 w-64" />
      ) : query.isError ? null : (
        <p className="mt-1 text-b8 text-ink-muted">
          {patients.length === 0
            ? "Belum ada pasien yang terhubung dengan Anda."
            : flagged.length > 0
              ? `Ada ${flagged.length} pasien perlu ditinjau.`
              : "Tidak ada yang perlu ditinjau."}
        </p>
      )}

      {query.isPending ? (
        <div aria-busy="true" className="mt-6 grid gap-6 lg:grid-cols-3">
          <span className="sr-only">Memuat…</span>
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-60 rounded-2xl" />
            <Skeleton className="h-30 rounded-2xl" />
          </div>
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6"
        >
          <p className="text-b8 text-ink">
            {query.error.code === "network"
              ? "Tidak ada koneksi internet. Coba lagi."
              : "Terjadi kesalahan. Silakan coba lagi."}
          </p>
          <Button type="button" variant="outline" onClick={() => query.refetch()} className="h-10 px-4 text-sh8">
            Coba lagi
          </Button>
        </div>
      ) : patients.length === 0 ? (
        // A doctor with no connected patient yet: the useful next step is sharing the
        // connection code, which is shown on the Profile page only.
        <section
          aria-labelledby="no-patients-title"
          className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-surface-raised px-6 py-14 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Users aria-hidden="true" className="size-7" />
          </span>
          <h2 id="no-patients-title" className="mt-5 text-h6 text-ink">
            Belum ada pasien terhubung
          </h2>
          <p className="mt-2 max-w-md text-b8 text-ink-muted">
            Bagikan kode koneksi Anda kepada pasien. Setelah pasien memasukkan kode di aplikasi
            NuroPulse, mereka akan muncul di sini dan di Daftar Pasien.
          </p>
          <Button asChild className="mt-6 h-11 gap-2 px-5 text-sh8">
            <Link to="/profile">
              <KeyRound aria-hidden="true" className="size-4.5" />
              Lihat Kode Koneksi
            </Link>
          </Button>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* On large screens the right column sets the row height; this card fills it and its
              list scrolls, so a long list never stretches the page. */}
          <div className="lg:relative lg:col-span-2">
            <section
              aria-labelledby="flagged-title"
              className="flex flex-col rounded-2xl border border-line bg-surface-raised p-6 lg:absolute lg:inset-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="flagged-title" className="text-h6 text-ink">
                  Perlu ditinjau
                </h2>
                <span className="rounded-full bg-warning-soft px-3 py-1 text-sh9 text-warning">
                  {flagged.length} pasien
                </span>
              </div>
              <p className="mt-1 text-b8 text-ink-muted">
                Ditandai dari data 7 hari terakhir.
              </p>

              {flagged.length === 0 ? (
                <p className="mt-6 flex-1 text-b8 text-ink-muted">Tidak ada yang perlu ditinjau.</p>
              ) : (
                <ul
                  tabIndex={0}
                  aria-label="Pasien yang perlu ditinjau"
                  className="mt-4 max-h-96 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:max-h-none"
                >
                  {flagged.map((patient) => (
                    <li key={patient.id} className="flex flex-wrap items-center gap-4 py-5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-primary-600">
                        <User aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sh7 text-ink">{patient.fullName}</p>
                        {patient.flag && (
                          // The icon sits inside the text, so a wrapped second line starts at the
                          // left edge instead of hanging beside the icon.
                          <p className="mt-1 text-b8 text-ink">
                            <TriangleAlert
                              aria-hidden="true"
                              className="mr-1.5 inline size-4 align-text-bottom text-warning"
                            />
                            {flagReasonText(patient.flag.reason)}
                          </p>
                        )}
                        <p className="mt-1 text-b9 text-ink-muted">
                          Terakhir aktif{" "}
                          {patient.lastMeasuredAt ? formatDateTime(patient.lastMeasuredAt) : "—"}
                        </p>
                      </div>
                      <Button asChild className="h-10 px-4 text-sh8">
                        <Link to={`/patients/${patient.id}`}>
                          Lihat Detail
                          <span className="sr-only">{patient.fullName}</span>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-b9 text-ink-muted">
                <Info aria-hidden="true" className="mt-px size-4 shrink-0" />
                Ambang belum dikalibrasi. Status pola tremor memakai ambang awal yang belum divalidasi.
                Gunakan sebagai penanda, bukan kesimpulan klinis.
              </p>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="summary-title"
              className="rounded-2xl border border-line bg-surface-raised p-6"
            >
              <h2 id="summary-title" className="text-sh7 text-ink">
                Ringkasan
              </h2>
              <dl className="mt-3 divide-y divide-line">
                {summary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-b8 text-ink-muted">{item.label}</dt>
                    <dd className="text-h5 text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                to="/patients"
                className="mt-3 inline-flex items-center gap-1 rounded-lg text-sh8 text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Lihat Daftar Pasien
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </section>

            <section
              aria-labelledby="no-check-in-title"
              className="flex flex-1 flex-col rounded-2xl border border-line bg-surface-raised p-6"
            >
              <h2 id="no-check-in-title" className="text-sh7 text-ink">
                Belum check-in
              </h2>
              <p className="text-b9 text-ink-muted">
                Tidak ada pengukuran {ACTIVE_WITHIN_DAYS}–{INACTIVE_AFTER_DAYS - 1} hari
              </p>

              {noCheckIn.length === 0 ? (
                <p className="mt-4 flex-1 text-b8 text-ink-muted">
                  Tidak ada pasien yang belum check-in.
                </p>
              ) : (
                // About three rows tall; the rest scrolls, so this card keeps a steady height.
                <ul
                  tabIndex={0}
                  aria-label="Pasien yang belum check-in"
                  className="mt-3 max-h-36 divide-y divide-line overflow-y-auto pr-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {noCheckIn.map((patient) => {
                    const days = patient.lastMeasuredAt
                      ? Math.floor((now.getTime() - new Date(patient.lastMeasuredAt).getTime()) / DAY_MS)
                      : 0;
                    return (
                      <li key={patient.id} className="flex items-center justify-between gap-4 py-3">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="truncate rounded-lg text-sh8 text-ink hover:text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {patient.fullName}
                        </Link>
                        <span className="shrink-0 text-b9 text-ink-muted">{days} hari</span>
                      </li>
                    );
                  })}
                </ul>
              )}

            </section>
          </div>
        </div>
      )}
    </main>
  );
}
