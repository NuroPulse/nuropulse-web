import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";

// TODO: replace with the final photo
export function Hero() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-8 lg:pt-20">
        <div className="max-w-3xl">
          <p className="text-sh8 text-primary-700">
            Pendamping untuk penderita Parkinson dan neurolognya
          </p>
          <h1 className="mt-4 text-h3 tracking-tight text-primary-900 sm:text-h2 lg:text-h1">
            Pantau tremor pasien dari waktu ke waktu, bukan dari ingatan.
          </h1>
          <p className="mt-6 text-body text-ink-muted">
            Pasien melakukan pengecekan tremor singkat di ponsel secara berkala. Neurolog melihat
            hasilnya sebagai tren, berdampingan dengan jadwal dan riwayat minum obat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-12 gap-2 px-5 text-h7">
              <Link to="/login">
                Masuk sebagai dokter
                <ArrowRight aria-hidden="true" className="size-4.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-5 text-h7">
              <Link to="/register">Daftar sebagai dokter</Link>
            </Button>
          </div>
          <p className="mt-3 text-b8 text-ink-muted">
            Khusus untuk dokter. Pasien menggunakan aplikasi NuroPulse.
          </p>

          <p role="note" className="mt-8 border-l-2 border-warning pl-4 text-b8">
            <strong className="text-h8">NuroPulse bukan alat diagnosis</strong> dan tidak
            menggantikan pemeriksaan dokter.
          </p>
        </div>

        <figure className="mt-14">
          <img
            src="/assets/landing-page/placeholder.svg"
            alt="Neurolog membahas grafik di laptop bersama pasien lanjut usia di ruang praktik"
            className="block h-64 w-full rounded-sm object-cover sm:h-96 lg:h-120"
          />
          <figcaption className="mt-3 text-b9 text-ink-muted">
            Ilustrasi foto dan data contoh, bukan pasien sungguhan.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
