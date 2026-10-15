import {
  Calendar,
  Copy,
  Info,
  KeyRound,
  LogOut,
  Mail,
  Stethoscope,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { formatLongDate } from "~/lib/date";
import { useCurrentAccount, useSignOut } from "~/modules/Auth";

export function ProfilePage() {
  const account = useCurrentAccount();
  const signOut = useSignOut();

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Kode disalin.");
    } catch {
      // The Clipboard API can be blocked (permissions, insecure context); tell the doctor.
      toast.error("Kode gagal disalin. Salin secara manual.");
    }
  }

  let content: ReactNode;

  if (account.isPending) {
    content = (
      <div aria-busy="true" className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <span className="sr-only">Memuat…</span>
        <div className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="mt-6 h-10 w-28" />
        </div>
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 sm:p-7">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-6 h-14 w-full" />
          <Skeleton className="mt-5 h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-32" />
        </div>
      </div>
    );
  } else if (account.isError) {
    content = (
      <div
        role="alert"
        className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-raised p-6"
      >
        <p className="text-b8 text-ink">
          {account.error.code === "network"
            ? "Tidak ada koneksi internet. Coba lagi."
            : "Terjadi kesalahan. Silakan coba lagi."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => account.refetch()}
          className="h-10 px-4 text-sh8"
        >
          Coba lagi
        </Button>
      </div>
    );
  } else {
    const { profile, email } = account.data;
    const code = profile.connectionCode;
    const accountRows: { icon: LucideIcon; label: string; value: string }[] = [
      { icon: Mail, label: "Email", value: email ?? "Tidak tersedia" },
      { icon: Calendar, label: "Tanggal bergabung", value: formatLongDate(profile.createdAt) },
    ];

    content = (
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <section
          aria-label="Akun Anda"
          className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-7"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <Stethoscope aria-hidden="true" className="size-8 text-primary-600" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-h6 text-ink">{profile.fullName}</p>
              <p className="text-b9 text-ink-muted">Dokter</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-line border-y border-line">
            {accountRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <dt className="text-b9 text-ink-muted">{label}</dt>
                  <dd className="truncate text-sh8 text-ink">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <Button
            type="button"
            variant="outline"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="mt-6 h-10 gap-2 border border-danger px-4 text-sh8 text-danger hover:bg-danger-soft hover:text-danger"
          >
            <LogOut aria-hidden="true" className="size-4.5" />
            Keluar
          </Button>
        </section>

        <section
          aria-labelledby="connection-code-title"
          className="rounded-2xl border border-primary-200 bg-primary-50 p-6 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-raised text-primary-600">
              <KeyRound aria-hidden="true" className="size-5" />
            </span>
            <h2 id="connection-code-title" className="text-sh7 text-ink">
              Kode koneksi Anda
            </h2>
          </div>

          {code ? (
            <>
              {/* One box per character for readability; screen readers get the code spelled out. */}
              <p className="sr-only">Kode koneksi Anda: {code.split("").join(" ")}</p>
              <div aria-hidden="true" className="mt-6 flex flex-wrap gap-2">
                {code.split("").map((character, index) => (
                  <span
                    key={index}
                    className="flex h-12 w-10 items-center justify-center rounded-xl border border-primary-200 bg-surface-raised text-h5 text-primary-600 uppercase sm:h-14 sm:w-12 sm:text-h4"
                  >
                    {character}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-b8 text-ink-muted">
                Bagikan kode ini kepada pasien agar mereka dapat menghubungkan akun NuroPulse
                mereka dengan Anda.
              </p>

              <Button
                type="button"
                onClick={() => copyCode(code)}
                className="mt-4 h-10 gap-2 px-4 text-sh8"
              >
                <Copy aria-hidden="true" className="size-4.5" />
                Salin Kode
              </Button>
            </>
          ) : (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-warning bg-warning-soft p-3"
            >
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-warning" />
              <p className="text-b8 text-ink">
                Kode koneksi belum tersedia. Hubungi tim NuroPulse.
              </p>
            </div>
          )}

          <p className="mt-6 flex items-start gap-2 border-t border-primary-200 pt-4 text-b9 text-ink-muted">
            <Info aria-hidden="true" className="mt-px size-4 shrink-0 text-primary-600" />
            Pasien memasukkan kode di aplikasi NuroPulse. Setelah terhubung, pasien muncul di
            Daftar Pasien.
          </p>
        </section>
      </div>
    );
  }

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <p className="inline-flex items-center gap-2 text-sh8 text-secondary-600">
        <span aria-hidden="true" className="size-2 rounded-full bg-secondary-500" />
        Akun Anda
      </p>
      <h1 className="mt-2 text-h4 tracking-tight text-primary-600">Profil Saya</h1>
      {content}
    </main>
  );
}
