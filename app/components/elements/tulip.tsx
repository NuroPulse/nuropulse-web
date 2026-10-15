import { cn } from "~/lib/utils";

const petalTones = {
  lavender: "fill-primary-200",
  blue: "fill-primary-400",
  mint: "fill-secondary-200",
} as const;

type TulipProps = {
  className?: string;
  // Vary the tone between tulips on a page so they do not all look the same.
  tone?: keyof typeof petalTones;
};

// Decorative tulip, the symbol of Parkinson's awareness. Size and position come from className.
export function Tulip({ className, tone = "lavender" }: TulipProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 64"
      className={cn("pointer-events-none", className)}
    >
      <path
        className={petalTones[tone]}
        d="M12 10C12 22 16 28 24 28C32 28 36 22 36 10L30 16L24 5L18 16Z"
      />
      <path className="fill-secondary-400" d="M23 27h2v33h-2z" />
      <path className="fill-secondary-400" d="M23 58C14 54 10 45 11 36C17 40 22 48 23 58Z" />
      <path className="fill-secondary-300" d="M25 50C32 47 36 40 36 33C30 36 26 42 25 50Z" />
    </svg>
  );
}
