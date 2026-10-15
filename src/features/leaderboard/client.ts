import type { Guess } from "@/features/game/logic";
import { countRows } from "./rest";
import { aboveFilter } from "./verify";

export type Row = { id: number; name: string; score: number; time_ms: number };
export type MyEntry = { id: number; score: number; time_ms: number; rank: number };

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ?? "";
/** The board only shows up in builds that know where Supabase lives. */
export const boardEnabled = Boolean(url && key);

export const BOARD_SIZE = 100;

export async function fetchBoard(day: string): Promise<Row[]> {
  const res = await fetch(
    `${url}/rest/v1/scores?select=id,name,score,time_ms&day=eq.${day}` +
      `&order=score.desc,time_ms.asc,id.asc&limit=${BOARD_SIZE}`,
    { headers: { apikey: key } },
  );
  if (!res.ok) throw new Error(`board failed: ${res.status}`);
  return (await res.json()) as Row[];
}

export async function fetchRank(day: string, entry: MyEntry): Promise<number> {
  return (await countRows(url ?? "", key, `day=eq.${day}&${aboveFilter(entry)}`)) + 1;
}

/** Sends the raw pins; the server recomputes the score. Throws an error code on failure. */
export async function submitScore(
  day: string,
  name: string,
  deviceId: string,
  guesses: readonly Guess[],
): Promise<MyEntry> {
  const res = await fetch(`${url}/functions/v1/submit-score`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      day,
      name,
      deviceId,
      guesses: guesses.map((g) => ({ lngLat: g.lngLat, timeMs: g.timeMs ?? null })),
    }),
  }).catch(() => null);
  const body = (await res?.json().catch(() => null)) as (MyEntry & { error?: string }) | null;
  if (!res?.ok || !body) throw new Error(body?.error ?? "server");
  return body;
}

/** What this device remembers: its id, last name used, and its entry per day. */
export type BoardState = { deviceId: string; name: string; entries: Record<string, MyEntry> };

const KEY = "capitaloc:board:v1";

export function loadBoardState(): BoardState {
  let saved: Partial<BoardState> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<BoardState>;
  } catch {
    // Unreadable storage: start fresh.
  }
  const state = { deviceId: crypto.randomUUID(), name: "", entries: {}, ...saved };
  if (!saved.deviceId) saveBoardState(state);
  return state;
}

export function saveBoardState(state: BoardState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota: the entry is still on the server.
  }
}
