import { useState } from "react";
import { useCapitalPhoto } from "@/features/game/capitalPhoto";
import type { Country } from "@/features/game/countries";
import type { Guess } from "@/features/game/logic";
import { useI18n } from "@/features/i18n/useI18n";
import { ScoreStrip } from "./ScoreStrip";
import { tierColor } from "./tier";

type Props = {
  round: number;
  rounds: number;
  country: Country;
  guesses: readonly Guess[];
  /** 0–1 share of the round time left; null during the reveal. */
  timeLeft: number | null;
  result: Guess | null;
};

export function RoundHud({ round, rounds, country, guesses, timeLeft, result }: Props) {
  const { lang, t } = useI18n();
  const photo = useCapitalPhoto(country.capitalWikidata);
  const [loaded, setLoaded] = useState<string | null>(null);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
      <section
        aria-live="polite"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-ink-900 shadow-[0_20px_50px_-20px_rgb(13_30_44/0.8)]"
      >
        {photo && (
          <div className="relative h-28 bg-ink-100 sm:h-36">
            <img
              src={photo.src}
              alt={t.capitalPhoto}
              onLoad={() => setLoaded(photo.src)}
              onError={(e) => {
                e.currentTarget.parentElement?.remove();
              }}
              className={`size-full object-cover transition-opacity duration-500 ${loaded === photo.src ? "opacity-100" : "opacity-0"}`}
            />
            <a
              href={photo.page}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto absolute right-2 bottom-1.5 rounded bg-ink-950/50 px-1.5 text-[10px] text-white/90 hover:bg-ink-950/70"
            >
              Wikimedia Commons
            </a>
          </div>
        )}
        <div className="px-5 pt-3.5 pb-4">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-ink-500 text-xs">
              {t.round(round + 1, rounds)}
            </span>
            <ScoreStrip guesses={guesses} rounds={rounds} current={round} className="flex-1" />
          </div>
          <p
            key={round}
            className="mt-1.5 font-extrabold text-3xl leading-tight tracking-tight motion-safe:animate-rise"
          >
            {country.name[lang]}
          </p>
          {result ? (
            <div className="mt-2 flex items-center justify-between gap-3 motion-safe:animate-rise">
              <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                  <path
                    d="M12 2.5l2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z"
                    fill="var(--color-accent)"
                    stroke="var(--color-accent-dark)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="truncate">{country.capital[lang]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-sm">
                <span className="text-ink-500">
                  {result.distanceKm === null ? t.tooSlow : t.km(Math.round(result.distanceKm))}
                </span>
                {result.timeMs != null && (
                  <span className="text-ink-500">{t.seconds(result.timeMs / 1000)}</span>
                )}
                <span className="flex items-center gap-1.5 font-bold">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: tierColor(result.score) }}
                  />
                  {t.points(result.score)}
                </span>
              </span>
            </div>
          ) : (
            <>
              <p
                key={`cta-${round}`}
                className="mt-1 flex items-center gap-1.5 font-semibold text-accent-dark text-sm motion-safe:animate-rise"
              >
                <svg viewBox="15 10 34 48" className="h-4 w-3 shrink-0" aria-hidden="true">
                  <path
                    d="M32 56s-15-14.6-15-29a15 15 0 0 1 30 0c0 14.4-15 29-15 29z"
                    fill="currentColor"
                  />
                  <circle cx="32" cy="27" r="5.5" fill="#fff" />
                </svg>
                {t.pinpoint}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${timeLeft !== null && timeLeft < 0.3 ? "bg-poor" : "bg-accent"}`}
                  style={{ width: `${(timeLeft ?? 1) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
