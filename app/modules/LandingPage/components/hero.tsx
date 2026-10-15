import { ArrowRight, Info } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Bubble } from "~/components/elements/bubble";
import { Tulip } from "~/components/elements/tulip";

// TODO: replace with the final image (flat illustration from the mobile team).
const heroImage = "/assets/landing-page/placeholder.svg";

export function Hero() {
  return (
    <>
      {/* Full-bleed and unboxed. Shapes sit behind the content (-z-10) and may flow into the
          next section; the page wrapper clips them horizontally only. */}
      <section className="relative">
        <Bubble className="top-1/2 -left-56 -z-10 size-130 -translate-y-1/2" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:py-24">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
              <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
              Pendamping untuk penderita Parkinson dan neurolognya
            </p>
            <h1 className="mt-5 text-h3 tracking-tight text-primary-600 sm:text-h2">
              Pantau tremor pasien dari waktu ke waktu, bukan dari ingatan.
            </h1>
            <p className="mt-6 max-w-lg text-body text-ink-muted">
              Pasien melakukan pengecekan tremor singkat di ponsel secara berkala. Neurolog melihat
              hasilnya sebagai tren, berdampingan dengan jadwal dan riwayat minum obat.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild className="h-12 gap-2 px-5 text-h7">
                <Link to="/login">
                  Masuk sebagai dokter
                  <ArrowRight aria-hidden="true" className="size-4.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-5 text-h7">
                <Link to="#cara-kerja">Cara kerja</Link>
              </Button>
            </div>
            <p className="mt-3 text-b8 text-ink-muted">
              Khusus untuk dokter. Pasien menggunakan aplikasi NuroPulse.
            </p>
            <div
              role="note"
              className="mt-8 flex w-fit max-w-lg items-start gap-3 rounded-2xl border border-success/40 bg-success-soft px-4 py-3"
            >
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
              <p className="text-b8 text-ink-muted">
                <strong className="text-sh8 text-ink">NuroPulse bukan alat diagnosis</strong> dan
                tidak menggantikan pemeriksaan dokter.
              </p>
            </div>
          </div>

          <figure className="relative mx-auto h-80 w-full max-w-md sm:h-96 lg:h-120 lg:max-w-none hidden xl:flex">
            <Bubble
              tone="mint"
              className="-right-24 -bottom-24 -z-10 size-72 sm:size-96 lg:-right-40 lg:-bottom-40 lg:size-120"
            />
            <img
              src="/assets/landing-page/doctor-image.webp"
              alt="Neurolog membahas grafik di laptop bersama pasien lanjut usia di ruang praktik"
              className="absolute top-0 left-1/2 size-64 -translate-x-1/2 rounded-full border-8 border-surface-raised bg-primary-50 object-cover sm:size-80 lg:size-96"
            />
            <Tulip
              tone="blue"
              className="absolute bottom-2 left-0 -z-10 h-24 w-18 -rotate-6 sm:h-28 sm:w-21"
            />
            <figcaption className="sr-only">
              Ilustrasi foto dan data contoh, bukan pasien sungguhan.
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
