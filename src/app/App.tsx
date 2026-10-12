import { useEffect } from "react";
import { fetchPhoto } from "@/features/game/capitalPhoto";
import { computeStats } from "@/features/game/history";
import { ROUND_MS, TRAVEL_MS } from "@/features/game/logic";
import { useGame } from "@/features/game/store";
import { useBasemap } from "@/features/map/basemap";
import { countryBounds } from "@/features/map/countries";
import { preloadTiles } from "@/features/map/tiles";
import { WorldMap } from "@/features/map/WorldMap";
import { Countdown } from "./Countdown";
import { Header } from "./Header";
import { HomeScreen } from "./HomeScreen";
import { ResultsScreen } from "./ResultsScreen";
import { RoundHud } from "./RoundHud";
import { useNow } from "./useNow";

export function App() {
  const { puzzle, game, history, start, pin, tick, resetToday } = useGame();
  const { basemap, toggle: toggleBasemap } = useBasemap();
  const running = game.phase === "countdown" || game.phase === "playing" || game.phase === "reveal";
  const now = useNow(running, tick);

  // Fetch all of today's photos during the countdown so rounds show them instantly.
  useEffect(() => {
    if (game.phase !== "countdown") return;
    for (const c of puzzle.countries) if (c.capitalWikidata) fetchPhoto(c.capitalWikidata);
  }, [game.phase, puzzle.countries]);

  // Map tiles are small and same-origin: warm today's close-ups as soon as the page opens.
  useEffect(() => {
    for (const c of puzzle.countries) {
      const bounds = countryBounds(c.id, c.lngLat);
      if (bounds) preloadTiles(basemap, bounds);
    }
  }, [basemap, puzzle.countries]);

  const today = history[puzzle.key];
  const inRound = game.phase === "playing" || game.phase === "reveal";
  const country = inRound ? puzzle.countries[game.round] : undefined;
  const result = game.phase === "reveal" ? (game.guesses[game.round] ?? null) : null;

  return (
    <main className="flex h-full flex-col bg-ink-950 text-ink-900">
      <Header
        puzzle={puzzle.number}
        dev={
          import.meta.env.DEV
            ? { onReset: resetToday, basemap, onToggleBasemap: toggleBasemap }
            : undefined
        }
      />
      <div className="relative flex-1 overflow-hidden">
        <WorldMap
          focusId={country?.id ?? null}
          focusInclude={country?.lngLat}
          travelMs={TRAVEL_MS}
          pin={result?.lngLat ?? null}
          answer={result ? (country?.lngLat ?? null) : null}
          onPick={game.phase === "playing" ? pin : undefined}
        />
        {/* Blocks the map during the camera flight: a press would stop the flight mid-way. */}
        {(game.phase === "countdown" || (game.phase === "playing" && now < game.startsAt)) && (
          <div className="absolute inset-0 z-[5]" />
        )}
        {game.phase === "countdown" && (
          <Countdown seconds={Math.max(1, Math.ceil((game.endsAt - now) / 1000))} />
        )}
        {country && (
          <RoundHud
            round={game.round}
            rounds={puzzle.countries.length}
            country={country}
            guesses={game.guesses}
            timeLeft={
              game.phase === "playing"
                ? Math.min(1, Math.max(0, (game.endsAt - now) / ROUND_MS))
                : null
            }
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
