import { Link } from "react-router";

import { Button } from "~/components/ui/button";

export function FeaturesCta() {
  return (
    <>
      <section id="fitur" className="mx-auto max-w-5xl px-4 pt-24 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sh8 text-primary-700">Fitur untuk dokter</p>
          <h2 className="mt-3 text-h4 tracking-tight text-primary-900 lg:text-h3">
            Data kuantitatif untuk melengkapi cerita pasien
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line border-y border-line">
          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-900 md:col-span-4">
              Daftar pasien dan penanda "Perlu ditinjau"
            </h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Lihat siapa yang aktif, siapa yang belum check-in, dan siapa yang datanya sebaiknya
                Anda lihat lebih dulu, lengkap dengan alasannya.
              </p>
              <dl aria-hidden="true" className="mt-4 grid gap-2 rounded-sm border border-line bg-surface p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 text-b8">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="rounded-sm bg-warning-soft px-2 py-0.5 text-sh9 text-warning">
                    Perlu ditinjau
                  </dt>
                  <dd className="text-ink-muted">
                    Pola tremor terdeteksi di 3 dari 5 pengukuran terakhir
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="text-sh8">Belum check-in</dt>
                  <dd className="text-ink-muted">Tidak ada pengukuran dalam 3 hari</dd>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <dt className="rounded-sm bg-secondary-100 px-2 py-0.5 text-sh9 text-secondary-800">
                    Aktif
                  </dt>
                  <dd className="text-ink-muted">Pengukuran rutin sesuai jadwal</dd>
                </div>
              </dl>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-900 md:col-span-4">
              Jadwal dan riwayat minum obat
            </h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Atur jadwal obat tiap pasien, lalu lihat dosis yang diminum, dilewati, atau terlewat
                di samping tren tremornya.
              </p>
              <div aria-hidden="true" className="mt-4 rounded-sm border border-line bg-surface p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 text-b8">
                <p>
                  <span className="text-sh8">[Nama obat] · [dosis]</span>
                  <span className="text-ink-muted"> · 3× sehari</span>
                </p>
                <p className="mt-1 text-ink-muted">
                  07:00 <span className="text-sh8 text-foreground">Diminum</span> · 13:00{" "}
                  <span className="text-sh8 text-warning">Terlewat</span> · 19:00{" "}
                  <span className="text-sh8 text-foreground">Menunggu</span>
                </p>
              </div>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-900 md:col-span-4">Tren tremor per pasien</h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Frekuensi puncak dan amplitudo dari setiap pengecekan, dalam rentang waktu tertentu, dengan pita tremor 3,5–7 Hz sebagai acuan.
              </p>
            </div>
          </article>

          <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
            <h3 className="text-h6 text-primary-900 md:col-span-4">Satu kode koneksi pribadi</h3>
            <div className="md:col-span-8">
              <p className="text-body text-ink-muted">
                Bagikan kode Anda kepada pasien setelah pemeriksaan. Begitu terhubung, pasien
                langsung muncul di daftar pasien Anda.
              </p>
              <p aria-hidden="true" className="mt-4 flex items-baseline gap-4 rounded-sm border border-line bg-surface p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0">
                <span className="text-h6 tracking-widest text-primary-900">•••• ••••</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="flex flex-col mx-auto max-w-5xl px-4 py-12 sm:px-8 items-center">
        <div className="max-w-3xl text-center">
          <h2 className="text-h4 tracking-tight text-primary-900 lg:text-h3">
            Mulai memantau pasien Anda
          </h2>
          <p className="mt-4 text-body text-ink-muted">
            Daftar sebagai dokter, lalu bagikan kode koneksi Anda kepada pasien.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-12 px-6 text-h7">
              <Link to="/register">Daftar</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-6 text-sh7">
              <Link to="/login">Masuk</Link>
            </Button>
          </div>
          <p className="mt-3 text-b8 text-ink-muted">Khusus untuk dokter.</p>
        </div>
      </section>
    </>
  );
}
