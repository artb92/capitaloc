import { LANGS } from "@/features/i18n/messages";
import { useI18n, useLang } from "@/features/i18n/useI18n";
import { Logo } from "./Logo";

export function Header({ puzzle, onDevReset }: { puzzle: number; onDevReset?: () => void }) {
  const { lang, t } = useI18n();
  const setLang = useLang((s) => s.setLang);
  return (
    <header className="relative z-20 flex items-center gap-3 bg-ink-950 px-4 py-3 text-white">
      <h1 className="shrink-0">
        <Logo />
        <span className="sr-only">Capitaloc</span>
      </h1>
      <span className="shrink-0 whitespace-nowrap text-ink-200/70 text-sm">{t.puzzle(puzzle)}</span>
      {onDevReset && (
        <button
          type="button"
          onClick={onDevReset}
          className="ml-auto min-w-0 truncate rounded-md border border-accent/50 px-2 py-1 text-accent text-xs transition hover:bg-accent/10"
        >
          Reset (dev)
        </button>
      )}
      <fieldset
        className={`${onDevReset ? "" : "ml-auto "}flex rounded-lg bg-white/10 p-0.5 text-xs`}
        aria-label={t.language}
      >
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`rounded-md px-2.5 py-1 font-semibold uppercase transition ${lang === l ? "bg-white text-ink-950" : "text-ink-200 hover:text-white"}`}
          >
            {l}
          </button>
        ))}
      </fieldset>
    </header>
  );
}
