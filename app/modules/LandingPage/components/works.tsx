import { Bubble } from "~/components/elements/bubble";
import { Tulip } from "~/components/elements/tulip";

const steps = [
  {
    number: 1,
    image: "/assets/landing-page/welcome.webp",
    imageAlt: "Ilustrasi ponsel yang menampilkan logo aplikasi NuroPulse",
    title: "Pengecekan singkat di ponsel",
    body: "Pasien meletakkan ponsel di punggung tangan yang rileks. Sensor ponsel merekam gerakan, lalu analisisnya berjalan langsung di perangkat.",
  },
  {
    number: 2,
    image: "/assets/landing-page/result-tremor.webp",
    imageAlt: "Ilustrasi gedung rumah sakit dan kalender jadwal",
    title: "Terhubung dengan dokter",
    body: "Dengan masukkan kode dari dokter, hasil pengecekan pasien langsung tersedia di dashboard neurolog. Juga tersedia pengingat jadwal obat yang membantu pasien minum obat tepat waktu, dan setiap dosis tercatat di log yang dapat dipantau dokter.",
  },
  {
    number: 3,
    image: "/assets/landing-page/result-none.webp",
    imageAlt: "Ilustrasi papan klip berisi daftar periksa dan kacamata",
    title: "Dokter memantau tren",
    body: "Hasil pengecekan tampil sebagai tren per pasien, berdampingan dengan jadwal dan riwayat minum obat, siap dibahas saat kontrol berikutnya.",
  },
];

export function Works() {
  return (
    <section id="cara-kerja" className="relative mx-auto max-w-5xl px-4 pt-24 sm:px-8">
      <Tulip
        tone="lavender"
        className="absolute top-24 right-0 -z-10 hidden h-28 w-21 rotate-6 lg:block"
      />
      <Bubble className="top-1/3 -right-40 -z-10 size-80 lg:-right-48 lg:size-96" />
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
          <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
          Cara kerja
        </p>
        <h2 className="mt-3 text-h4 tracking-tight text-primary-600 lg:text-h3">
          Dari ponsel pasien ke dashboard neurolog
        </h2>
        <p className="mt-4 text-body text-ink-muted">
          Tiga langkah sederhana yang menggantikan catatan harian dan ingatan pasien dengan data
          yang konsisten.
        </p>
      </div>

      <ol className="mt-12 flex flex-col gap-6">
        {steps.map((step) => (
          <li
            key={step.number}
            className="grid gap-6 rounded-2xl border border-line bg-surface-raised p-6 md:grid-cols-12 md:gap-10 md:p-8"
          >
            <div className="md:col-span-7">
              <p className="flex size-10 items-center justify-center rounded-full bg-secondary-100 text-h7 text-secondary-600">
                {step.number}
              </p>
              <h3 className="mt-4 text-h6 text-primary-600">{step.title}</h3>
              <p className="mt-2 text-body text-ink-muted">{step.body}</p>
            </div>
            <img
              src={step.image}
              alt={step.imageAlt}
              loading="lazy"
              // Transparent illustrations: contained on a light tint so none of the art is cropped.
              className="block aspect-4/3 w-full rounded-2xl border border-line bg-primary-50 object-contain md:col-span-5"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
