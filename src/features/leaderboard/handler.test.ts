import { COUNTRIES, getCountry } from "@/features/game/countries";
import { dailyPick } from "@/lib/daily";
import { handle } from "./handler";

const DAY = "2026-10-15";
const NOW = Date.parse(`${DAY}T12:00:00Z`);
const ENV = { url: "https://db.test", serviceKey: "service" };
const guesses = dailyPick(
  COUNTRIES.map((c) => c.id),
  DAY,
).map((id) => ({ lngLat: getCountry(id).lngLat, timeMs: 800 }));

const post = (body: unknown) =>
  new Request("https://fn.test", { method: "POST", body: JSON.stringify(body) });
const valid = {
  day: DAY,
  name: "Arthur",
  deviceId: "0b6f6a59-1f8a-4b8e-9d3c-2a7c1e5f9a10",
  guesses,
};

afterEach(() => vi.unstubAllGlobals());

describe("handle", () => {
  it("answers CORS preflight", async () => {
    const res = await handle(new Request("https://fn.test", { method: "OPTIONS" }), ENV, NOW);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("stores the verified row and returns its rank", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json([{ id: 42 }], { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { headers: { "Content-Range": "0-2/3" } }));
    vi.stubGlobal("fetch", fetch);
    const res = await handle(post(valid), ENV, NOW);
    expect(await res.json()).toEqual({ id: 42, score: 10_000, time_ms: 8000, rank: 4 });
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://db.test/rest/v1/scores?select=id");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Arthur", score: 10_000 });
  });

  it("reports a second entry from the same device", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 409 })));
    const res = await handle(post(valid), ENV, NOW);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "duplicate" });
  });

  it("rejects invalid bodies without touching the database", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = await handle(post({ ...valid, name: "x" }), ENV, NOW);
    expect(await res.json()).toEqual({ error: "bad-name" });
    expect(fetch).not.toHaveBeenCalled();
  });
});
