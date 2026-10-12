import { useEffect, useState } from "react";
import type { Country } from "@/features/game/countries";
import type { DayResult, Stats } from "@/features/game/history";
import { useI18n } from "@/features/i18n/useI18n";
import { MAX_ROUND_SCORE } from "@/lib/scoring";
import { Card } from "./Card";
import { ScoreStrip } from "./ScoreStrip";
import { tierColor } from "./tier";

type Props = { result: DayResult; countries: Country[]; stats: Stats; now: number };

function untilMidnight(now: number): string {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  const s = Math.max(0, Math.floor((next - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Counts up to `target`, easing out; instant for people who prefer reduced motion. */
function useCountUp(target: number, ms = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setValue(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

export function ResultsScreen({ result, countries, stats, now }: Props) {
  const { lang, t } = useI18n();
  const max = MAX_ROUND_SCORE * countries.length;
  const shown = useCountUp(result.total);
  return (
    <Card>
      <p className="text-ink-500 text-sm">{t.total}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-extrabold text-6xl leading-none tracking-tight">
          {shown.toLocaleString(lang)}
        </span>
        <span className="text-ink-500">{t.outOf(max)}</span>
      </p>
      <ScoreStrip
        guesses={result.guesses}
        rounds={countries.length}
        className="mt-4 [&>span]:h-2.5"
      />
      <ul className="mt-5 text-sm">
        {countries.map((c, i) => {
          const g = result.guesses[i];
          const score = g?.score ?? 0;
          return (
            <li
              key={c.id}
              className="grid grid-cols-[1fr_auto_4.5rem] items-center gap-3 border-ink-100 border-t py-2 motion-safe:animate-rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="min-w-0 truncate">
                <span className="font-semibold">{c.name[lang]}</span>
                <span className="text-ink-500"> {c.capital[lang]}</span>
              </span>
              <span className="text-ink-500">
                {g?.distanceKm == null ? t.noAnswer : t.km(Math.round(g.distanceKm))}
              </span>
              <span className="flex items-center justify-end gap-1.5 font-bold">
                <span className="size-2 rounded-full" style={{ background: tierColor(score) }} />
                {score.toLocaleString(lang)}
              </span>
            </li>
          );
        })}
      </ul>
      <dl className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-ink-100/70 p-3 text-center">
        {(
          [
            [t.played, stats.played],
            [t.streak, stats.streak],
            [t.maxStreak, stats.maxStreak],
            [t.best, stats.best.toLocaleString(lang)],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-ink-500 text-xs leading-tight">{label}</dt>
            <dd className="font-bold text-xl">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-center text-ink-500 text-sm">
        {t.comeBack} {t.nextIn(untilMidnight(now))}
      </p>
    </Card>
  );
}
