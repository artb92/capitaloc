import type { Guess } from "@/features/game/logic";
import { tierColor } from "./tier";

type Props = { guesses: readonly Guess[]; rounds: number; current?: number; className?: string };

/** One segment per round, coloured by its score; the current round is outlined. */
export function ScoreStrip({ guesses, rounds, current, className = "" }: Props) {
  return (
    <div className={`flex gap-1 ${className}`} aria-hidden="true">
      {Array.from({ length: rounds }, (_, i) => {
        const g = guesses[i];
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never reordered
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i === current && !g ? "bg-accent/40 ring-1 ring-accent" : ""}`}
            style={
              g || i !== current
                ? { background: g ? tierColor(g.score) : "var(--color-ink-100)" }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
