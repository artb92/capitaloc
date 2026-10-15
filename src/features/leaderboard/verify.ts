import { COUNTRIES, getCountry } from "@/features/game/countries";
import { ROUND_MS, scoreGuess } from "@/features/game/logic";
import { dailyPick, LAUNCH_DATE, ROUNDS_PER_DAY } from "@/lib/daily";

/** What the server stores for one leaderboard row (columns of `public.scores`). */
export type Entry = {
  day: string;
  name: string;
  score: number;
  time_ms: number;
  device_id: string;
};

export const NAME_MIN = 2;
export const NAME_MAX = 16;
const NAME_CHARS = /^[\p{L}\p{N}][\p{L}\p{N} _.'-]*$/u;
// shortcut: substring blocklist (EN/FR), catches the obvious cases only; add moderation if abuse shows up.
const BLOCKED = [
  "fuck",
  "shit",
  "cunt",
  "bitch",
  "whore",
  "nigg",
  "fagg",
  "retard",
  "nazi",
  "hitler",
  "pute",
  "salope",
  "encul",
  "connard",
  "pédé",
  "batard",
  "bâtard",
];

/** Trimmed name, or null when it's too short/long, has odd characters or a blocked word. */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_CHARS.test(name)) return null;
  const lower = name.toLowerCase();
  return BLOCKED.some((w) => lower.includes(w)) ? null : name;
}

const utcKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const HOUR = 3_600_000;

/**
 * Days someone, somewhere, can be playing at `now`: local dates run from UTC−12 to UTC+14.
 * The early edge gets 6 h of grace for players who submit a while after finishing.
 */
export function isPlayableDay(day: string, now: number): boolean {
  return day >= LAUNCH_DATE && day >= utcKey(now - 18 * HOUR) && day <= utcKey(now + 14 * HOUR);
}

type RawGuess = { lngLat: unknown; timeMs: unknown };

const isCoord = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max;

/**
 * Recomputes the score from the raw pins so a client can't just post a total.
 * Returns the row to store, or an error code.
 */
export function verifySubmission(body: unknown, now: number): Entry | "bad-request" | "bad-name" {
  if (typeof body !== "object" || body === null) return "bad-request";
  const { day, name: rawName, deviceId, guesses } = body as Record<string, unknown>;
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !isPlayableDay(day, now)) {
    return "bad-request";
  }
  if (typeof deviceId !== "string" || !/^[0-9a-f-]{36}$/i.test(deviceId)) return "bad-request";
  if (!Array.isArray(guesses) || guesses.length !== ROUNDS_PER_DAY) return "bad-request";
  const name = cleanName(rawName);
  if (!name) return "bad-name";

  const ids = dailyPick(
    COUNTRIES.map((c) => c.id),
    day,
  );
  let score = 0;
  let time = 0;
  for (const [i, g] of (guesses as RawGuess[]).entries()) {
    if (typeof g !== "object" || g === null) return "bad-request";
    const { lngLat, timeMs } = g;
    if (lngLat === null && timeMs === null) {
      time += ROUND_MS; // ran out of time
      continue;
    }
    if (
      !Array.isArray(lngLat) ||
      lngLat.length !== 2 ||
      !isCoord(lngLat[0], 180) ||
      !isCoord(lngLat[1], 90) ||
      typeof timeMs !== "number" ||
      !(timeMs >= 0 && timeMs <= ROUND_MS)
    ) {
      return "bad-request";
    }
    score += scoreGuess([lngLat[0], lngLat[1]], getCountry(ids[i] as string), timeMs).score;
    time += Math.round(timeMs);
  }
  return { day, name, score, time_ms: time, device_id: deviceId.toLowerCase() };
}

/** PostgREST filter for rows ranked above `e`: higher score, then faster, then earlier. */
export function aboveFilter(e: { id: number; score: number; time_ms: number }): string {
  const { id, score: s, time_ms: t } = e;
  return `or=(score.gt.${s},and(score.eq.${s},time_ms.lt.${t}),and(score.eq.${s},time_ms.eq.${t},id.lt.${id}))`;
}
