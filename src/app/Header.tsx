import { LANGS } from "@/features/i18n/messages";
import { useI18n, useLang } from "@/features/i18n/useI18n";
import type { Basemap } from "@/features/map/basemap";
import { Logo } from "./Logo";

/** Dev-only controls (English only, never shipped): replay today, switch the base map. */
type DevTools = { onReset: () => void; basemap: Basemap; onToggleBasemap: () => void };

const DEV_BUTTON =
  "min-w-0 truncate rounded-md border border-accent/50 px-2 py-1 text-accent text-xs transition hover:bg-accent/10";

export function Header({ puzzle, dev }: { puzzle: number; dev?: DevTools }) {
  const { lang, t } = useI18n();
  const setLang = useLang((s) => s.setLang);
  return (
    <header className="relative z-20 flex items-center gap-3 bg-ink-950 px-4 py-3 text-white">
      <h1 className="shrink-0">
        <Logo />
        <span className="sr-only">Capitaloc</span>
      </h1>
      <span className="shrink-0 whitespace-nowrap text-ink-200/70 text-sm">{t.puzzle(puzzle)}</span>
      {dev && (
        <>
          <button type="button" onClick={dev.onToggleBasemap} className={`ml-auto ${DEV_BUTTON}`}>
            Map: {dev.basemap}
          </button>
          <button type="button" onClick={dev.onReset} className={DEV_BUTTON}>
            Reset (dev)
          </button>
        </>
      )}
      <fieldset
        className={`${dev ? "" : "ml-auto "}flex rounded-lg bg-white/10 p-0.5 text-xs`}
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
