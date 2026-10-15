import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  // Plural noun for the summary, for example "pengukuran".
  itemLabel: string;
  // Accessible name of the page navigation, for example "Halaman riwayat pengukuran".
  label: string;
  onPageChange: (page: number) => void;
};

// Footer of a paginated table: "Menampilkan 1–10 dari 42 pengukuran" plus page buttons.
export function TablePagination({
  page,
  pageSize,
  total,
  itemLabel,
  label,
  onPageChange,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-b9 text-ink-muted">
        Menampilkan {firstShown}–{lastShown} dari {total} {itemLabel}
      </p>
      {pageCount > 1 && (
        <nav aria-label={label} className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Halaman sebelumnya"
            className="border border-line text-ink-muted"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <Button
              key={number}
              type="button"
              variant={number === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(number)}
              aria-label={`Halaman ${number}`}
              aria-current={number === page ? "page" : undefined}
              className={cn("text-b9", number !== page && "border border-line text-ink-muted")}
            >
              {number}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            aria-label="Halaman berikutnya"
            className="border border-line text-ink-muted"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  );
}
