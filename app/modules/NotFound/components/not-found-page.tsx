import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button"
import { Bubble } from "~/components/elements/bubble";
import { ArrowLeft } from "lucide-react"

type NotFoundPageProps = {
  isSignedIn: boolean;
};

export function NotFoundPage({ isSignedIn }: NotFoundPageProps) {
  const navigate = useNavigate();
  const homePath = isSignedIn ? "/dashboard" : "/";

  // Go back one step; if this tab has no history (opened directly), go home instead.
  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate(homePath);
  }
  
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-surface px-4 py-10 text-foreground sm:px-8">
      <Button asChild variant="link" className="text-h7 absolute">
        <Link to="/">
          <ArrowLeft aria-hidden="true" className="size-4.5" />
          Kembali
        </Link>
      </Button>
      {/* Left Bubble */}
      <Bubble tone="softBlue" className="top-10 -left-20 -z-10 size-56 lg:top-60 lg:-left-16 lg:size-96" />
      {/* Right Bubble */}
      <Bubble className="top-52 left-20 -z-10 size-20 lg:top-80 lg:left-250 lg:size-40" />
      <Bubble tone="green" className="-top-16 -right-20 -z-10 size-56 lg:-top-24 lg:-right-30 lg:size-96" />

      <div className="m-auto flex w-full max-w-md flex-col items-center">
        <Link
          to={homePath}
          className="mb-8 inline-flex items-center gap-2.5 rounded-lg text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <img src="/assets/shared/logo-biru.svg" alt="" className="block h-8 w-auto" />
          <span className="text-h6 tracking-tight">NuroPulse</span>
        </Link>

        <h4 className="text-center text-h4 text-primary-600">
          Halaman tidak ditemukan
        </h4>
      </div>
    </main>
  );
}
