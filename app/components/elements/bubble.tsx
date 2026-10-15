import { cn } from "~/lib/utils";

// Each tone fades into the page background (bg-surface), so the bubble reads as a soft
// raised circle rather than a coloured dot.
const bubbleTones = {
  neutral: "from-surface-raised to-surface",
  blue: "from-primary-50 to-surface",
  softBlue: "from-primary-100 to-surface",
  green: "from-secondary-50 to-surface",
  // Stronger green, for the one accent bubble in the hero.
  mint: "from-secondary-200 to-surface",
} as const;

type BubbleProps = {
  className?: string;
  tone?: keyof typeof bubbleTones;
};

// Large, low-contrast decorative circle. Size and position come from className;
// keep it big and partly off the page edge, behind content with -z-10.
export function Bubble({ className, tone = "neutral" }: BubbleProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full bg-linear-to-br shadow-card",
        bubbleTones[tone],
        className,
      )}
    />
  );
}
