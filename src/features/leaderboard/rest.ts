/** Number of `scores` rows matching a PostgREST filter, read from `Content-Range: 0-9/42`. */
export async function countRows(url: string, key: string, query: string): Promise<number> {
  const res = await fetch(`${url}/rest/v1/scores?select=id&${query}`, {
    method: "HEAD",
    headers: { apikey: key, Prefer: "count=exact" },
  });
  if (!res.ok) throw new Error(`count failed: ${res.status}`);
  return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
}
