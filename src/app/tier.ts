import { MAX_ROUND_SCORE } from "@/lib/scoring";

/** Colour for a round score: green for great, amber for fair, red for poor, grey for none. */
export function tierColor(score: number): string {
  if (score >= 0.75 * MAX_ROUND_SCORE) return "var(--color-great)";
  if (score >= 0.3 * MAX_ROUND_SCORE) return "var(--color-fair)";
  if (score > 0) return "var(--color-poor)";
  return "var(--color-ink-200)";
}
