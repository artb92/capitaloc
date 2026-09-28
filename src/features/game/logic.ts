import { distanceKm, type LngLat } from "@/lib/geo";
import { roundScore } from "@/lib/scoring";
import type { Country } from "./countries";

export const COUNTDOWN_MS = 5000;
export const ROUND_MS = 5000;
export const REVEAL_MS = 2500;

export type Guess = { lngLat: LngLat | null; distanceKm: number | null; score: number };

export type Phase = "idle" | "countdown" | "playing" | "reveal" | "done";

export type GameState = {
  phase: Phase;
  /** Index of the current round (0-based). */
  round: number;
  /** Epoch ms when the current timed phase ends. */
  endsAt: number;
  guesses: Guess[];
};

export const initialGame: GameState = { phase: "idle", round: 0, endsAt: 0, guesses: [] };

export function start(now: number): GameState {
  return { phase: "countdown", round: 0, endsAt: now + COUNTDOWN_MS, guesses: [] };
}

function reveal(state: GameState, guess: Guess, now: number): GameState {
  return { ...state, phase: "reveal", endsAt: now + REVEAL_MS, guesses: [...state.guesses, guess] };
}

/** The player pinned a point. Only counts while a round is running. */
export function guess(
  state: GameState,
  lngLat: LngLat,
  countries: readonly Country[],
  now: number,
): GameState {
  const country = countries[state.round];
  if (state.phase !== "playing" || !country || now >= state.endsAt) return state;
  const d = distanceKm(lngLat, country.lngLat);
  return reveal(state, { lngLat, distanceKm: d, score: roundScore(d, country.areaKm2) }, now);
}

/** Advances timed phases once their deadline has passed. */
export function tick(state: GameState, countries: readonly Country[], now: number): GameState {
  if (now < state.endsAt) return state;
  switch (state.phase) {
    case "countdown":
      return { ...state, phase: "playing", endsAt: now + ROUND_MS };
    case "playing":
      return reveal(state, { lngLat: null, distanceKm: null, score: 0 }, now);
    case "reveal":
      return state.round + 1 < countries.length
        ? { ...state, phase: "playing", round: state.round + 1, endsAt: now + ROUND_MS }
        : { ...state, phase: "done", endsAt: 0 };
    default:
      return state;
  }
}

export const totalScore = (guesses: readonly Guess[]) => guesses.reduce((s, g) => s + g.score, 0);
