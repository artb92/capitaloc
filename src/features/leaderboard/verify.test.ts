import { COUNTRIES, getCountry } from "@/features/game/countries";
import { ROUND_MS } from "@/features/game/logic";
import { dailyPick } from "@/lib/daily";
import { aboveFilter, cleanName, isPlayableDay, verifySubmission } from "./verify";

const DAY = "2026-10-15";
const NOON = Date.parse(`${DAY}T12:00:00Z`);
const DEVICE = "0b6f6a59-1f8a-4b8e-9d3c-2a7c1e5f9a10";
const capitals = dailyPick(
  COUNTRIES.map((c) => c.id),
  DAY,
).map((id) => getCountry(id).lngLat);

const perfect = capitals.map((lngLat) => ({ lngLat, timeMs: 500 }));
const body = (over: Record<string, unknown> = {}) => ({
  day: DAY,
  name: "Arthur",
  deviceId: DEVICE,
  guesses: perfect,
  ...over,
});

describe("cleanName", () => {
  it("trims and collapses spaces", () => {
    expect(cleanName("  Jean   Paul ")).toBe("Jean Paul");
  });
  it("accepts accents and digits", () => {
    expect(cleanName("Zoé_92")).toBe("Zoé_92");
  });
  it("rejects bad lengths, symbols and blocked words", () => {
    expect(cleanName("a")).toBeNull();
    expect(cleanName("x".repeat(17))).toBeNull();
    expect(cleanName("<script>")).toBeNull();
    expect(cleanName("BigShitter")).toBeNull();
    expect(cleanName(42)).toBeNull();
  });
});

describe("isPlayableDay", () => {
  it("allows the dates live somewhere on Earth", () => {
    expect(isPlayableDay(DAY, NOON)).toBe(true);
    expect(isPlayableDay("2026-10-16", Date.parse(`${DAY}T11:00:00Z`))).toBe(true); // UTC+14
    expect(isPlayableDay("2026-10-14", Date.parse(`${DAY}T05:00:00Z`))).toBe(true); // UTC−12
  });
  it("rejects future, stale and pre-launch days", () => {
    expect(isPlayableDay("2026-10-16", Date.parse(`${DAY}T09:00:00Z`))).toBe(false);
    expect(isPlayableDay("2026-10-13", NOON)).toBe(false);
    expect(isPlayableDay("2026-10-11", Date.parse("2026-10-12T01:00:00Z"))).toBe(false);
  });
});

describe("verifySubmission", () => {
  it("recomputes a perfect, fast game to the max score", () => {
    expect(verifySubmission(body(), NOON)).toEqual({
      day: DAY,
      name: "Arthur",
      score: 10_000,
      time_ms: 5000,
      device_id: DEVICE,
    });
  });
  it("counts timed-out rounds as zero points and the full round time", () => {
    const guesses = [...perfect.slice(0, 9), { lngLat: null, timeMs: null }];
    expect(verifySubmission(body({ guesses }), NOON)).toMatchObject({
      score: 9000,
      time_ms: 4500 + ROUND_MS,
    });
  });
  it("ignores any total the client sends", () => {
    expect(verifySubmission(body({ score: 99_999 }), NOON)).toMatchObject({ score: 10_000 });
  });
  it("rejects malformed submissions", () => {
    expect(verifySubmission(null, NOON)).toBe("bad-request");
    expect(verifySubmission(body({ guesses: perfect.slice(1) }), NOON)).toBe("bad-request");
    expect(verifySubmission(body({ deviceId: "me" }), NOON)).toBe("bad-request");
    expect(verifySubmission(body({ day: "2026-10-20" }), NOON)).toBe("bad-request");
    const slow = perfect.map((g) => ({ ...g, timeMs: ROUND_MS + 1 }));
    expect(verifySubmission(body({ guesses: slow }), NOON)).toBe("bad-request");
    const offMap = perfect.map(() => ({ lngLat: [200, 0], timeMs: 100 }));
    expect(verifySubmission(body({ guesses: offMap }), NOON)).toBe("bad-request");
  });
  it("reports a bad name separately", () => {
    expect(verifySubmission(body({ name: "?" }), NOON)).toBe("bad-name");
  });
});

describe("aboveFilter", () => {
  it("ranks by score, then time, then submission order", () => {
    expect(aboveFilter({ id: 7, score: 9000, time_ms: 12000 })).toBe(
      "or=(score.gt.9000,and(score.eq.9000,time_ms.lt.12000),and(score.eq.9000,time_ms.eq.12000,id.lt.7))",
    );
  });
});
