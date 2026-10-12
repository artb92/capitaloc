import type { Country } from "./countries";
import {
  COUNTDOWN_MS,
  guess,
  initialGame,
  REVEAL_MS,
  ROUND_MS,
  start,
  TRAVEL_MS,
  tick,
  totalScore,
} from "./logic";

const country = (id: string, lngLat: [number, number]): Country => ({
  id,
  code: id,
  name: { en: id, fr: id },
  capital: { en: id, fr: id },
  lngLat,
  capitalWikidata: null,
  areaKm2: 500_000,
});
const PUZZLE = [country("A", [2.35, 48.86]), country("B", [13.4, 52.52])];
/** Moment the first round's timer starts. */
const T0 = COUNTDOWN_MS + TRAVEL_MS;
const firstRound = () => tick(start(0), PUZZLE, COUNTDOWN_MS);

describe("game logic", () => {
  it("counts down, then travels to the first country before the timer starts", () => {
    const s = start(0);
    expect(s.phase).toBe("countdown");
    expect(tick(s, PUZZLE, COUNTDOWN_MS - 1)).toBe(s);
    expect(firstRound()).toMatchObject({
      phase: "playing",
      round: 0,
      startsAt: T0,
      endsAt: T0 + ROUND_MS,
    });
  });

  it("ignores pins during the camera travel", () => {
    const playing = firstRound();
    expect(guess(playing, [2.35, 48.86], PUZZLE, T0 - 1)).toBe(playing);
  });

  it("scores a pin, records its time and reveals the answer", () => {
    const s = guess(firstRound(), [2.35, 48.86], PUZZLE, T0 + 1000);
    expect(s.phase).toBe("reveal");
    expect(s.guesses[0]).toMatchObject({ score: 1000, timeMs: 1000 });
    expect(s.endsAt).toBe(T0 + 1000 + REVEAL_MS);
  });

  it("takes points off slow answers", () => {
    const s = guess(firstRound(), [2.35, 48.86], PUZZLE, T0 + ROUND_MS - 1);
    expect(s.guesses[0]?.score).toBe(700);
  });

  it("gives 0 points when time runs out", () => {
    const s = tick(firstRound(), PUZZLE, T0 + ROUND_MS);
    expect(s.phase).toBe("reveal");
    expect(s.guesses[0]).toEqual({ lngLat: null, distanceKm: null, score: 0, timeMs: null });
  });

  it("ignores pins outside a running round (first click is final)", () => {
    const playing = firstRound();
    const revealed = guess(playing, [0, 0], PUZZLE, T0 + 100);
    expect(guess(revealed, [2.35, 48.86], PUZZLE, T0 + 200)).toBe(revealed);
    expect(guess(initialGame, [0, 0], PUZZLE, 0)).toBe(initialGame);
    expect(guess(playing, [0, 0], PUZZLE, T0 + ROUND_MS)).toBe(playing);
  });

  it("moves through every round and finishes", () => {
    let s = firstRound();
    s = guess(s, [13.4, 52.52], PUZZLE, s.startsAt);
    s = tick(s, PUZZLE, s.endsAt);
    expect(s).toMatchObject({ phase: "playing", round: 1 });
    s = guess(s, [13.4, 52.52], PUZZLE, s.startsAt);
    s = tick(s, PUZZLE, s.endsAt);
    expect(s.phase).toBe("done");
    expect(s.guesses).toHaveLength(2);
    expect(totalScore(s.guesses)).toBe((s.guesses[0]?.score ?? 0) + 1000);
  });
});
