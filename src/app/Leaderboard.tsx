import { type FormEvent, useEffect, useState } from "react";
import type { DayResult } from "@/features/game/history";
import { useI18n } from "@/features/i18n/useI18n";
import {
  fetchBoard,
  fetchRank,
  loadBoardState,
  type Row,
  saveBoardState,
  submitScore,
} from "@/features/leaderboard/client";
import { cleanName } from "@/features/leaderboard/verify";
import { addDays, LAUNCH_DATE, puzzleNumber } from "@/lib/daily";

type Props = { day: string; result: DayResult };

const ERRORS = { "bad-name": "boardBadName", duplicate: "boardDuplicate" } as const;

/** Today's board (and past ones), with an optional name field to join it. */
export function Leaderboard({ day, result }: Props) {
  const { lang, t } = useI18n();
  const [state, setState] = useState(loadBoardState);
  const [view, setView] = useState(day);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [name, setName] = useState(state.name);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const mine = state.entries[view];

  // biome-ignore lint/correctness/useExhaustiveDependencies: `mine` changes on joining, refetch then.
  useEffect(() => {
    let live = true;
    setRows(null);
    setFailed(false);
    fetchBoard(view)
      .then((r) => live && setRows(r))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [view, mine]);

  // Outside the top rows, ask the server where this device's entry stands now.
  useEffect(() => {
    setRank(null);
    if (!mine || !rows || rows.some((r) => r.id === mine.id)) return;
    let live = true;
    fetchRank(view, mine)
      .then((r) => live && setRank(r))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [view, mine, rows]);

  async function join(e: FormEvent) {
    e.preventDefault();
    const clean = cleanName(name);
    if (!clean) return setError(t.boardBadName);
    setSending(true);
    setError(null);
    try {
      const entry = await submitScore(day, clean, state.deviceId, result.guesses);
      const next = { ...state, name: clean, entries: { ...state.entries, [day]: entry } };
      saveBoardState(next);
      setState(next);
    } catch (err) {
      const code = (err as Error).message as keyof typeof ERRORS;
      setError(t[ERRORS[code] ?? "boardError"]);
    } finally {
      setSending(false);
    }
  }

  const arrow =
    "rounded-full px-2 text-lg leading-none enabled:hover:bg-ink-100 disabled:opacity-30";
  return (
    <section className="mt-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className={arrow}
          aria-label={t.prevDay}
          disabled={view <= LAUNCH_DATE}
          onClick={() => setView(addDays(view, -1))}
        >
          ‹
        </button>
        <h2 className="font-bold">{t.board(puzzleNumber(view))}</h2>
        <button
          type="button"
          className={arrow}
          aria-label={t.nextDay}
          disabled={view >= day}
          onClick={() => setView(addDays(view, 1))}
        >
          ›
        </button>
      </div>

      {view === day && !mine && (
        <form onSubmit={join} className="mt-3 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-ink-200 px-3 py-2"
            aria-label={t.boardName}
            placeholder={t.boardJoin}
            maxLength={16}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-ink-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {t.boardSubmit}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-poor text-sm">{error}</p>}

      <div className="mt-3 max-h-72 overflow-y-auto text-sm">
        {failed ? (
          <p className="text-ink-500">{t.boardError}</p>
        ) : !rows ? (
          <p className="text-ink-500">{t.boardLoading}</p>
        ) : rows.length === 0 ? (
          <p className="text-ink-500">{t.boardEmpty}</p>
        ) : (
          <ol>
            {rows.map((r, i) => (
              <BoardRow key={r.id} rank={i + 1} row={r} me={r.id === mine?.id} lang={lang} />
            ))}
            {mine && rank && (
              <BoardRow rank={rank} row={{ ...mine, name: state.name }} me lang={lang} />
            )}
          </ol>
        )}
      </div>
    </section>
  );
}

function BoardRow({ rank, row, me, lang }: { rank: number; row: Row; me: boolean; lang: string }) {
  const { t } = useI18n();
  return (
    <li
      className={`grid grid-cols-[2.5rem_1fr_auto_3.5rem] items-center gap-2 border-ink-100 border-t px-2 py-1.5 ${me ? "rounded-lg bg-accent/20 font-semibold" : ""}`}
    >
      <span className="text-ink-500">#{rank}</span>
      <span className="min-w-0 truncate">{row.name}</span>
      <span className="font-bold">{row.score.toLocaleString(lang)}</span>
      <span className="text-right text-ink-500">{t.seconds(row.time_ms / 1000)}</span>
    </li>
  );
}
