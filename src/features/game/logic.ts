import { distanceKm, type LngLat } from "@/lib/geo";
import { roundScore, speedFactor } from "@/lib/scoring";
import type { Country } from "./countries";

export const COUNTDOWN_MS = 3000;
/** Camera flight to the next country; the round timer starts after it so travel is free. */
export const TRAVEL_MS = 900;
export const ROUND_MS = 5000;
export const REVEAL_MS = 2500;

export type Guess = {
  lngLat: LngLat | null;
  distanceKm: number | null;
  score: number;
  /** Time taken to answer; null when time ran out. Absent in results saved before it existed. */
  timeMs?: number | null;
};

export type Phase = "idle" | "countdown" | "playing" | "reveal" | "done";

export type GameState = {
  phase: Phase;
  /** Index of the current round (0-based). */
  round: number;
  /** Epoch ms when the round timer starts (after the camera travel). Only used while playing. */
  startsAt: number;
  /** Epoch ms when the current timed phase ends. */
  endsAt: number;
  guesses: Guess[];
};

export const initialGame: GameState = {
  phase: "idle",
  round: 0,
  startsAt: 0,
  endsAt: 0,
  guesses: [],
};

export function start(now: number): GameState {
  return { ...initialGame, phase: "countdown", endsAt: now + COUNTDOWN_MS };
}

function play(state: GameState, round: number, now: number): GameState {
  const startsAt = now + TRAVEL_MS;
  return { ...state, phase: "playing", round, startsAt, endsAt: startsAt + ROUND_MS };
}

function reveal(state: GameState, guess: Guess, now: number): GameState {
  return { ...state, phase: "reveal", endsAt: now + REVEAL_MS, guesses: [...state.guesses, guess] };
}

/** The player pinned a point. Only counts while the round timer runs. */
export function guess(
  state: GameState,
  lngLat: LngLat,
  countries: readonly Country[],
  now: number,
): GameState {
  const country = countries[state.round];
  if (state.phase !== "playing" || !country || now < state.startsAt || now >= state.endsAt) {
    return state;
  }
  const timeMs = now - state.startsAt;
  return reveal(state, { lngLat, ...scoreGuess(lngLat, country, timeMs), timeMs }, now);
}

/** Distance and points for a pin placed `timeMs` into the round. Also used to verify leaderboard entries. */
export function scoreGuess(lngLat: LngLat, country: Country, timeMs: number) {
  const d = distanceKm(lngLat, country.lngLat);
  return {
    distanceKm: d,
    score: Math.round(roundScore(d, country.areaKm2) * speedFactor(timeMs, ROUND_MS)),
  };
}

/** Advances timed phases once their deadline has passed. */
export function tick(state: GameState, countries: readonly Country[], now: number): GameState {
  if (now < state.endsAt) return state;
  switch (state.phase) {
    case "countdown":
      return play(state, 0, now);
    case "playing":
      return reveal(state, { lngLat: null, distanceKm: null, score: 0, timeMs: null }, now);
    case "reveal":
      return state.round + 1 < countries.length
        ? play(state, state.round + 1, now)
        : { ...state, phase: "done", endsAt: 0 };
    default:
      return state;
  }
}

export const totalScore = (guesses: readonly Guess[]) => guesses.reduce((s, g) => s + g.score, 0);
