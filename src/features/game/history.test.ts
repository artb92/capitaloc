import { computeStats, type History } from "./history";

const r = (total: number) => ({ total, guesses: [] });

describe("computeStats", () => {
  it("is empty with no history", () => {
    expect(computeStats({}, "2026-10-01")).toEqual({ played: 0, streak: 0, maxStreak: 0, best: 0 });
  });

  it("counts a streak ending today or yesterday", () => {
    const h: History = { "2026-09-29": r(1), "2026-09-30": r(5), "2026-10-01": r(3) };
    expect(computeStats(h, "2026-10-01")).toEqual({ played: 3, streak: 3, maxStreak: 3, best: 5 });
    expect(computeStats(h, "2026-10-02").streak).toBe(3);
    expect(computeStats(h, "2026-10-03").streak).toBe(0);
  });

  it("resets the current streak after a gap but keeps the max", () => {
    const h: History = { "2026-09-01": r(1), "2026-09-02": r(1), "2026-09-04": r(1) };
    expect(computeStats(h, "2026-09-04")).toMatchObject({ streak: 1, maxStreak: 2 });
  });
});
