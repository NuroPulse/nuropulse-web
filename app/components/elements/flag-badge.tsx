import { TriangleAlert } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { FlagReason } from "~/lib/patient-status";

export function flagReasonText(reason: FlagReason): string {
  return reason.kind === "tremor_pattern"
    ? `Ditandai karena: pola tremor terdeteksi di ${reason.detectedCount} dari 5 pengukuran terakhir.`
    : "Ditandai karena: kepatuhan obat rendah dalam 7 hari terakhir.";
}

// "Perlu ditinjau" always comes with its data reason; it never says what is wrong with the
// patient. Warning (amber), never danger.
export function FlagBadge({ reason }: { reason: FlagReason }) {
  const reasonText = flagReasonText(reason);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-sh9 whitespace-nowrap text-warning focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <TriangleAlert aria-hidden="true" className="size-3.5" />
          Perlu ditinjau
          <span className="sr-only">. {reasonText}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        {reasonText}
      </TooltipContent>
    </Tooltip>
  );
}
