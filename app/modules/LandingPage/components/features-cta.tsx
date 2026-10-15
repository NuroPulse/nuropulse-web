import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Bubble } from "~/components/elements/bubble";
import { TremorWave } from "~/components/elements/tremor-wave";
import { Tulip } from "~/components/elements/tulip";

export function FeaturesCta() {
  return (
    <>
      <section id="fitur" className="relative mx-auto max-w-5xl px-4 pt-24 sm:px-8">
        <Bubble tone="green" className="top-40 -left-56 -z-10 size-96 lg:-left-72" />
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
            <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
            Fitur untuk dokter
          </p>
          <h2 className="mt-3 text-h4 tracking-tight text-primary-600 lg:text-h3">
            Data kuantitatif untuk melengkapi cerita pasien
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line rounded-2xl border border-line bg-surface-raised px-6 md:px-8">
          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-600 md:col-span-4">
              Daftar pasien dan penanda "Perlu ditinjau"
            </h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Lihat siapa yang aktif, siapa yang belum check-in, dan siapa yang datanya sebaiknya
                Anda lihat lebih dulu, lengkap dengan alasannya.
              </p>
              <dl aria-hidden="true" className="mt-4 grid gap-2 rounded-xl border border-line bg-surface p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 text-b8">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="rounded-full bg-warning-soft px-2.5 py-0.5 text-sh9 text-warning">
                    Perlu ditinjau
                  </dt>
                  <dd className="text-ink-muted">
                    Pola tremor terdeteksi di 3 dari 5 pengukuran terakhir
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="text-sh8">Belum check-in</dt>
                  <dd className="text-ink-muted">Tidak ada pengukuran dalam 5 hari</dd>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-sh9 text-secondary-700">
                    Aktif
                  </dt>
                  <dd className="text-ink-muted">Pengukuran rutin sesuai jadwal</dd>
                </div>
              </dl>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-600 md:col-span-4">
              Jadwal dan riwayat minum obat
            </h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Atur jadwal obat tiap pasien, lalu lihat dosis yang diminum, dilewati, atau terlewat
                di samping tren tremornya.
              </p>
              <div aria-hidden="true" className="mt-4 rounded-xl border border-line bg-surface p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 text-b8">
                <p>
                  <span className="text-sh8">[Nama obat] · [dosis]</span>
                  <span className="text-ink-muted"> · 3× sehari</span>
                </p>
                <p className="mt-1 text-ink-muted">
                  07:00 <span className="text-sh8 text-secondary-600">Diminum</span> · 13:00{" "}
                  <span className="text-sh8 text-warning">Terlewat</span> · 19:00{" "}
                  <span className="text-sh8 text-ink-muted">Menunggu</span>
                </p>
              </div>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-600 md:col-span-4">Tren tremor per pasien</h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Frekuensi puncak dan amplitudo dari setiap pengecekan, dalam rentang waktu tertentu, dengan pita tremor 3,5–7 Hz sebagai acuan.
              </p>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-600 md:col-span-4">Satu kode koneksi pribadi</h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Bagikan kode Anda kepada pasien setelah pemeriksaan. Begitu terhubung, pasien
                langsung muncul di daftar pasien Anda.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 py-24 sm:px-8">
        <Tulip
          tone="mint"
          className="absolute bottom-12 left-0 -z-10 h-24 w-18 -rotate-12 sm:left-6 sm:h-32 sm:w-24"
        />
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface-raised px-6 py-12 text-center sm:px-12">
          {/* A faint signal line along the bottom edge of the card. */}
          <TremorWave className="absolute inset-x-0 bottom-0 h-10 w-full stroke-primary-100" />
          <h2 className="text-h4 tracking-tight text-primary-600 lg:text-h3">
            Mulai memantau pasien Anda
          </h2>
          <p className="mt-4 text-body text-ink-muted">
            Daftar sebagai dokter, lalu bagikan kode koneksi Anda kepada pasien.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-12 px-6 text-h7">
              <Link to="/login">Masuk</Link>
            </Button>
          </div>
          <p className="mt-3 text-b8 text-ink-muted">Khusus untuk dokter.</p>
        </div>
      </section>
    </>
  );
}
