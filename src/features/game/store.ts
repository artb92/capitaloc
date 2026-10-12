import { create } from "zustand";
import { dailyPick, dateKey, puzzleNumber } from "@/lib/daily";
import type { LngLat } from "@/lib/geo";
import { COUNTRIES, type Country, getCountry } from "./countries";
import { clearResult, type History, loadHistory, saveResult } from "./history";
import { type GameState, guess, initialGame, start, tick, totalScore } from "./logic";

type Puzzle = { key: string; number: number; countries: Country[] };

function todaysPuzzle(): Puzzle {
  const key = dateKey(new Date());
  const ids = dailyPick(
    COUNTRIES.map((c) => c.id),
    key,
  );
  return { key, number: puzzleNumber(key), countries: ids.map(getCountry) };
}

type GameStore = {
  puzzle: Puzzle;
  game: GameState;
  history: History;
  start: () => void;
  pin: (lngLat: LngLat) => void;
  tick: () => void;
  /** Dev only: wipe today's result and go back to the start screen. */
  resetToday: () => void;
};

export const useGame = create<GameStore>()((set, get) => ({
  puzzle: todaysPuzzle(),
  game: initialGame,
  history: loadHistory(),
  start: () => {
    const { history, puzzle } = get();
    if (history[puzzle.key]) return; // one play per day
    set({ game: start(Date.now()) });
  },
  pin: (lngLat) => {
    const { game, puzzle } = get();
    set({ game: guess(game, lngLat, puzzle.countries, Date.now()) });
  },
  resetToday: () => set({ game: initialGame, history: clearResult(get().puzzle.key) }),
  tick: () => {
    const { game, puzzle } = get();
    const next = tick(game, puzzle.countries, Date.now());
    if (next === game) return;
    if (next.phase === "done") {
      const history = saveResult(puzzle.key, {
        total: totalScore(next.guesses),
        guesses: next.guesses,
      });
      set({ game: next, history });
    } else {
      set({ game: next });
    }
  },
}));
