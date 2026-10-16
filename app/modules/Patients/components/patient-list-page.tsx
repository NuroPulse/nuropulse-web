import { ChevronDown, ChevronLeft, ChevronRight, Search, TriangleAlert, User } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";

import { ActivityStatusBadge } from "~/components/elements/activity-status-badge";
import { FlagBadge } from "~/components/elements/flag-badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDateTime } from "~/lib/date";
import {
  getActivityStatus,
  getComplianceBucket,
  type ActivityStatus,
  type ComplianceBucket,
} from "~/lib/patient-status";
import { formatPhoneNumber } from "~/lib/phone";
import { cn } from "~/lib/utils";
import { useMyPatients } from "../hooks";

const PAGE_SIZE = 20;

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
  const query = useMyPatients();
  const patients = useMemo(
    () => (query.data ?? []).map((patient) => ({ ...patient, status: getActivityStatus(patient, now) })),
    [query.data, now],
  );

  const [search, setSearch] = useState("");
  // Other pages can open a tab directly, for example /patients?status=no_check_in.
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<StatusFilter>(() => {
    const requested = searchParams.get("status");
    return statusTabs.some((tab) => tab.value === requested) ? (requested as StatusFilter) : "all";
  });
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

  if (query.isPending) {
    body = (
      <div aria-busy="true" className="flex flex-col gap-3 p-4">
        <span className="sr-only">Memuat…</span>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  } else if (query.isError) {
    body = (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-b8 text-ink">
          {query.error.code === "network"
            ? "Tidak ada koneksi internet. Coba lagi."
            : "Terjadi kesalahan. Silakan coba lagi."}
        </p>
        <Button type="button" variant="outline" onClick={() => query.refetch()} className="h-10 px-4 text-sh8">
          Coba lagi
        </Button>
      </div>
    );
  } else if (patients.length === 0) {
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
                    {patient.phone ? formatPhoneNumber(patient.phone) : "Tidak tersedia"}
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
