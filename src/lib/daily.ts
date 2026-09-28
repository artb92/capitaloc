import { hashString, mulberry32, sample } from "./random";

/** Day #1 of Capitaloc. */
export const LAUNCH_DATE = "2026-09-28";
export const ROUNDS_PER_DAY = 10;

/** Local calendar date as YYYY-MM-DD, so the puzzle flips at the player's midnight. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const dayIndex = (key: string) => Math.round(Date.parse(`${key}T00:00:00Z`) / 86_400_000);

/** Days between two date keys (b - a). */
export function daysBetween(a: string, b: string): number {
  return dayIndex(b) - dayIndex(a);
}

/** Puzzle number shown to players: 1 on launch day. */
export function puzzleNumber(key: string): number {
  return daysBetween(LAUNCH_DATE, key) + 1;
}

/** The same `count` ids for everyone on a given day. */
export function dailyPick(ids: readonly string[], key: string, count = ROUNDS_PER_DAY): string[] {
  const sorted = [...ids].sort();
  return sample(sorted, count, mulberry32(hashString(`capitaloc:${key}`)));
}
