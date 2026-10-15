import { Link } from "react-router";
import { Button } from "~/components/ui/button";

const navLinks = [
  { to: "#cara-kerja", label: "Cara kerja" },
  { to: "#fitur", label: "Fitur untuk dokter" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface-raised">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <img src="/assets/shared/logo-biru.svg" alt="" className="block h-8 w-auto" />
          <span className="text-h6 tracking-tight">NuroPulse</span>
        </Link>
        <nav aria-label="Navigasi utama" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              asChild
              variant="link"
              className="h-auto px-0 text-b8 text-ink-muted hover:text-secondary-600"
            >
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}
          <Button asChild className="h-10 px-4 text-sh8">
            <Link to="/login">Masuk</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
