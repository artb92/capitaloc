// Thin Deno entry point. `handler.js` is built from src/features/leaderboard/handler.ts by
// `pnpm build:function` (CI runs it before deploying), so game logic and scoring stay shared.
import { handle } from "./handler.js";

Deno.serve((req) =>
  handle(req, {
    url: Deno.env.get("SUPABASE_URL") ?? "",
    serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  }),
);
