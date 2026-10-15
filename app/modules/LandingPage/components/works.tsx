const steps = [
  {
    number: 1,
    image: "/assets/landing-page/placeholder.svg",
    imageAlt: "Ponsel diletakkan di punggung tangan lansia yang rileks di atas meja",
    title: "Pengecekan singkat di ponsel",
    body: "Pasien meletakkan ponsel di punggung tangan yang rileks. Sensor ponsel merekam gerakan, lalu analisisnya berjalan langsung di perangkat.",
  },
  {
    number: 2,
    image: "/assets/landing-page/placeholder.svg",
    imageAlt: "Neurolog memberikan kode koneksi kepada pasien yang memasukkannya di ponsel",
    title: "Terhubung dengan dokter",
    body: "Dengan masukkan kode dari dokter, hasil pengecekan pasien langsung tersedia di dashboard neurolog. Juga tersedia pengingat jadwal obat yang membantu pasien minum obat tepat waktu, dan setiap dosis tercatat di log yang dapat dipantau dokter.",
  },
  {
    number: 3,
    image: "/assets/landing-page/placeholder.svg",
    imageAlt: "Dokter meninjau grafik tren pasien di laptop",
    title: "Dokter memantau tren",
    body: "Hasil pengecekan tampil sebagai tren per pasien, berdampingan dengan jadwal dan riwayat minum obat, siap dibahas saat kontrol berikutnya.",
  },
];

export function Works() {
  return (
    <section id="cara-kerja" className="mx-auto max-w-5xl px-4 pt-24 sm:px-8">
      <div className="max-w-3xl">
        <p className="text-sh8 text-primary-700">Cara kerja</p>
        <h2 className="mt-3 text-h4 tracking-tight text-primary-900 lg:text-h3">
          Dari ponsel pasien ke dashboard neurolog
        </h2>
        <p className="mt-4 text-body text-ink-muted">
          Tiga langkah sederhana yang menggantikan catatan harian dan ingatan pasien dengan data
          yang konsisten.
        </p>
      </div>

      <ol className="mt-12 flex flex-col gap-12">
        {steps.map((step) => (
          <li
            key={step.number}
            className="grid gap-6 border-t border-line pt-6 md:grid-cols-12 md:gap-10"
          >
            <div className="md:col-span-7">
              <p className="text-h3 text-primary-600">{step.number}</p>
              <h3 className="mt-2 text-h6 text-primary-900">{step.title}</h3>
              <p className="mt-2 text-body text-ink-muted">{step.body}</p>
            </div>
            <img
              src={step.image}
              alt={step.imageAlt}
              loading="lazy"
              className="block aspect-4/3 w-full rounded-sm object-cover md:col-span-5"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
