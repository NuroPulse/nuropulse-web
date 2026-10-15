import { ChevronLeft, ChevronRight, Pill, Plus, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { useDebouncedValue } from "~/lib/use-debounced-value";
import { MEDICINES_PAGE_SIZE } from "../api";
import { useMedicines } from "../hooks";
import { AddMedicineDialog } from "./add-medicine-dialog";

const columns = ["Nama obat", "Dosis umum (referensi)", "Catatan", "Ditambahkan oleh"];

export function MedicineListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const medicines = useMedicines({ search: debouncedSearch, page });

  const total = medicines.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / MEDICINES_PAGE_SIZE));
  const firstShown = total === 0 ? 0 : (page - 1) * MEDICINES_PAGE_SIZE + 1;
  const lastShown = Math.min(page * MEDICINES_PAGE_SIZE, total);

  const addButton = (
    <Button type="button" onClick={() => setAddOpen(true)} className="h-11 gap-2 px-5 text-sh8">
      <Plus aria-hidden="true" className="size-4.5" />
      Tambah Obat
    </Button>
  );

  let body: ReactNode;

  if (medicines.isPending) {
    body = (
      <div aria-busy="true" className="flex flex-col gap-3 p-4">
        <span className="sr-only">Memuat…</span>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  } else if (medicines.isError) {
    body = (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-b8 text-ink">
          {medicines.error.code === "network"
            ? "Tidak ada koneksi internet. Coba lagi."
            : "Terjadi kesalahan. Silakan coba lagi."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => medicines.refetch()}
          className="h-10 px-4 text-sh8"
        >
          Coba lagi
        </Button>
      </div>
    );
  } else if (medicines.data.items.length === 0) {
    body = debouncedSearch.trim() ? (
      <p className="px-4 py-12 text-center text-b8 text-ink-muted">
        Tidak ada obat yang cocok dengan pencarian.
      </p>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-b8 text-ink-muted">Belum ada data.</p>
        {addButton}
      </div>
    );
  } else {
    body = (
      <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left">
            <thead className="bg-surface">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 text-sh9 whitespace-nowrap text-ink-muted"
                  >
                    {column}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {medicines.data.items.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                        <Pill aria-hidden="true" className="size-4" />
                      </span>
                      <span className="text-sh9 text-ink">{medicine.name}</span>
                    </div>
                  </td>
                  <td className="max-w-60 px-4 py-3 text-b9 text-ink-muted">
                    <span className="line-clamp-2">{medicine.commonDosage}</span>
                  </td>
                  <td className="max-w-72 px-4 py-3 text-b9 text-ink-muted">
                    <span className="line-clamp-2">{medicine.notes ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-b9 text-ink-muted">
                    {medicine.createdByName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/medicines/${medicine.id}`}
                      className="inline-flex items-center gap-1 rounded-lg text-sh9 whitespace-nowrap text-primary-600 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      Lihat Detail
                      <ChevronRight aria-hidden="true" className="size-4" />
                      <span className="sr-only">{medicine.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-b9 text-ink-muted">
            Menampilkan {firstShown}–{lastShown} dari {total} obat
          </p>
          {pageCount > 1 && (
            <nav aria-label="Halaman daftar obat" className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Halaman sebelumnya"
                className="border border-line text-ink-muted"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <Button
                  key={number}
                  type="button"
                  variant={number === page ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setPage(number)}
                  aria-label={`Halaman ${number}`}
                  aria-current={number === page ? "page" : undefined}
                  className={cn("text-b9", number !== page && "border border-line text-ink-muted")}
                >
                  {number}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
            <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
            Katalog bersama semua dokter
          </p>
          <h1 className="mt-2 text-h4 tracking-tight text-primary-600">Daftar Obat</h1>
          <p className="mt-1 text-b8 text-ink-muted">
            Pilih obat dari sini saat membuat jadwal pasien. Dosis umum hanya referensi, bukan
            dosis pasien.
          </p>
        </div>
        {addButton}
      </div>

      <label className="relative mt-6 block w-full">
        <span className="sr-only">Cari obat</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          placeholder="Cari obat"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="h-9 bg-surface-raised pl-9 text-b8 md:text-b8"
        />
      </label>

      <section
        aria-label="Daftar Obat"
        className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface-raised"
      >
        {body}
      </section>

      <AddMedicineDialog open={addOpen} onOpenChange={setAddOpen} />
    </main>
  );
}
