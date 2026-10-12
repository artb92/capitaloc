import { useI18n } from "@/features/i18n/useI18n";
import { Card } from "./Card";

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <h2 className="text-balance font-extrabold text-4xl leading-none tracking-tight">
        {t.title}
      </h2>
      <p className="mt-2 text-ink-500 text-lg">{t.subtitle}</p>
      <h3 className="mt-7 font-semibold text-ink-900 text-sm">{t.howToPlay}</h3>
      <ol className="mt-3 space-y-3">
        {t.rules.map((rule, i) => (
          <li key={rule} className="flex gap-3 text-ink-700 leading-snug">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-100 font-semibold text-ink-900 text-xs">
              {i + 1}
            </span>
            <span className="text-pretty">{rule}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 w-full rounded-xl bg-accent py-3.5 font-bold text-ink-950 text-lg shadow-[0_10px_30px_-10px_rgb(240_168_48/0.8)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-accent-dark focus-visible:outline-offset-2 active:scale-[0.98]"
      >
        {t.start}
      </button>
    </Card>
  );
}
