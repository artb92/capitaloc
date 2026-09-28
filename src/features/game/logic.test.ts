import type { Country } from "./countries";
import {
  COUNTDOWN_MS,
  guess,
  initialGame,
  REVEAL_MS,
  ROUND_MS,
  start,
  tick,
  totalScore,
} from "./logic";

const country = (id: string, lngLat: [number, number]): Country => ({
  id,
  code: id,
  name: { en: id, fr: id },
  capital: { en: id, fr: id },
  lngLat,
  areaKm2: 500_000,
});
const PUZZLE = [country("A", [2.35, 48.86]), country("B", [13.4, 52.52])];

describe("game logic", () => {
  it("counts down before the first round", () => {
    const s = start(0);
    expect(s.phase).toBe("countdown");
    expect(tick(s, PUZZLE, COUNTDOWN_MS - 1)).toBe(s);
    expect(tick(s, PUZZLE, COUNTDOWN_MS)).toMatchObject({ phase: "playing", round: 0 });
  });

  it("scores a pin and reveals the answer", () => {
    const playing = tick(start(0), PUZZLE, COUNTDOWN_MS);
    const s = guess(playing, [2.35, 48.86], PUZZLE, COUNTDOWN_MS + 1000);
    expect(s.phase).toBe("reveal");
    expect(s.guesses[0]).toMatchObject({ score: 1000 });
    expect(s.endsAt).toBe(COUNTDOWN_MS + 1000 + REVEAL_MS);
  });

  it("gives 0 points when time runs out", () => {
    const playing = tick(start(0), PUZZLE, COUNTDOWN_MS);
    const s = tick(playing, PUZZLE, COUNTDOWN_MS + ROUND_MS);
    expect(s.phase).toBe("reveal");
    expect(s.guesses[0]).toEqual({ lngLat: null, distanceKm: null, score: 0 });
  });

  it("ignores pins outside a running round (first click is final)", () => {
    const playing = tick(start(0), PUZZLE, COUNTDOWN_MS);
    const revealed = guess(playing, [0, 0], PUZZLE, COUNTDOWN_MS + 100);
    expect(guess(revealed, [2.35, 48.86], PUZZLE, COUNTDOWN_MS + 200)).toBe(revealed);
    expect(guess(initialGame, [0, 0], PUZZLE, 0)).toBe(initialGame);
    expect(guess(playing, [0, 0], PUZZLE, COUNTDOWN_MS + ROUND_MS)).toBe(playing);
  });

  it("moves through every round and finishes", () => {
    let s = start(0);
    let now = 0;
    const step = (ms: number) => {
      now += ms;
      s = tick(s, PUZZLE, now);
    };
    step(COUNTDOWN_MS);
    s = guess(s, [13.4, 52.52], PUZZLE, now);
    step(REVEAL_MS);
    expect(s).toMatchObject({ phase: "playing", round: 1 });
    s = guess(s, [13.4, 52.52], PUZZLE, now);
    step(REVEAL_MS);
    expect(s.phase).toBe("done");
    expect(s.guesses).toHaveLength(2);
    expect(totalScore(s.guesses)).toBe((s.guesses[0]?.score ?? 0) + 1000);
  });
});
