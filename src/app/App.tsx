import { useEffect } from "react";
import { fetchPhoto } from "@/features/game/capitalPhoto";
import { computeStats } from "@/features/game/history";
import { ROUND_MS } from "@/features/game/logic";
import { useGame } from "@/features/game/store";
import { WorldMap } from "@/features/map/WorldMap";
import { Countdown } from "./Countdown";
import { Header } from "./Header";
import { HomeScreen } from "./HomeScreen";
import { ResultsScreen } from "./ResultsScreen";
import { RoundHud } from "./RoundHud";
import { useNow } from "./useNow";

export function App() {
  const { puzzle, game, history, start, pin, tick, resetToday } = useGame();
  const running = game.phase === "countdown" || game.phase === "playing" || game.phase === "reveal";
  const now = useNow(running, tick);

  // Fetch all of today's photos during the countdown so rounds show them instantly.
  useEffect(() => {
    if (game.phase !== "countdown") return;
    for (const c of puzzle.countries) if (c.capitalWikidata) fetchPhoto(c.capitalWikidata);
  }, [game.phase, puzzle.countries]);

  const today = history[puzzle.key];
  const inRound = game.phase === "playing" || game.phase === "reveal";
  const country = inRound ? puzzle.countries[game.round] : undefined;
  const result = game.phase === "reveal" ? (game.guesses[game.round] ?? null) : null;

  return (
    <main className="flex h-full flex-col bg-slate-50 text-slate-900">
      <Header puzzle={puzzle.number} onDevReset={import.meta.env.DEV ? resetToday : undefined} />
      <div className="relative flex-1 overflow-hidden">
        <WorldMap
          focusId={country?.id ?? null}
          focusInclude={country?.lngLat}
          pin={result?.lngLat ?? null}
          answer={result ? (country?.lngLat ?? null) : null}
          onPick={game.phase === "playing" ? pin : undefined}
        />
        {game.phase === "countdown" && (
          <Countdown seconds={Math.max(1, Math.ceil((game.endsAt - now) / 1000))} />
        )}
        {country && (
          <RoundHud
            round={game.round}
            rounds={puzzle.countries.length}
            country={country}
            timeLeft={game.phase === "playing" ? Math.max(0, (game.endsAt - now) / ROUND_MS) : null}
            result={result}
          />
        )}
        {!running &&
          (today ? (
            <ResultsScreen
              result={today}
              countries={puzzle.countries}
              stats={computeStats(history, puzzle.key)}
              now={now}
            />
          ) : (
            <HomeScreen onStart={start} />
          ))}
      </div>
    </main>
  );
}
