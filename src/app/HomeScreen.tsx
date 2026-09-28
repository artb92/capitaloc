import { useI18n } from "@/features/i18n/useI18n";
import { Card } from "./Card";

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <p className="text-center font-semibold text-xl">{t.tagline}</p>
      <h2 className="mt-5 font-medium text-slate-500 text-sm uppercase tracking-wide">
        {t.howToPlay}
      </h2>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-slate-700">
        {t.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 w-full rounded-xl bg-rose-600 py-3 font-semibold text-lg text-white shadow transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2"
      >
        {t.start}
      </button>
    </Card>
  );
}
