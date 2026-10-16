import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { PatientFailure } from "../types";

type QueryErrorProps = {
  failure: PatientFailure;
  onRetry: () => void;
  className?: string;
};

export function QueryError({ failure, onRetry, className }: QueryErrorProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3", className)}>
      <p className="text-b8 text-ink">
        {failure.code === "network"
          ? "Tidak ada koneksi internet. Coba lagi."
          : "Terjadi kesalahan. Silakan coba lagi."}
      </p>
      <Button type="button" variant="outline" onClick={onRetry} className="h-10 px-4 text-sh8">
        Coba lagi
      </Button>
    </div>
  );
}
