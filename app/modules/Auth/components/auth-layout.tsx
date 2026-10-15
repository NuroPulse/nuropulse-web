import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Bubble } from "~/components/elements/bubble";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-surface px-4 py-10 text-foreground sm:px-8">
      {/* Left Bubble */}
      <Bubble tone="softBlue" className="top-10 -left-20 -z-10 size-56 lg:top-60 lg:-left-16 lg:size-96" />
      {/* Right Bubble */}
      <Bubble className="top-52 left-20 -z-10 size-20 lg:top-80 lg:left-250 lg:size-40" />
      <Bubble tone="green" className="-top-16 -right-20 -z-10 size-56 lg:-top-24 lg:-right-30 lg:size-96" />

      <div className="m-auto flex w-full max-w-md flex-col items-center">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2.5 rounded-lg text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <img src="/assets/shared/logo-biru.svg" alt="" className="block h-8 w-auto" />
          <span className="text-h6 tracking-tight">NuroPulse</span>
        </Link>

        <div className="w-full rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
          {children}
        </div>

        <p className="mt-6 flex items-start justify-center gap-2 text-center text-b9 text-ink-muted">
          <Info aria-hidden="true" className="mt-px size-4 shrink-0 text-success" />
          NuroPulse bukan alat diagnosis dan tidak menggantikan pemeriksaan dokter.
        </p>
      </div>
    </main>
  );
}
