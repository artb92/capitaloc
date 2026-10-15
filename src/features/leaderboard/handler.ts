import { countRows } from "./rest";
import { aboveFilter, verifySubmission } from "./verify";

/** Server side of the leaderboard: bundled into the `submit-score` Supabase Edge Function. */
export type Env = { url: string; serviceKey: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

export async function handle(req: Request, env: Env, now = Date.now()): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "bad-request" }, 405);

  const entry = verifySubmission(await req.json().catch(() => null), now);
  if (typeof entry === "string") return json({ error: entry }, 400);

  const auth = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}` };
  const res = await fetch(`${env.url}/rest/v1/scores?select=id`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(entry),
  });
  // Unique (day, device_id): one entry per device per day.
  if (res.status === 409) return json({ error: "duplicate" }, 409);
  if (!res.ok) return json({ error: "server" }, 502);
  const [{ id }] = (await res.json()) as [{ id: number }];
  const above = await countRows(
    env.url,
    env.serviceKey,
    `day=eq.${entry.day}&${aboveFilter({ id, ...entry })}`,
  );
  return json({ id, score: entry.score, time_ms: entry.time_ms, rank: above + 1 });
}
