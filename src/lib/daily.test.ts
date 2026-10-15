import { addDays, dailyPick, dateKey, daysBetween, puzzleNumber } from "./daily";

const IDS = Array.from({ length: 100 }, (_, i) => String(i).padStart(3, "0"));

describe("daily", () => {
  it("formats the local date", () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("counts days across DST and year boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
  });

  it("numbers puzzles from launch day", () => {
    expect(puzzleNumber("2026-10-12")).toBe(1);
    expect(puzzleNumber("2026-10-22")).toBe(11);
  });

  it("picks 10 distinct ids, stable per day and independent of input order", () => {
    const today = dailyPick(IDS, "2026-10-01");
    expect(today).toHaveLength(10);
    expect(new Set(today).size).toBe(10);
    expect(dailyPick([...IDS].reverse(), "2026-10-01")).toEqual(today);
    expect(dailyPick(IDS, "2026-10-02")).not.toEqual(today);
  });
});
