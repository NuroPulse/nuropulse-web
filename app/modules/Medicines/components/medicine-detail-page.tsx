import { ArrowLeft, ChevronRight, Info, Pill, User } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatClockTime, formatShortDate } from "~/lib/date";
import { useMedicine, useMedicineUsage } from "../hooks";
import type { MedicineFailure } from "../types";

function errorText(failure: MedicineFailure) {
  return failure.code === "network"
    ? "Tidak ada koneksi internet. Coba lagi."
    : "Terjadi kesalahan. Silakan coba lagi.";
}

export function MedicineDetailPage() {
  // The route always has :medicineId; the fallback only satisfies the optional param type.
  const { medicineId = "" } = useParams();
  const medicine = useMedicine(medicineId);
  const usage = useMedicineUsage(medicineId);

  let medicineCard: ReactNode;

  if (medicine.isPending) {
    medicineCard = (
      <div aria-busy="true" className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-7">
        <span className="sr-only">Memuat…</span>
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="mt-8 h-16 w-full" />
        <Skeleton className="mt-5 h-16 w-full" />
      </div>
    );
  } else if (medicine.isError) {
    medicineCard = (
      <div
        role="alert"
        className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6"
      >
        <p className="text-b8 text-ink">{errorText(medicine.error)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => medicine.refetch()}
          className="h-10 px-4 text-sh8"
        >
          Coba lagi
        </Button>
      </div>
    );
  } else if (!medicine.data) {
    medicineCard = (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6">
        <p className="text-b8 text-ink">Obat tidak ditemukan.</p>
        <Button asChild variant="outline" className="h-10 px-4 text-sh8">
          <Link to="/medicines">Kembali ke Daftar Obat</Link>
        </Button>
      </div>
    );
  } else {
    const { name, createdByName, createdAt, commonDosage, notes } = medicine.data;
    medicineCard = (
      <article className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
            <Pill aria-hidden="true" className="size-7" />
          </span>
          <div className="min-w-0">
            <h1 className="text-h4 tracking-tight text-primary-600">{name}</h1>
            <p className="text-b9 text-ink-muted">
              Ditambahkan oleh {createdByName ?? "—"} · {formatShortDate(createdAt)}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-sh7 text-ink">Dosis umum (referensi)</h2>
        <p className="mt-2 text-b8 whitespace-pre-line text-ink-muted">{commonDosage}</p>

        <h2 className="mt-6 text-sh7 text-ink">Catatan</h2>
        <p className="mt-2 text-b8 whitespace-pre-line text-ink-muted">{notes ?? "—"}</p>

        <div
          role="note"
          className="mt-6 flex items-start gap-3 rounded-xl border border-success bg-success-soft p-3"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-success" />
          <p className="text-b8 text-ink">
            Dosis umum hanya referensi. Dosis untuk setiap pasien diatur di jadwal obat pasien.
          </p>
        </div>
      </article>
    );
  }

  let usageBody: ReactNode;

  if (usage.isPending) {
    usageBody = (
      <div aria-busy="true" className="mt-4 flex flex-col gap-3">
        <span className="sr-only">Memuat…</span>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  } else if (usage.isError) {
    usageBody = (
      <div role="alert" className="mt-4 flex flex-col items-start gap-3">
        <p className="text-b8 text-ink">{errorText(usage.error)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => usage.refetch()}
          className="h-10 px-4 text-sh8"
        >
          Coba lagi
        </Button>
      </div>
    );
  } else if (usage.data.length === 0) {
    usageBody = (
      <p className="mt-4 text-b8 text-ink-muted">
        Belum ada pasien Anda yang memakai obat ini.
      </p>
    );
  } else {
    usageBody = (
      <ul className="mt-4 divide-y divide-line">
        {usage.data.map((item) => (
          <li key={item.scheduleId} className="flex items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <User aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sh8 text-ink">{item.patientName}</p>
              <p className="text-b9 text-ink-muted">
                {item.dose} · {item.times.map(formatClockTime).join(", ")}
              </p>
            </div>
            <Link
              to={`/patients/${item.patientId}`}
              className="inline-flex items-center gap-1 rounded-lg text-sh9 text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Lihat
              <ChevronRight aria-hidden="true" className="size-4" />
              <span className="sr-only">{item.patientName}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <nav aria-label="Navigasi halaman" className="flex items-center gap-2 text-b8">
        <Link
          to="/medicines"
          className="inline-flex items-center gap-1.5 rounded-lg text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Daftar Obat
        </Link>
        <span aria-hidden="true" className="text-ink-muted">
          /
        </span>
        <span aria-current="page" className="text-ink-muted">
          Detail Obat
        </span>
      </nav>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">{medicineCard}</div>

        <section
          aria-labelledby="medicine-usage-title"
          className="rounded-2xl border border-line bg-surface-raised p-6 lg:col-span-2"
        >
          <h2 id="medicine-usage-title" className="text-sh7 text-ink">
            Dipakai di jadwal Anda
          </h2>
          <p className="text-b9 text-ink-muted">Pasien Anda yang memiliki jadwal aktif dengan obat ini</p>
          {usageBody}
        </section>
      </div>
    </main>
  );
}
