import { daysBetween } from "@/lib/daily";
import type { Guess } from "./logic";

export type DayResult = { total: number; guesses: Guess[] };
export type History = Record<string, DayResult>;

const KEY = "capitaloc:history:v1";

export function loadHistory(): History {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as History;
  } catch {
    return {};
  }
}

export function saveResult(dateKey: string, result: DayResult): History {
  const next = { ...loadHistory(), [dateKey]: result };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or quota: the game still works, it just won't remember.
  }
  return next;
}

/** Dev only: forget one day's result so the puzzle can be replayed. */
export function clearResult(dateKey: string): History {
  const { [dateKey]: _, ...rest } = loadHistory();
  try {
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    // Same as saveResult: storage may be unavailable.
  }
  return rest;
}

export type Stats = { played: number; streak: number; maxStreak: number; best: number };

/** Streak counts consecutive days ending today (or yesterday, if today isn't played yet). */
export function computeStats(history: History, today: string): Stats {
  const days = Object.keys(history).sort();
  let maxStreak = 0;
  let run = 0;
  let prev: string | undefined;
  for (const day of days) {
    run = prev && daysBetween(prev, day) === 1 ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    prev = day;
  }
  const last = days.at(-1);
  const streak = last && daysBetween(last, today) <= 1 ? run : 0;
  const best = Math.max(0, ...Object.values(history).map((r) => r.total));
  return { played: days.length, streak, maxStreak, best };
}
