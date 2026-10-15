-- Daily leaderboard. Rows are written only by the `submit-score` Edge Function (service role),
-- which recomputes the score from the raw pins.
create table public.scores (
  id bigint generated always as identity primary key,
  day date not null,
  name text not null check (char_length(name) between 2 and 16),
  score integer not null check (score between 0 and 10000),
  time_ms integer not null check (time_ms >= 0),
  device_id uuid not null,
  created_at timestamptz not null default now(),
  unique (day, device_id)
);

create index scores_board on public.scores (day, score desc, time_ms, id);

alter table public.scores enable row level security;
create policy "Boards are public" on public.scores for select using (true);

-- Anyone can read boards, but not which device sent a row, and nobody writes through the API.
revoke all on public.scores from anon, authenticated;
grant select (id, day, name, score, time_ms, created_at) on public.scores to anon, authenticated;
