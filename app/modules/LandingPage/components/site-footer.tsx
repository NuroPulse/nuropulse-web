import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-8 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-primary-900">
          <img src="/assets/shared/logo-biru.svg" alt="" className="block h-7 w-auto"/>
          <span className="text-h7 tracking-tight">NuroPulse</span>
        </Link>
        <p className="text-b8 text-ink-muted">
          NuroPulse bukan alat diagnosis dan tidak menggantikan pemeriksaan dokter.
        </p>
        <p className="text-b8 text-ink-muted">© 2026 NuroPulse · nama timnya apa - Athaya, Tania, Vanka, Zika</p>
        <p className="text-b8 text-ink-muted">Developed for JOINTS 2026</p>
      </div>
    </footer>
  );
}
