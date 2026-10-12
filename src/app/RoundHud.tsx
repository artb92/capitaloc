import { useCapitalPhoto } from "@/features/game/capitalPhoto";
import type { Country } from "@/features/game/countries";
import type { Guess } from "@/features/game/logic";
import { useI18n } from "@/features/i18n/useI18n";

type Props = {
  round: number;
  rounds: number;
  country: Country;
  /** 0–1 share of the round time left; null during the reveal. */
  timeLeft: number | null;
  result: Guess | null;
};

export function RoundHud({ round, rounds, country, timeLeft, result }: Props) {
  const { lang, t } = useI18n();
  const photo = useCapitalPhoto(country.capitalWikidata);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/95 shadow-lg backdrop-blur">
        {photo && (
          <div className="relative h-28 bg-slate-200 sm:h-36">
            <img
              src={photo.src}
              alt={t.capitalPhoto}
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement?.remove();
              }}
            />
            <a
              href={photo.page}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto absolute right-1.5 bottom-1 rounded bg-black/40 px-1.5 text-[10px] text-white/90"
            >
              Wikimedia Commons
            </a>
          </div>
        )}
        <div className="px-4 pt-3 pb-2 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-wide">
            {t.round(round + 1, rounds)}
          </p>
          <p className="font-display font-extrabold text-2xl tracking-tight">
            {country.name[lang]}
          </p>
          {result && (
            <p className="mt-1 text-sm" aria-live="polite">
              <span className="font-semibold text-emerald-700">{country.capital[lang]}</span>
              {" · "}
              {result.distanceKm === null ? (
                <span className="text-rose-600">{t.tooSlow}</span>
              ) : (
                <span>{t.km(Math.round(result.distanceKm))}</span>
              )}
              {" · "}
              <span className="font-semibold">{t.points(result.score)}</span>
              {result.timeMs != null && (
                <span className="text-slate-500"> · {t.seconds(result.timeMs / 1000)}</span>
              )}
            </p>
          )}
        </div>
        <div className="h-1.5 bg-slate-100">
          {timeLeft !== null && (
            <div
              className={`h-full ${timeLeft < 0.3 ? "bg-rose-600" : "bg-slate-800"}`}
              style={{ width: `${timeLeft * 100}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
