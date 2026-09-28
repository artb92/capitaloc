import { countries as polygons } from "@/features/map/countries";
import { COUNTRIES } from "./countries";

describe("country dataset", () => {
  it("has enough countries for daily play", () => {
    expect(COUNTRIES.length).toBeGreaterThan(150);
  });

  it("has a map polygon, both languages and valid coordinates for every country", () => {
    const polygonIds = new Set(polygons.features.map((f) => f.properties.id));
    for (const c of COUNTRIES) {
      expect(polygonIds.has(c.id), c.code).toBe(true);
      expect(c.name.fr && c.capital.fr, c.code).toBeTruthy();
      const [lng, lat] = c.lngLat;
      expect(Math.abs(lng) <= 180 && Math.abs(lat) <= 90, c.code).toBe(true);
      expect(c.areaKm2, c.code).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    expect(new Set(COUNTRIES.map((c) => c.id)).size).toBe(COUNTRIES.length);
  });
});
