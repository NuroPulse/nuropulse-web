import { cn } from "~/lib/utils";

type TremorWaveProps = {
  className?: string;
};

// Decorative wave that echoes the tremor signal chart in the mobile app.
// Size and position come from className; the stroke stays thin at any size.
export function TremorWave({ className }: TremorWaveProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 160 40"
      fill="none"
      preserveAspectRatio="none"
      className={cn("pointer-events-none stroke-primary-300", className)}
    >
      <path
        d="M2 20C10 20 12 14 18 14S26 28 32 28S40 6 46 6S54 36 62 36S70 4 78 4S86 32 94 32S102 10 110 10S118 26 124 26S132 16 138 16S146 21 158 20"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
