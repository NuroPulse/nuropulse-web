import { ChevronDown, ChevronLeft, ChevronRight, Search, TriangleAlert, User } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";

import { ActivityStatusBadge } from "~/components/elements/activity-status-badge";
import { FlagBadge } from "~/components/elements/flag-badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatDateTime } from "~/lib/date";
import {
  getActivityStatus,
  getComplianceBucket,
  type ActivityStatus,
  type ComplianceBucket,
} from "~/lib/patient-status";
import { formatPhoneNumber } from "~/lib/phone";
import { cn } from "~/lib/utils";
import type { PatientListItem } from "../types";

const PAGE_SIZE = 20;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// TODO: Replace with Supabase query (backend team).
// Sample data only, with fictional names. Times are relative to "now" so each patient keeps
// the activity status it was written for.
export function buildSamplePatients(now: Date): PatientListItem[] {
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const tremor = (detectedCount: number) => ({ reason: { kind: "tremor_pattern" as const, detectedCount } });
  const lowMedication = { reason: { kind: "medication_compliance" as const } };

  return [
    { id: "sample-01", fullName: "Budi Santoso", phone: "+6281234567890", connectedAt: ago(90 * DAY_MS), lastMeasuredAt: ago(5 * HOUR_MS), flag: tremor(4), medicationCompliance: 0.86, checkInCompliance: 1 },
    { id: "sample-02", fullName: "Siti Rahmawati", phone: "+6281322104471", connectedAt: ago(60 * DAY_MS), lastMeasuredAt: ago(6 * HOUR_MS), flag: lowMedication, medicationCompliance: 0.38, checkInCompliance: 0.86 },
    { id: "sample-03", fullName: "Agus Pratama", phone: "+6285711882034", connectedAt: ago(45 * DAY_MS), lastMeasuredAt: ago(4 * DAY_MS), flag: tremor(3), medicationCompliance: 0.71, checkInCompliance: 0.43 },
    { id: "sample-04", fullName: "Dewi Lestari", phone: "+6282177310092", connectedAt: ago(40 * DAY_MS), lastMeasuredAt: ago(16 * HOUR_MS), flag: null, medicationCompliance: 0.95, checkInCompliance: 1 },
    { id: "sample-05", fullName: "Hendra Wijaya", phone: "+6287855201180", connectedAt: ago(70 * DAY_MS), lastMeasuredAt: ago(5 * DAY_MS), flag: null, medicationCompliance: 0.62, checkInCompliance: 0.29 },
    { id: "sample-06", fullName: "Rina Marlina", phone: "+6281299023317", connectedAt: ago(35 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: null, medicationCompliance: 0.81, checkInCompliance: 0.86 },
    { id: "sample-07", fullName: "Joko Susilo", phone: "+6285644712209", connectedAt: ago(80 * DAY_MS), lastMeasuredAt: ago(16 * DAY_MS), flag: null, medicationCompliance: 0.2, checkInCompliance: 0 },
    { id: "sample-08", fullName: "Sri Wahyuni", phone: "+6281133076612", connectedAt: ago(4 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-09", fullName: "Andi Kurniawan", phone: "+6281245678901", connectedAt: ago(55 * DAY_MS), lastMeasuredAt: ago(2 * HOUR_MS), flag: null, medicationCompliance: 0.9, checkInCompliance: 1 },
    { id: "sample-10", fullName: "Lukas Halim", phone: "+6281366120045", connectedAt: ago(50 * DAY_MS), lastMeasuredAt: ago(6 * DAY_MS), flag: null, medicationCompliance: 0.55, checkInCompliance: 0.14 },
    { id: "sample-11", fullName: "Maria Ulfa", phone: "+6285233419087", connectedAt: ago(30 * DAY_MS), lastMeasuredAt: ago(2 * DAY_MS), flag: tremor(3), medicationCompliance: 0.79, checkInCompliance: 0.71 },
    { id: "sample-12", fullName: "Yusuf Hidayat", phone: "+6281277458830", connectedAt: ago(100 * DAY_MS), lastMeasuredAt: ago(30 * DAY_MS), flag: null, medicationCompliance: 0.1, checkInCompliance: 0 },
    { id: "sample-13", fullName: "Nur Aini", phone: "+6287812094456", connectedAt: ago(25 * DAY_MS), lastMeasuredAt: ago(20 * HOUR_MS), flag: lowMedication, medicationCompliance: 0.45, checkInCompliance: 0.57 },
    { id: "sample-14", fullName: "Bambang Suryadi", phone: "+6281390875521", connectedAt: ago(65 * DAY_MS), lastMeasuredAt: ago(9 * DAY_MS), flag: null, medicationCompliance: 0.6, checkInCompliance: 0 },
    { id: "sample-15", fullName: "Fitri Handayani", phone: "+6285798762310", connectedAt: ago(20 * DAY_MS), lastMeasuredAt: ago(10 * HOUR_MS), flag: null, medicationCompliance: 1, checkInCompliance: 0.86 },
    { id: "sample-16", fullName: "Rudi Hartono", phone: "+6281211223344", connectedAt: ago(18 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-17", fullName: "Wulan Sari", phone: "+6282133445566", connectedAt: ago(2 * DAY_MS), lastMeasuredAt: null, flag: null, medicationCompliance: null, checkInCompliance: 0 },
    { id: "sample-18", fullName: "Teguh Prasetyo", phone: "+6281355667788", connectedAt: ago(75 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: tremor(5), medicationCompliance: 0.68, checkInCompliance: 0.71 },
    { id: "sample-19", fullName: "Ayu Lestari", phone: "+6285677889900", connectedAt: ago(45 * DAY_MS), lastMeasuredAt: ago(3 * HOUR_MS), flag: null, medicationCompliance: 0.88, checkInCompliance: 1 },
    { id: "sample-20", fullName: "Dimas Saputra", phone: "+6281299887766", connectedAt: ago(85 * DAY_MS), lastMeasuredAt: ago(21 * DAY_MS), flag: null, medicationCompliance: 0.3, checkInCompliance: 0 },
    { id: "sample-21", fullName: "Lina Marlina", phone: "+6287766554433", connectedAt: ago(15 * DAY_MS), lastMeasuredAt: ago(12 * HOUR_MS), flag: null, medicationCompliance: 0.92, checkInCompliance: 0.71 },
    { id: "sample-22", fullName: "Eko Saputro", phone: "+6281344332211", connectedAt: ago(28 * DAY_MS), lastMeasuredAt: ago(8 * HOUR_MS), flag: null, medicationCompliance: null, checkInCompliance: 0.57 },
    { id: "sample-23", fullName: "Ratna Dewi", phone: "+6285611223344", connectedAt: ago(33 * DAY_MS), lastMeasuredAt: ago(7 * DAY_MS), flag: lowMedication, medicationCompliance: 0.42, checkInCompliance: 0.14 },
    { id: "sample-24", fullName: "Gilang Ramadhan", phone: "+6281277665544", connectedAt: ago(12 * DAY_MS), lastMeasuredAt: ago(1 * DAY_MS), flag: null, medicationCompliance: 0.75, checkInCompliance: 0.86 },
    { id: "sample-25", fullName: "Putri Ayuningtyas", phone: "+6282155443322", connectedAt: ago(38 * DAY_MS), lastMeasuredAt: ago(15 * HOUR_MS), flag: null, medicationCompliance: 0.83, checkInCompliance: 1 },
  ];
}

type StatusFilter = "all" | ActivityStatus;
type FlagFilter = "all" | "flagged" | "not_flagged";
// "" (no compliance filter) or "<measure>:<bucket>", for example "medication:low".
type ComplianceFilter = "" | `${"medication" | "check_in"}:${ComplianceBucket}`;

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "no_check_in", label: "Belum check-in" },
  { value: "inactive", label: "Tidak aktif" },
  { value: "no_measurement", label: "Belum ada pengukuran" },
];

const bucketLabels: Record<ComplianceBucket, string> = { good: "Baik", fair: "Sedang", low: "Rendah" };

const columns = ["Nama pasien", "Nomor telepon", "Status aktivitas", "Pengukuran terakhir", "Penanda"];

const selectClassName =
  "h-11 w-full appearance-none rounded-lg border border-input bg-surface-raised pr-9 pl-3 text-b8 text-ink focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function PatientListPage() {
  // The status is computed once per visit so it does not shift while the doctor reads the list.
  const [now] = useState(() => new Date());
  const patients = useMemo(() => {
    const rows = buildSamplePatients(now).map((patient) => ({
      ...patient,
      status: getActivityStatus(patient, now),
    }));
    // Most recent measurement first; patients who never measured go last (CLAUDE.md Section 9).
    return rows.sort((a, b) => (b.lastMeasuredAt ?? "").localeCompare(a.lastMeasuredAt ?? ""));
  }, [now]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [compliance, setCompliance] = useState<ComplianceFilter>("");
  const [flag, setFlag] = useState<FlagFilter>("all");
  const [page, setPage] = useState(1);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: patients.length,
      active: 0,
      no_check_in: 0,
      inactive: 0,
      no_measurement: 0,
    };
    for (const patient of patients) counts[patient.status] += 1;
    return counts;
  }, [patients]);
  const flaggedCount = useMemo(() => patients.filter((patient) => patient.flag).length, [patients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return patients.filter((patient) => {
      if (term && !patient.fullName.toLowerCase().includes(term)) return false;
      if (status !== "all" && patient.status !== status) return false;
      if (flag === "flagged" && !patient.flag) return false;
      if (flag === "not_flagged" && patient.flag) return false;
      if (compliance) {
        const [measure, bucket] = compliance.split(":");
        const ratio = measure === "medication" ? patient.medicationCompliance : patient.checkInCompliance;
        if (getComplianceBucket(ratio) !== bucket) return false;
      }
      return true;
    });
  }, [patients, search, status, flag, compliance]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstShown = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const hasFilters = Boolean(search.trim()) || status !== "all" || compliance !== "" || flag !== "all";

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setCompliance("");
    setFlag("all");
    setPage(1);
  }

  let body: ReactNode;

  if (patients.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <p className="text-b8 text-ink">Belum ada data.</p>
        <p className="max-w-md text-b9 text-ink-muted">
          Bagikan kode koneksi Anda kepada pasien agar mereka muncul di sini. Kode ada di halaman{" "}
          <Link to="/profile" className="text-sh9 text-primary-600 hover:underline">
            Profil Saya
          </Link>
          .
        </p>
      </div>
    );
  } else if (filtered.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-b8 text-ink-muted">Tidak ada pasien yang cocok dengan pencarian atau filter.</p>
        <Button type="button" variant="outline" onClick={resetFilters} className="h-10 px-4 text-sh8">
          Atur ulang filter
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-4xl text-left">
            <thead className="bg-surface">
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 text-sh9 text-ink-muted">
                    {column}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageRows.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <User aria-hidden="true" className="size-4.5" />
                      </span>
                      <span className="text-sh9 text-ink">{patient.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {formatPhoneNumber(patient.phone)}
                  </td>
                  <td className="px-4 py-3">
                    <ActivityStatusBadge status={patient.status} />
                  </td>
                  <td className="px-4 py-3 text-b9 whitespace-nowrap text-ink-muted">
                    {patient.lastMeasuredAt ? formatDateTime(patient.lastMeasuredAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {patient.flag ? (
                      <FlagBadge reason={patient.flag.reason} />
                    ) : (
                      <span className="text-b9 text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/patients/${patient.id}`}
                      className="inline-flex items-center gap-1 rounded-lg text-sh9 whitespace-nowrap text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      Lihat Detail
                      <ChevronRight aria-hidden="true" className="size-4" />
                      <span className="sr-only">{patient.fullName}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-b9 text-ink-muted">
            Menampilkan {firstShown}–{lastShown} dari {filtered.length} pasien
          </p>
          {pageCount > 1 && (
            <nav aria-label="Halaman daftar pasien" className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className="border border-line text-ink-muted"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <Button
                  key={number}
                  type="button"
                  variant={number === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setPage(number)}
                  aria-label={`Halaman ${number}`}
                  aria-current={number === currentPage ? "page" : undefined}
                  className={cn("text-b9", number !== currentPage && "border border-line text-ink-muted")}
                >
                  {number}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                disabled={currentPage === pageCount}
                aria-label="Halaman berikutnya"
                className="border border-line text-ink-muted"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          )}
        </div>
      </>
    );
  }

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
        <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
        {patients.length} pasien terhubung
      </p>
      <h1 className="mt-2 text-h4 tracking-tight text-primary-600">Daftar Pasien</h1>
      <p className="mt-1 text-b8 text-ink-muted">
        Semua pasien yang memasukkan kode koneksi Anda di aplikasi NuroPulse.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Status aktivitas" className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const selected = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sh8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "border-secondary-300 bg-secondary-50 text-secondary-700"
                    : "border-line bg-surface-raised text-ink-muted hover:text-ink",
                )}
              >
                {tab.label} · {statusCounts[tab.value]}
              </button>
            );
          })}
        </div>

        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-line sm:block" />

        {/* Independent of the status tabs, so it combines with them (e.g. Aktif + Perlu ditinjau). */}
        <button
          type="button"
          aria-pressed={flag === "flagged"}
          onClick={() => {
            setFlag(flag === "flagged" ? "all" : "flagged");
            setPage(1);
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sh8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            flag === "flagged"
              ? "border-warning bg-warning-soft text-warning"
              : "border-line bg-surface-raised text-ink-muted hover:text-ink",
          )}
        >
          <TriangleAlert aria-hidden="true" className="size-4" />
          Perlu ditinjau · {flaggedCount}
        </button>
      </div>

      <section
        aria-label="Daftar Pasien"
        className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface-raised"
      >
        <div className="flex flex-wrap gap-3 p-4">
          <label className="relative block min-w-56 flex-1 lg:max-w-sm">
            <span className="sr-only">Cari pasien</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-ink-muted"
            />
            <Input
              type="search"
              placeholder="Cari pasien"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-11 pl-10 text-b8 md:text-b8"
            />
          </label>

          <label className="relative block w-full sm:w-48">
            <span className="sr-only">Status aktivitas</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="all">Semua status</option>
              {statusTabs.slice(1).map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            />
          </label>

          <label className="relative block w-full sm:w-56">
            <span className="sr-only">Filter Kepatuhan</span>
            <select
              value={compliance}
              onChange={(event) => {
                setCompliance(event.target.value as ComplianceFilter);
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="">Filter Kepatuhan</option>
              <optgroup label="Kepatuhan obat">
                {(Object.keys(bucketLabels) as ComplianceBucket[]).map((bucket) => (
                  <option key={bucket} value={`medication:${bucket}`}>
                    Kepatuhan obat: {bucketLabels[bucket]}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kepatuhan check-in">
                {(Object.keys(bucketLabels) as ComplianceBucket[]).map((bucket) => (
                  <option key={bucket} value={`check_in:${bucket}`}>
                    Kepatuhan check-in: {bucketLabels[bucket]}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            />
          </label>

          <label className="relative block w-full sm:w-44">
            <span className="sr-only">Penanda</span>
            <select
              value={flag}
              onChange={(event) => {
                setFlag(event.target.value as FlagFilter);
                setPage(1);
              }}
              className={selectClassName}
            >
              <option value="all">Penanda</option>
              <option value="flagged">Perlu ditinjau</option>
              <option value="not_flagged">Tidak ditandai</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            />
          </label>

          {hasFilters && (
            <Button
              type="button"
              variant="link"
              onClick={resetFilters}
              className="h-11 px-1 text-sh8 text-primary-600"
            >
              Atur ulang filter
            </Button>
          )}
        </div>

        {body}
      </section>
    </main>
  );
}
