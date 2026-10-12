import { describe, expect, it } from "vitest";
import { tilesForBounds } from "./relief";

describe("tilesForBounds", () => {
  it("returns the single world tile at zoom 0", () => {
    expect(tilesForBounds([-180, -85, 180, 85], 0)).toEqual(["0/0/0"]);
  });

  it("finds the tile under a point", () => {
    // Kampala (32.6, 0.3) at z5: x = floor(212.6 / 360 * 32) = 18, y just below the equator row 16.
    expect(tilesForBounds([32.5, 0.3, 32.6, 0.4], 5)).toEqual(["5/18/15"]);
  });

  it("covers a box spanning several tiles and clamps at the poles", () => {
    const keys = tilesForBounds([-10, -89, 10, 89], 2);
    expect(keys).toHaveLength(8);
    expect(keys).toContain("2/1/0");
    expect(keys).toContain("2/2/3");
  });
});
