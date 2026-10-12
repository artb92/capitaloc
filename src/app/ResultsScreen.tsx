import type { Country } from "@/features/game/countries";
import type { DayResult, Stats } from "@/features/game/history";
import { useI18n } from "@/features/i18n/useI18n";
import { MAX_ROUND_SCORE } from "@/lib/scoring";
import { Card } from "./Card";

type Props = { result: DayResult; countries: Country[]; stats: Stats; now: number };

function untilMidnight(now: number): string {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  const s = Math.max(0, Math.floor((next - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function ResultsScreen({ result, countries, stats, now }: Props) {
  const { lang, t } = useI18n();
  const max = MAX_ROUND_SCORE * countries.length;
  return (
    <Card>
      <p className="text-center text-slate-500 text-sm uppercase tracking-wide">{t.total}</p>
      <p className="text-center font-display font-extrabold text-5xl tracking-tight">
        {result.total.toLocaleString(lang)}
        <span className="font-medium text-2xl text-slate-400"> / {max.toLocaleString(lang)}</span>
      </p>
      <ul className="mt-5 divide-y divide-slate-100 text-sm">
        {countries.map((c, i) => {
          const g = result.guesses[i];
          return (
            <li key={c.id} className="flex items-center justify-between gap-3 py-1.5">
              <span className="min-w-0 truncate">
                <span className="font-medium">{c.name[lang]}</span>
                <span className="text-slate-500"> · {c.capital[lang]}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="text-slate-500">
                  {g?.distanceKm == null ? t.noAnswer : t.km(Math.round(g.distanceKm))}
                </span>
                <span className="ml-2 inline-block w-16 font-semibold">
                  {t.points(g?.score ?? 0)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {(
          [
            [t.played, stats.played],
            [t.streak, stats.streak],
            [t.maxStreak, stats.maxStreak],
            [t.best, stats.best.toLocaleString(lang)],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dd className="font-bold text-xl">{value}</dd>
            <dt className="text-slate-500 text-xs">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-center text-slate-600 text-sm">
        {t.comeBack} {t.nextIn(untilMidnight(now))}
      </p>
    </Card>
  );
}
