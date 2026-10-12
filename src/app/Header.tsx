import { LANGS } from "@/features/i18n/messages";
import { useI18n, useLang } from "@/features/i18n/useI18n";
import { Logo } from "./Logo";

export function Header({ puzzle, onDevReset }: { puzzle: number; onDevReset?: () => void }) {
  const { lang, t } = useI18n();
  const setLang = useLang((s) => s.setLang);
  return (
    <header className="relative z-20 flex items-center justify-between border-slate-200 border-b bg-white/90 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <h1>
          <Logo />
          <span className="sr-only">Capitaloc</span>
        </h1>
        <span className="whitespace-nowrap text-slate-500 text-sm">{t.puzzle(puzzle)}</span>
      </div>
      {onDevReset && (
        <button
          type="button"
          onClick={onDevReset}
          className="ml-auto mr-2 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 font-medium text-amber-800 text-xs"
        >
          Reset (dev)
        </button>
      )}
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
