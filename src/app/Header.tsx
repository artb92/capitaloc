import { LANGS } from "@/features/i18n/messages";
import { useI18n, useLang } from "@/features/i18n/useI18n";

export function Header({ puzzle }: { puzzle: number }) {
  const { lang, t } = useI18n();
  const setLang = useLang((s) => s.setLang);
  return (
    <header className="relative z-20 flex items-center justify-between border-slate-200 border-b bg-white/90 px-4 py-2.5 backdrop-blur">
      <div className="flex items-baseline gap-2">
        <h1 className="font-bold text-lg tracking-tight">
          Capital<span className="text-rose-600">oc</span>
        </h1>
        <span className="text-slate-500 text-sm">{t.puzzle(puzzle)}</span>
      </div>
      <fieldset className="flex rounded-full bg-slate-100 p-0.5 text-xs" aria-label={t.language}>
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`rounded-full px-2.5 py-1 font-medium uppercase ${lang === l ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            {l}
          </button>
        ))}
      </fieldset>
    </header>
  );
}
